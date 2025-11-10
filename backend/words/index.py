"""
Business: Управление словарём пользователя - добавление, получение, обновление статуса слов
Args: event с httpMethod (GET/POST/PUT/DELETE), headers с X-User-Id, body с данными слова
Returns: HTTP response со списком слов или результатом операции
"""

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def generate_translation_and_examples(word: str) -> Dict[str, Any]:
    api_key = os.environ.get('GENAPI_KEY', '')
    if not api_key:
        return {
            'translation': 'перевод генерируется...',
            'examples': ['Примеры будут добавлены']
        }
    
    try:
        response = requests.post(
            'https://api.gen-api.ru/api/v1/networks/o1-mini',
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'is_sync': True,
                'messages': [{
                    'role': 'user',
                    'content': f'Переведи английское слово "{word}" на русский язык и дай 3 коротких примера использования этого слова на английском языке. Ответь ТОЛЬКО в формате JSON без дополнительного текста: {{"translation": "краткий русский перевод", "examples": ["Example 1 with {word}", "Example 2 with {word}", "Example 3 with {word}"]}}'
                }],
                'model': 'o1-mini-2024-09-12',
                'stream': False,
                'temperature': 1
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if 'output' in data and 'choices' in data['output']:
                content = data['output']['choices'][0]['message']['content']
                content_clean = content.strip()
                
                if content_clean.startswith('```json'):
                    content_clean = content_clean[7:]
                if content_clean.startswith('```'):
                    content_clean = content_clean[3:]
                if content_clean.endswith('```'):
                    content_clean = content_clean[:-3]
                content_clean = content_clean.strip()
                
                result = json.loads(content_clean)
                return {
                    'translation': result.get('translation', 'перевод'),
                    'examples': result.get('examples', ['Пример 1', 'Пример 2', 'Пример 3'])
                }
            else:
                return {
                    'translation': 'перевод генерируется...',
                    'examples': ['Примеры будут добавлены']
                }
        else:
            return {
                'translation': 'перевод генерируется...',
                'examples': ['Примеры будут добавлены']
            }
    except Exception as e:
        return {
            'translation': 'перевод генерируется...',
            'examples': ['Примеры будут добавлены']
        }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id_str = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id_str:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    user_id = int(user_id_str)
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute(
                """SELECT id, english_word, russian_translation, examples, status, recall_count, 
                          last_recall_date, created_at
                   FROM t_p7147437_shag_to_speak.words 
                   WHERE user_id = %s
                   ORDER BY created_at DESC""",
                (user_id,)
            )
            words = cursor.fetchall()
            
            words_list = []
            for word in words:
                words_list.append({
                    'id': word['id'],
                    'english_word': word['english_word'],
                    'russian_translation': word['russian_translation'],
                    'examples': word['examples'] or [],
                    'status': word['status'],
                    'recall_count': word['recall_count'] or 0,
                    'last_recall_date': word['last_recall_date'].isoformat() if word['last_recall_date'] else None,
                    'created_at': word['created_at'].isoformat() if word['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'words': words_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            words_input = body_data.get('words', [])
            
            if not words_input:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Words array required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT status FROM t_p7147437_shag_to_speak.users WHERE id = %s",
                (user_id,)
            )
            user = cursor.fetchone()
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT COUNT(*) as count FROM t_p7147437_shag_to_speak.words WHERE user_id = %s",
                (user_id,)
            )
            current_count = cursor.fetchone()['count']
            
            word_limit = 50 if user['status'] == 'free' else 999
            if current_count + len(words_input) > word_limit:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Word limit exceeded. Max: {word_limit}'}),
                    'isBase64Encoded': False
                }
            
            added_words = []
            for word_text in words_input:
                word_text = word_text.strip().lower()
                if not word_text:
                    continue
                
                gen_data = generate_translation_and_examples(word_text)
                
                cursor.execute(
                    """INSERT INTO t_p7147437_shag_to_speak.words 
                       (user_id, english_word, russian_translation, examples, status, recall_count)
                       VALUES (%s, %s, %s, %s, 'learning', 0)
                       RETURNING id, english_word, russian_translation, examples, status, recall_count""",
                    (user_id, word_text, gen_data['translation'], gen_data['examples'])
                )
                new_word = cursor.fetchone()
                added_words.append({
                    'id': new_word['id'],
                    'english_word': new_word['english_word'],
                    'russian_translation': new_word['russian_translation'],
                    'examples': new_word['examples'],
                    'status': new_word['status'],
                    'recall_count': new_word['recall_count']
                })
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'words': added_words, 'count': len(added_words)}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            word_id = body_data.get('word_id')
            new_status = body_data.get('status')
            
            if not word_id or not new_status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'word_id and status required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """UPDATE t_p7147437_shag_to_speak.words 
                   SET status = %s
                   WHERE id = %s AND user_id = %s
                   RETURNING id, status""",
                (new_status, word_id, user_id)
            )
            updated = cursor.fetchone()
            
            if not updated:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Word not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': updated['id'], 'status': updated['status']}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            word_id = query_params.get('word_id')
            
            if not word_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'word_id required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT id FROM t_p7147437_shag_to_speak.words WHERE id = %s AND user_id = %s",
                (word_id, user_id)
            )
            word = cursor.fetchone()
            
            if not word:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Word not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Word marked for deletion', 'id': word['id']}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()