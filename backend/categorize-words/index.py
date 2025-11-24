"""
Business: Массовая категоризация всех слов без категории через ИИ
Args: event с httpMethod POST, headers с X-User-Id
Returns: HTTP response с количеством обновленных слов
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

def categorize_words_batch(words: List[str]) -> Dict[str, str]:
    api_key = os.environ.get('GENAPI_KEY', '')
    if not api_key:
        return {word: 'uncategorized' for word in words}
    
    words_list_str = ', '.join(f'"{w}"' for w in words)
    categories_str = ', '.join(CATEGORIES)
    
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
                    'content': f'Распределите английские слова {words_list_str} по категориям. Доступные категории: {categories_str}. Ответьте ТОЛЬКО в формате JSON без дополнительного текста: {{"word1": "category1", "word2": "category2", ...}}. Для каждого слова выберите ОДНУ подходящую категорию из списка.'
                }],
                'model': 'o1-mini-2024-09-12',
                'stream': False
            },
            timeout=60
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
                
                validated_result = {}
                for word, category in result.items():
                    category_normalized = category.strip().lower().replace(' ', '_').replace('&', '').replace('–', '_')
                    if category_normalized in CATEGORIES:
                        validated_result[word] = category_normalized
                    else:
                        validated_result[word] = 'uncategorized'
                
                return validated_result
        
        return {word: 'uncategorized' for word in words}
    except Exception as e:
        print(f'Error categorizing batch: {str(e)}')
        return {word: 'uncategorized' for word in words}

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
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        print(f'Starting batch categorization for user_id={user_id}')
        
        cursor.execute(
            """SELECT id, english_word 
               FROM t_p7147437_shag_to_speak.words 
               WHERE user_id = %s AND category = 'uncategorized'""",
            (user_id,)
        )
        uncategorized_words = cursor.fetchall()
        
        if not uncategorized_words:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'updated': 0, 'message': 'Нет слов для категоризации'}),
                'isBase64Encoded': False
            }
        
        print(f'Found {len(uncategorized_words)} uncategorized words')
        
        words_map = {w['english_word']: w['id'] for w in uncategorized_words}
        words_list = list(words_map.keys())
        
        categories_result = categorize_words_batch(words_list)
        
        updated_count = 0
        for word, category in categories_result.items():
            word_id = words_map.get(word)
            if word_id:
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.words 
                       SET category = %s 
                       WHERE id = %s""",
                    (category, word_id)
                )
                updated_count += 1
        
        conn.commit()
        print(f'Updated {updated_count} words with categories')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'updated': updated_count,
                'message': f'Категоризировано слов: {updated_count}'
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        print(f'Error in batch categorization: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()
