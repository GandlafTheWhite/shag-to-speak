"""
Business: Управление фразами пользователя - добавление, получение, удаление фраз/предложений
Args: event с httpMethod (GET/POST/DELETE), headers с X-User-Id, body с данными фразы
Returns: HTTP response со списком фраз или результатом операции
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests


def translate_phrase(phrase_text: str) -> str:
    """Переводит фразу с английского на русский через GENAPI"""
    api_key = os.environ.get('GENAPI_KEY', '')
    if not api_key:
        return '...'
    
    prompt = f'''You are translating English phrases and idioms to Russian for language learners.

IMPORTANT: If the phrase is an idiom or expression, provide its MEANING in Russian, NOT literal word-by-word translation.

Examples:
- "break the ice" → "разрядить обстановку, растопить лёд в общении"
- "piece of cake" → "проще простого, пустяковое дело"
- "it costs an arm and a leg" → "стоит целое состояние, безумно дорого"

Now translate this phrase: "{phrase_text}"

Return ONLY valid JSON:
{{
  "translation": "..."
}}'''
    
    try:
        response = requests.post(
            'https://api.gen-api.ru/api/v1/networks/o1-mini',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'is_sync': True,
                'messages': [{'role': 'user', 'content': prompt}],
                'model': 'o1-mini-2024-09-12',
                'stream': False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            content = None
            if 'response' in data and len(data['response']) > 0:
                content = data['response'][0]['message']['content']
            elif 'output' in data and 'choices' in data['output']:
                content = data['output']['choices'][0]['message']['content']
            
            if content:
                content_clean = content.strip()
                if content_clean.startswith('```json'):
                    content_clean = content_clean[7:]
                if content_clean.startswith('```'):
                    content_clean = content_clean[3:]
                if content_clean.endswith('```'):
                    content_clean = content_clean[:-3]
                content_clean = content_clean.strip()
                
                result = json.loads(content_clean)
                return result.get('translation', '...')
    except Exception as e:
        print(f'Error translating phrase: {str(e)}')
    
    return '...'


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
                """SELECT id, english_text, russian_translation, created_at
                   FROM t_p7147437_shag_to_speak.sentences 
                   WHERE user_id = %s
                   ORDER BY created_at DESC""",
                (user_id,)
            )
            sentences = cursor.fetchall()
            
            sentences_list = []
            for sentence in sentences:
                sentences_list.append({
                    'id': sentence['id'],
                    'english_text': sentence['english_text'],
                    'russian_translation': sentence['russian_translation'],
                    'created_at': sentence['created_at'].isoformat() if sentence['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'sentences': sentences_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            english_text = body_data.get('text', '').strip()
            
            if not english_text:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Text required'}),
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
                "SELECT COUNT(*) as words_count FROM t_p7147437_shag_to_speak.words WHERE user_id = %s",
                (user_id,)
            )
            words_count = cursor.fetchone()['words_count']
            
            cursor.execute(
                "SELECT COUNT(*) as sentences_count FROM t_p7147437_shag_to_speak.sentences WHERE user_id = %s",
                (user_id,)
            )
            sentences_count = cursor.fetchone()['sentences_count']
            
            total_count = words_count + sentences_count
            limit = 50 if user['status'] == 'free' else 999
            
            if total_count >= limit:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Лимит достигнут. Максимум: {limit} слов и фраз'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT id FROM t_p7147437_shag_to_speak.sentences WHERE user_id = %s AND english_text = %s",
                (user_id, english_text)
            )
            existing = cursor.fetchone()
            
            if existing:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Эта фраза уже есть в твоём словаре'}),
                    'isBase64Encoded': False
                }
            
            print(f'Translating phrase: {english_text}')
            russian_translation = translate_phrase(english_text)
            print(f'Translation result: {russian_translation}')
            
            cursor.execute(
                """INSERT INTO t_p7147437_shag_to_speak.sentences 
                   (user_id, english_text, russian_translation)
                   VALUES (%s, %s, %s)
                   RETURNING id, english_text, russian_translation, created_at""",
                (user_id, english_text, russian_translation)
            )
            new_sentence = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'sentence': {
                        'id': new_sentence['id'],
                        'english_text': new_sentence['english_text'],
                        'russian_translation': new_sentence['russian_translation'],
                        'created_at': new_sentence['created_at'].isoformat() if new_sentence['created_at'] else None
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            sentence_id = query_params.get('id')
            
            if not sentence_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Sentence ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT id FROM t_p7147437_shag_to_speak.sentences WHERE id = %s AND user_id = %s",
                (sentence_id, user_id)
            )
            sentence = cursor.fetchone()
            
            if not sentence:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Sentence not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "DELETE FROM t_p7147437_shag_to_speak.sentences WHERE id = %s AND user_id = %s",
                (sentence_id, user_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Фраза удалена', 'id': sentence['id']}),
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