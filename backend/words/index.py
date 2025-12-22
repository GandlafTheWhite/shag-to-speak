"""
Business: Управление словарём пользователя - добавление, получение, обновление статуса слов
Args: event с httpMethod (GET/POST/PUT/DELETE), headers с X-User-Id, body с данными слова
Returns: HTTP response со списком слов или результатом операции
"""

import json
import os
from typing import Dict, Any, List
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def get_user_subscription(cursor: RealDictCursor, user_id: int) -> Dict[str, Any]:
    cursor.execute("""SELECT su.current_tier, su.subscription_status, su.subscription_end, sp.words_limit, sp.exercises_limit, sp.word_sets_limit, sp.status_changes_limit FROM t_p7147437_shag_to_speak.subscription_usage su LEFT JOIN t_p7147437_shag_to_speak.subscription_plans sp ON su.current_tier = sp.tier WHERE su.user_id = %s ORDER BY su.subscription_end DESC NULLS LAST LIMIT 1""", (user_id,))
    sub = cursor.fetchone()
    if not sub:
        return {'tier': 'none', 'is_active': False, 'limits': {'words_limit': 0, 'exercises_limit': 0, 'word_sets_limit': 0, 'status_changes_limit': 0}, 'subscription_end': None}
    now, sub_end = datetime.now(), sub['subscription_end']
    is_active = sub['subscription_status'] == 'active' and sub_end and now < sub_end
    return {'tier': sub['current_tier'] or 'none', 'is_active': is_active, 'limits': {'words_limit': sub['words_limit'] or 0, 'exercises_limit': sub['exercises_limit'] or 0, 'word_sets_limit': sub['word_sets_limit'] or 0, 'status_changes_limit': sub['status_changes_limit'] or 0}, 'subscription_end': sub_end.isoformat() if sub_end else None}

def check_limit(cursor: RealDictCursor, user_id: int, limit_type: str) -> Dict[str, Any]:
    subscription = get_user_subscription(cursor, user_id)
    if not subscription['is_active']:
        return {'allowed': False, 'used': 0, 'limit': 0, 'remaining': 0, 'tier': subscription['tier']}
    limit_field_map = {'words': ('words_limit', 'words_added'), 'exercises': ('exercises_limit', 'exercises_completed'), 'word_sets': ('word_sets_limit', 'word_sets_added'), 'status_changes': ('status_changes_limit', 'status_changes')}
    if limit_type not in limit_field_map:
        raise ValueError(f"Unknown limit_type: {limit_type}")
    limit_field, usage_field = limit_field_map[limit_type]
    limit_value = subscription['limits'][limit_field]
    cursor.execute(f"""SELECT {usage_field} FROM t_p7147437_shag_to_speak.subscription_usage WHERE user_id = %s ORDER BY subscription_end DESC NULLS LAST LIMIT 1""", (user_id,))
    usage_row = cursor.fetchone()
    used = usage_row[usage_field] if usage_row else 0
    if limit_value == -1:
        remaining, allowed = -1, True
    else:
        remaining, allowed = max(0, limit_value - used), (limit_value - used) > 0
    return {'allowed': allowed, 'used': used, 'limit': limit_value, 'remaining': remaining, 'tier': subscription['tier']}

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




