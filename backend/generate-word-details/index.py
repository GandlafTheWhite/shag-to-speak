"""
Business: Фоновая генерация перевода, примеров и категории для слова
Args: event с httpMethod POST, headers с X-User-Id, body с word_id
Returns: HTTP response с обновленными данными слова
"""

import json
import os
from typing import Dict, Any
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
            'translation': '...',
            'examples': ['Ошибка генерации'],
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
                return {
                    'translation': result.get('translation', '...'),
                    'examples': result.get('examples', ['Пример 1', 'Пример 2', 'Пример 3']),
                    'category': 'uncategorized'
                }
        
        return {
            'translation': '...',
            'examples': ['Ошибка генерации'],
            'category': 'uncategorized'
        }
    except Exception as e:
        print(f'Error generating translation for "{word}": {str(e)}')
        return {
            'translation': '...',
            'examples': ['Ошибка генерации'],
            'category': 'uncategorized'
        }

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
    word_id = body_data.get('word_id')
    
    if not word_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'word_id required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        print(f'Generating details for word_id={word_id}, user_id={user_id}')
        
        cursor.execute(
            """SELECT id, english_word, user_id 
               FROM t_p7147437_shag_to_speak.words 
               WHERE id = %s AND user_id = %s""",
            (word_id, user_id)
        )
        word = cursor.fetchone()
        
        if not word:
            print(f'Word not found: word_id={word_id}, user_id={user_id}')
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Word not found'}),
                'isBase64Encoded': False
            }
        
        print(f'Found word: {word["english_word"]}')
        gen_data = generate_translation_and_examples(word['english_word'])
        print(f'Generated data: translation={gen_data["translation"]}, category={gen_data["category"]}')
        
        cursor.execute(
            """UPDATE t_p7147437_shag_to_speak.words 
               SET russian_translation = %s, examples = %s, category = %s
               WHERE id = %s
               RETURNING id, english_word, russian_translation, examples, status, recall_count, category""",
            (gen_data['translation'], gen_data['examples'], gen_data['category'], word_id)
        )
        updated_word = cursor.fetchone()
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'word': {
                    'id': updated_word['id'],
                    'english_word': updated_word['english_word'],
                    'russian_translation': updated_word['russian_translation'],
                    'examples': updated_word['examples'],
                    'status': updated_word['status'],
                    'recall_count': updated_word['recall_count'],
                    'category': updated_word['category']
                }
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        print(f'Error generating word details: {str(e)}')
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()