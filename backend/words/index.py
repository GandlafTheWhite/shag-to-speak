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

CATEGORIES = [
    'people_family', 'appearance', 'character_personality', 'emotions_feelings',
    'health_medicine', 'body_parts', 'clothes_fashion', 'food_drink',
    'cooking_kitchen', 'house_home', 'furniture_appliances', 'daily_routine',
    'work_jobs', 'business_money', 'education_school', 'university_studies',
    'science_technology', 'computers_internet', 'sport_fitness', 'hobbies_free_time',
    'music', 'art_literature', 'cinema_theatre', 'media_news',
    'travel_transport', 'countries_nationalities', 'languages', 'weather',
    'nature_environment', 'animals_pets', 'plants_gardening', 'city_countryside',
    'shops_shopping', 'services', 'crime_law', 'politics_government',
    'war_peace', 'history', 'religion', 'society_social_issues',
    'holidays_celebrations', 'time_dates', 'numbers_quantities', 'colours',
    'shapes_sizes', 'materials', 'tools_equipment'
]

def categorize_word(word: str) -> str:
    api_key = os.environ.get('GENAPI_KEY', '')
    if not api_key:
        return 'uncategorized'
    
    try:
        response = requests.post(
            'https://api.gen-api.ru/api/v1/networks/o1-mini',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'is_sync': True,
                'messages': [{
                    'role': 'user',
                    'content': f'Определи к какой категории относится английское слово "{word}". Выбери ОДНУ категорию из списка: {", ".join(CATEGORIES)}. Ответь ТОЛЬКО названием категории, без дополнительного текста.'
                }],
                'model': 'o1-mini-2024-09-12',
                'stream': False
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            content = None
            if 'response' in data and len(data['response']) > 0:
                content = data['response'][0]['message']['content']
            elif 'output' in data and 'choices' in data['output']:
                content = data['output']['choices'][0]['message']['content']
            
            if content:
                category = content.strip().lower().replace(' ', '_').replace('&', '').replace('–', '_')
                if category in CATEGORIES:
                    return category
        
        return 'uncategorized'
    except Exception as e:
        print(f'Error categorizing word "{word}": {str(e)}')
        return 'uncategorized'

def generate_translation_and_examples(word: str) -> Dict[str, Any]:
    api_key = os.environ.get('GENAPI_KEY', '')
    if not api_key:
        return {
            'translation': 'перевод генерируется...',
            'examples': ['Примеры будут добавлены'],
            'category': 'uncategorized'
        }
    
    try:
        response = requests.post(
            'https://api.gen-api.ru/api/v1/networks/o1-mini',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'is_sync': True,
                'messages': [{
                    'role': 'user',
                    'content': f'Переведи английское слово "{word}" на русский язык и дай 3 коротких примера использования этого слова на английском языке. Ответь ТОЛЬКО в формате JSON без дополнительного текста: {{"translation": "краткий русский перевод", "examples": ["Example 1 with {word}", "Example 2 with {word}", "Example 3 with {word}"]}}'
                }],
                'model': 'o1-mini-2024-09-12',
                'stream': False
            },
            timeout=45
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f'GenAPI response for "{word}": {json.dumps(data)}')
            
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
                
                print(f'Cleaned content for "{word}": {content_clean}')
                
                result = json.loads(content_clean)
                category = categorize_word(word)
                return {
                    'translation': result.get('translation', 'перевод'),
                    'examples': result.get('examples', ['Пример 1', 'Пример 2', 'Пример 3']),
                    'category': category
                }
            else:
                print(f'GenAPI response missing expected structure for "{word}"')
                return {
                    'translation': 'перевод генерируется...',
                    'examples': ['Примеры будут добавлены'],
                    'category': 'uncategorized'
                }
        else:
            print(f'GenAPI returned status {response.status_code} for "{word}"')
            return {
                'translation': 'перевод генерируется...',
                'examples': ['Примеры будут добавлены'],
                'category': 'uncategorized'
            }
    except Exception as e:
        print(f'Error generating translation for "{word}": {str(e)}')
        return {
            'translation': 'перевод генерируется...',
            'examples': ['Примеры будут добавлены'],
            'category': 'uncategorized'
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
                          last_recall_date, created_at, category
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
                    'created_at': word['created_at'].isoformat() if word['created_at'] else None,
                    'category': word.get('category', 'uncategorized')
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
            duplicate_words = []
            
            for word_text in words_input:
                word_text = word_text.strip().lower()
                if not word_text:
                    continue
                
                cursor.execute(
                    "SELECT id FROM t_p7147437_shag_to_speak.words WHERE user_id = %s AND english_word = %s",
                    (user_id, word_text)
                )
                existing = cursor.fetchone()
                
                if existing:
                    duplicate_words.append(word_text)
                    continue
                
                cursor.execute(
                    """INSERT INTO t_p7147437_shag_to_speak.words 
                       (user_id, english_word, russian_translation, examples, status, recall_count, category)
                       VALUES (%s, %s, %s, %s, 'learning', 0, %s)
                       RETURNING id, english_word, russian_translation, examples, status, recall_count, category""",
                    (user_id, word_text, '...', ['Генерация примеров...'], 'uncategorized')
                )
                new_word = cursor.fetchone()
                added_words.append({
                    'id': new_word['id'],
                    'english_word': new_word['english_word'],
                    'russian_translation': new_word['russian_translation'],
                    'examples': new_word['examples'],
                    'status': new_word['status'],
                    'recall_count': new_word['recall_count'],
                    'category': new_word.get('category', 'uncategorized'),
                    'is_generating': True
                })
            
            if duplicate_words and not added_words:
                words_list = ', '.join(duplicate_words)
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Эти слова уже есть в твоём словаре :) — {words_list}'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            response_data = {
                'words': added_words,
                'count': len(added_words)
            }
            
            if duplicate_words:
                response_data['duplicates'] = duplicate_words
                response_data['message'] = f'Эти слова уже есть в словаре: {", ".join(duplicate_words)}'
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(response_data),
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