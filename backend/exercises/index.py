"""
Business: Генерация упражнений и проверка ответов пользователей
Args: event с httpMethod (GET/POST), headers с X-User-Id, body с ответами
Returns: HTTP response с упражнениями или результатом проверки
"""

import json
import os
import random
from typing import Dict, Any, List
from datetime import date, datetime
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
                """SELECT status, daily_exercises_count, last_exercise_date 
                   FROM t_p7147437_shag_to_speak.users 
                   WHERE id = %s""",
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
            
            today = date.today()
            last_date = user['last_exercise_date']
            daily_count = user['daily_exercises_count'] or 0
            
            if last_date != today:
                daily_count = 0
            
            limit = 999 if user['status'] == 'premium' else 3
            if daily_count >= limit:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Daily exercise limit reached', 'limit': limit}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """SELECT id, english_word, russian_translation, examples
                   FROM t_p7147437_shag_to_speak.words 
                   WHERE user_id = %s AND status = 'learning'
                   ORDER BY RANDOM()
                   LIMIT 5""",
                (user_id,)
            )
            words = cursor.fetchall()
            
            if not words:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'exercises': [], 'message': 'No words for practice'}),
                    'isBase64Encoded': False
                }
            
            exercises = []
            for word in words:
                exercise_type = random.choice(['translation', 'multiple_choice'])
                
                if exercise_type == 'translation':
                    exercises.append({
                        'word_id': word['id'],
                        'type': 'translation',
                        'question': word['english_word'],
                        'correct_answer': word['russian_translation']
                    })
                else:
                    cursor.execute(
                        """SELECT russian_translation 
                           FROM t_p7147437_shag_to_speak.words 
                           WHERE user_id = %s AND id != %s
                           ORDER BY RANDOM()
                           LIMIT 3""",
                        (user_id, word['id'])
                    )
                    wrong_answers = [w['russian_translation'] for w in cursor.fetchall()]
                    
                    options = [word['russian_translation']] + wrong_answers
                    random.shuffle(options)
                    
                    exercises.append({
                        'word_id': word['id'],
                        'type': 'multiple_choice',
                        'question': word['english_word'],
                        'options': options,
                        'correct_answer': word['russian_translation']
                    })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'exercises': exercises,
                    'exercises_remaining': limit - daily_count - 1
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            answers = body_data.get('answers', [])
            
            if not answers:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Answers required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """SELECT status, daily_exercises_count, last_exercise_date 
                   FROM t_p7147437_shag_to_speak.users 
                   WHERE id = %s""",
                (user_id,)
            )
            user = cursor.fetchone()
            
            today = date.today()
            last_date = user['last_exercise_date']
            daily_count = user['daily_exercises_count'] or 0
            
            if last_date != today:
                daily_count = 0
            
            results = []
            correct_count = 0
            
            for answer in answers:
                word_id = answer.get('word_id')
                user_answer = answer.get('answer', '').strip().lower()
                
                cursor.execute(
                    "SELECT russian_translation FROM t_p7147437_shag_to_speak.words WHERE id = %s",
                    (word_id,)
                )
                word = cursor.fetchone()
                
                if not word:
                    continue
                
                correct_answer = word['russian_translation'].strip().lower()
                is_correct = user_answer == correct_answer
                
                if is_correct:
                    correct_count += 1
                
                cursor.execute(
                    """INSERT INTO t_p7147437_shag_to_speak.exercises 
                       (user_id, word_id, exercise_type, is_correct, user_answer)
                       VALUES (%s, %s, 'mixed', %s, %s)""",
                    (user_id, word_id, is_correct, user_answer)
                )
                
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.words 
                       SET recall_count = recall_count + 1,
                           last_recall_date = CURRENT_TIMESTAMP
                       WHERE id = %s""",
                    (word_id,)
                )
                
                results.append({
                    'word_id': word_id,
                    'is_correct': is_correct,
                    'correct_answer': word['russian_translation']
                })
            
            cursor.execute(
                """UPDATE t_p7147437_shag_to_speak.users 
                   SET daily_exercises_count = %s,
                       last_exercise_date = %s
                   WHERE id = %s""",
                (daily_count + 1, today, user_id)
            )
            
            conn.commit()
            
            limit = 999 if user['status'] == 'premium' else 3
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'results': results,
                    'score': correct_count,
                    'total': len(answers),
                    'exercises_remaining': max(0, limit - daily_count - 1)
                }),
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
