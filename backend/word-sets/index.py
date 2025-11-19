"""
Business: Управление готовыми наборами слов - получение списка наборов и добавление слов из набора в словарь пользователя
Args: event с httpMethod (GET/POST), headers с X-User-Id, queryStringParameters с set_id
Returns: HTTP response со списком наборов или результатом добавления
"""

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            set_id = query_params.get('set_id')
            
            if set_id:
                cursor.execute(
                    """SELECT ws.id, ws.title, ws.topic, ws.description, ws.word_count,
                              array_agg(json_build_object(
                                  'english_word', wsi.english_word,
                                  'russian_translation', wsi.russian_translation,
                                  'examples', wsi.examples
                              )) as words
                       FROM t_p7147437_shag_to_speak.word_sets ws
                       LEFT JOIN t_p7147437_shag_to_speak.word_set_items wsi ON ws.id = wsi.set_id
                       WHERE ws.id = %s
                       GROUP BY ws.id, ws.title, ws.topic, ws.description, ws.word_count""",
                    (set_id,)
                )
                word_set = cursor.fetchone()
                
                if not word_set:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Word set not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(word_set)),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute(
                    """SELECT id, title, topic, description, word_count
                       FROM t_p7147437_shag_to_speak.word_sets
                       ORDER BY topic, word_count"""
                )
                word_sets = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'word_sets': [dict(ws) for ws in word_sets]}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
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
            set_id = body_data.get('set_id')
            
            if not set_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'set_id required'}),
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
                "SELECT english_word, russian_translation, examples FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = %s",
                (set_id,)
            )
            set_words = cursor.fetchall()
            
            if not set_words:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Word set not found or empty'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT COUNT(*) as count FROM t_p7147437_shag_to_speak.words WHERE user_id = %s",
                (user_id,)
            )
            current_count = cursor.fetchone()['count']
            
            word_limit = 50 if user['status'] == 'free' else 999
            if current_count + len(set_words) > word_limit:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Word limit exceeded. Max: {word_limit}'}),
                    'isBase64Encoded': False
                }
            
            added_words = []
            duplicate_words = []
            
            for word_data in set_words:
                cursor.execute(
                    "SELECT id FROM t_p7147437_shag_to_speak.words WHERE user_id = %s AND english_word = %s",
                    (user_id, word_data['english_word'])
                )
                existing = cursor.fetchone()
                
                if existing:
                    duplicate_words.append(word_data['english_word'])
                    continue
                
                cursor.execute(
                    """INSERT INTO t_p7147437_shag_to_speak.words 
                       (user_id, english_word, russian_translation, examples, status, recall_count)
                       VALUES (%s, %s, %s, %s, 'learning', 0)
                       RETURNING id, english_word, russian_translation, examples, status, recall_count""",
                    (user_id, word_data['english_word'], word_data['russian_translation'], word_data['examples'])
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
            
            response_data = {
                'words': added_words,
                'count': len(added_words)
            }
            
            if duplicate_words:
                response_data['duplicates'] = duplicate_words
                response_data['message'] = f'Пропущено {len(duplicate_words)} слов, которые уже в словаре'
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(response_data),
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