def check_spelling_and_enrich_batch(words_list: List[str]) -> Dict[str, Dict[str, Any]]:
    api_key = os.environ.get('GENAPI_KEY', '')
    if not api_key:
        return {word: {
            'corrected_word': word,
            'was_corrected': False,
            'translation': '...',
            'examples': ['Ошибка генерации'],
            'category': 'uncategorized',
            'transcription': '',
            'part_of_speech': 'noun',
            'difficulty_level': 'intermediate',
            'example_sentence': f'This is an example with {word}.'
        } for word in words_list}
    
    words_text = '", "'.join(words_list)
    categories_sample = ', '.join(CATEGORIES[:15])
    prompt = f'''Check spelling and enrich these English words: "{words_text}"

For EACH word return JSON with these fields:
1. corrected_word - corrected spelling (if no error, return original word in lowercase)
2. was_corrected - true if spelling was fixed, false otherwise
3. suggestions - if was_corrected is true, provide array of 3-5 possible words user might have meant, each with:
   - word: correct English word
   - translation: brief Russian translation (1-3 words)
   - confidence: "high", "medium", or "low" based on similarity
   If was_corrected is false, return empty array
4. translation - brief Russian translation (1-3 words)
5. examples - array of 3 short English sentences using this word
6. category - one from: {categories_sample}, or uncategorized
7. transcription - IPA format like /wɜːrd/
8. part_of_speech - noun, verb, adjective, adverb, preposition, etc
9. difficulty_level - beginner, intermediate, advanced, or master
10. example_sentence - natural English sentence with this word

For suggestions, consider:
- Similar spelling (1-2 character difference)
- Common typos and phonetic similarity
- Context-appropriate words

Return ONLY valid JSON (no extra text):
{{
  "original_word": {{
    "corrected_word": "...",
    "was_corrected": true/false,
    "suggestions": [{{"word": "speak", "translation": "говорить", "confidence": "high"}}, ...],
    "translation": "...",
    "examples": [...],
    "category": "...",
    "transcription": "...",
    "part_of_speech": "...",
    "difficulty_level": "...",
    "example_sentence": "..."
  }}
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
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f'GENAPI raw response: {json.dumps(data)}')
            content = None
            if 'response' in data and len(data['response']) > 0:
                content = data['response'][0]['message']['content']
            elif 'output' in data and 'choices' in data['output']:
                content = data['output']['choices'][0]['message']['content']
            
            print(f'GENAPI content extracted: {content[:500] if content else "None"}...')
            
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
                
                enriched_data = {}
                for word in words_list:
                    word_data = result.get(word, result.get(word.lower(), {}))
                    if not word_data:
                        for key in result.keys():
                            if key.lower() == word.lower():
                                word_data = result[key]
                                break
                    
                    if word_data:
                        category = word_data.get('category', 'uncategorized').lower().replace(' ', '_').replace('&', '').replace('–', '_')
                        if category not in CATEGORIES:
                            category = 'uncategorized'
                        
                        valid_pos = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun', 'conjunction', 'interjection']
                        pos = word_data.get('part_of_speech', 'noun')
                        if pos not in valid_pos:
                            pos = 'noun'
                        
                        valid_levels = ['beginner', 'intermediate', 'advanced', 'master']
                        level = word_data.get('difficulty_level', 'intermediate')
                        if level not in valid_levels:
                            level = 'intermediate'
                        
                        suggestions = word_data.get('suggestions', [])
                        if not isinstance(suggestions, list):
                            suggestions = []
                        
                        enriched_data[word] = {
                            'corrected_word': word_data.get('corrected_word', word).strip().lower(),
                            'was_corrected': word_data.get('was_corrected', False),
                            'suggestions': suggestions,
                            'translation': word_data.get('translation', '...'),
                            'examples': word_data.get('examples', ['Пример 1', 'Пример 2', 'Пример 3']),
                            'category': category,
                            'transcription': word_data.get('transcription', ''),
                            'part_of_speech': pos,
                            'difficulty_level': level,
                            'example_sentence': word_data.get('example_sentence', f'This is an example with {word}.')
                        }
                    else:
                        enriched_data[word] = {
                            'corrected_word': word,
                            'was_corrected': False,
                            'suggestions': [],
                            'translation': '...',
                            'examples': ['Ошибка генерации'],
                            'category': 'uncategorized',
                            'transcription': '',
                            'part_of_speech': 'noun',
                            'difficulty_level': 'intermediate',
                            'example_sentence': f'This is an example with {word}.'
                        }
                
                return enriched_data
        
        print(f'GENAPI response parsing failed or status != 200, status: {response.status_code}')
        return {word: {
            'corrected_word': word,
            'was_corrected': False,
            'suggestions': [],
            'translation': '...',
            'examples': ['Ошибка генерации'],
            'category': 'uncategorized',
            'transcription': '',
            'part_of_speech': 'noun',
            'difficulty_level': 'intermediate',
            'example_sentence': f'This is an example with {word}.'
        } for word in words_list}
    except Exception as e:
        print(f'Error in batch spell-check and enrichment: {str(e)}')
        return {word: {
            'corrected_word': word,
            'was_corrected': False,
            'suggestions': [],
            'translation': '...',
            'examples': ['Ошибка генерации'],
            'category': 'uncategorized',
            'transcription': '',
            'part_of_speech': 'noun',
            'difficulty_level': 'intermediate',
            'example_sentence': f'This is an example with {word}.'
        } for word in words_list}



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
                          last_recall_date, created_at, category, transcription, part_of_speech,
                          difficulty_level, example_sentence
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
                    'category': word.get('category', 'uncategorized'),
                    'transcription': word.get('transcription', ''),
                    'part_of_speech': word.get('part_of_speech', 'noun'),
                    'difficulty_level': word.get('difficulty_level', 'intermediate'),
                    'example_sentence': word.get('example_sentence', '')
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
            check_only = body_data.get('check_only', False)
            provided_enriched_data = body_data.get('enriched_data', None)
            
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
            
            words_to_check = [w.strip().lower() for w in words_input if w.strip()]
            if not words_to_check:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No valid words provided'}),
                    'isBase64Encoded': False
                }
            
            if provided_enriched_data:
                print(f'Using provided enriched data for {len(words_to_check)} words')
                print(f'words_to_check: {words_to_check}')
                print(f'provided_enriched_data keys: {list(provided_enriched_data.keys())}')
                enriched_data = provided_enriched_data
            else:
                print(f'Checking and enriching {len(words_to_check)} words: {words_to_check}')
                enriched_data = check_spelling_and_enrich_batch(words_to_check)
                print(f'Enrichment complete: {json.dumps(enriched_data)}')
            
            corrections = []
            for original_word in words_to_check:
                word_data = enriched_data.get(original_word, {})
                was_corrected = word_data.get('was_corrected', False)
                suggestions = word_data.get('suggestions', [])
                
                if was_corrected and suggestions:
                    corrections.append({
                        'original': original_word,
                        'suggestions': suggestions
                    })
            
            if check_only:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'corrections': corrections,
                        'enriched_data': enriched_data
                    }),
                    'isBase64Encoded': False
                }
            
            limit_check = check_limit(cursor, int(user_id), 'words')
            if not limit_check['allowed']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': 'Word limit exceeded', 
                        'limit_exceeded': True,
                        'tier': limit_check['tier']
                    }),
                    'isBase64Encoded': False
                }
            
            added_words = []
            duplicate_words = []
            
            for original_word in words_to_check:
                word_data = enriched_data.get(original_word, {})
                corrected_word = word_data.get('corrected_word', original_word)
                
                cursor.execute(
                    "SELECT id FROM t_p7147437_shag_to_speak.words WHERE user_id = %s AND english_word = %s",
                    (user_id, corrected_word)
                )
                existing = cursor.fetchone()
                
                if existing:
                    duplicate_words.append(corrected_word)
                    continue
                
                cursor.execute(
                    """INSERT INTO t_p7147437_shag_to_speak.words 
                       (user_id, english_word, russian_translation, examples, status, recall_count, category,
                        transcription, part_of_speech, difficulty_level, example_sentence)
                       VALUES (%s, %s, %s, %s, 'learning', 0, %s, %s, %s, %s, %s)
                       RETURNING id, english_word, russian_translation, examples, status, recall_count, category,
                                 transcription, part_of_speech, difficulty_level, example_sentence""",
                    (user_id, corrected_word, word_data.get('translation', '...'), 
                     word_data.get('examples', ['Пример']), word_data.get('category', 'uncategorized'),
                     word_data.get('transcription', ''), word_data.get('part_of_speech', 'noun'),
                     word_data.get('difficulty_level', 'intermediate'), word_data.get('example_sentence', ''))
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
                    'transcription': new_word.get('transcription', ''),
                    'part_of_speech': new_word.get('part_of_speech', 'noun'),
                    'difficulty_level': new_word.get('difficulty_level', 'intermediate'),
                    'example_sentence': new_word.get('example_sentence', '')
                })
            
            if duplicate_words and not added_words:
                words_list = ', '.join(duplicate_words)
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Эти слова уже есть в твоём словаре :) — {words_list}'}),
                    'isBase64Encoded': False
                }
            
            if added_words:
                now = datetime.now()
                period_start = datetime(now.year, now.month, 1).date()
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.subscription_usage 
                       SET words_added = words_added + %s
                       WHERE user_id = %s AND period_start = %s""",
                    (len(added_words), user_id, period_start)
                )
            
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