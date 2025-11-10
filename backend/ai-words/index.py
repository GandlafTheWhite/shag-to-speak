"""
Business: ИИ-генерация слов по запросу пользователя через GenAPI
Args: event с httpMethod (POST), headers с X-User-Id, body с prompt
Returns: HTTP response со списком сгенерированных слов
"""

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def generate_words_by_prompt(prompt: str, count: int = 15) -> List[Dict[str, Any]]:
    api_key = os.environ.get('GENAPI_KEY', '')
    if not api_key:
        return []
    
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
                    'content': f'На основе запроса пользователя: "{prompt}" - подбери {count} английских слов которые соответствуют этой теме. Для каждого слова дай русский перевод и 3 коротких примера использования на английском. Ответь ТОЛЬКО в формате JSON массива без дополнительного текста: [{{"word": "english_word", "translation": "русский перевод", "examples": ["Example 1", "Example 2", "Example 3"]}}]'
                }],
                'model': 'o1-mini-2024-09-12',
                'stream': False,
                'temperature': 1
            },
            timeout=45
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
                return result[:count]
            else:
                return []
        else:
            return []
    except Exception as e:
        return []

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
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
    
    body_data = json.loads(event.get('body', '{}'))
    prompt = body_data.get('prompt', '').strip()
    count = body_data.get('count', 15)
    
    if not prompt:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Prompt required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
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
        if current_count + count > word_limit:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Word limit exceeded. Max: {word_limit}'}),
                'isBase64Encoded': False
            }
        
        generated_words = generate_words_by_prompt(prompt, count)
        
        if not generated_words:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Failed to generate words'}),
                'isBase64Encoded': False
            }
        
        added_words = []
        for word_data in generated_words:
            word_text = word_data.get('word', '').strip().lower()
            translation = word_data.get('translation', 'перевод')
            examples = word_data.get('examples', ['Пример 1', 'Пример 2', 'Пример 3'])
            
            if not word_text:
                continue
            
            cursor.execute(
                """INSERT INTO t_p7147437_shag_to_speak.words 
                   (user_id, english_word, russian_translation, examples, status, recall_count)
                   VALUES (%s, %s, %s, %s, 'learning', 0)
                   RETURNING id, english_word, russian_translation, examples, status, recall_count""",
                (user_id, word_text, translation, examples)
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
            'body': json.dumps({
                'words': added_words,
                'count': len(added_words),
                'prompt': prompt
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
