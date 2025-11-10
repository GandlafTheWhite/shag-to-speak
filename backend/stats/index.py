"""
Business: Получение статистики прогресса пользователя - слова, упражнения, достижения
Args: event с httpMethod (GET), headers с X-User-Id
Returns: HTTP response со статистикой пользователя
"""

import json
import os
from typing import Dict, Any
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
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
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute(
            """SELECT COUNT(*) as total, 
                      SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning,
                      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
               FROM t_p7147437_shag_to_speak.words 
               WHERE user_id = %s""",
            (user_id,)
        )
        words_stats = cursor.fetchone()
        
        cursor.execute(
            """SELECT COUNT(*) as total_exercises,
                      SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count
               FROM t_p7147437_shag_to_speak.exercises 
               WHERE user_id = %s""",
            (user_id,)
        )
        exercise_stats = cursor.fetchone()
        
        seven_days_ago = datetime.now() - timedelta(days=7)
        cursor.execute(
            """SELECT DATE(created_at) as date, COUNT(*) as count
               FROM t_p7147437_shag_to_speak.exercises
               WHERE user_id = %s AND created_at >= %s
               GROUP BY DATE(created_at)
               ORDER BY date""",
            (user_id, seven_days_ago)
        )
        weekly_activity = cursor.fetchall()
        
        cursor.execute(
            """SELECT w.english_word, w.russian_translation, w.recall_count,
                      COUNT(e.id) as total_attempts,
                      SUM(CASE WHEN e.is_correct THEN 1 ELSE 0 END) as correct_attempts
               FROM t_p7147437_shag_to_speak.words w
               LEFT JOIN t_p7147437_shag_to_speak.exercises e ON w.id = e.word_id
               WHERE w.user_id = %s
               GROUP BY w.id, w.english_word, w.russian_translation, w.recall_count
               ORDER BY correct_attempts DESC, total_attempts DESC
               LIMIT 10""",
            (user_id,)
        )
        top_words = cursor.fetchall()
        
        cursor.execute(
            "SELECT created_at FROM t_p7147437_shag_to_speak.users WHERE id = %s",
            (user_id,)
        )
        user_created = cursor.fetchone()
        
        days_active = 0
        if user_created and user_created['created_at']:
            delta = datetime.now() - user_created['created_at']
            days_active = delta.days + 1
        
        total_exercises = exercise_stats['total_exercises'] or 0
        correct_count = exercise_stats['correct_count'] or 0
        accuracy = round((correct_count / total_exercises * 100), 1) if total_exercises > 0 else 0
        
        activity_data = []
        for day in weekly_activity:
            activity_data.append({
                'date': day['date'].isoformat(),
                'count': day['count']
            })
        
        top_words_data = []
        for word in top_words:
            total = word['total_attempts'] or 0
            correct = word['correct_attempts'] or 0
            word_accuracy = round((correct / total * 100), 1) if total > 0 else 0
            
            top_words_data.append({
                'word': word['english_word'],
                'translation': word['russian_translation'],
                'attempts': total,
                'accuracy': word_accuracy
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'words': {
                    'total': words_stats['total'] or 0,
                    'learning': words_stats['learning'] or 0,
                    'done': words_stats['done'] or 0
                },
                'exercises': {
                    'total': total_exercises,
                    'correct': correct_count,
                    'accuracy': accuracy
                },
                'activity': {
                    'days_active': days_active,
                    'weekly': activity_data
                },
                'top_words': top_words_data
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
