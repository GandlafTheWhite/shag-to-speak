"""
Business: Регистрация и вход пользователей в систему
Args: event с httpMethod (POST), body с email/password/name/phone/preferences
Returns: HTTP response с user_id, email, name, status, токеном
"""

import json
import os
import hashlib
import hmac
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: int, email: str) -> str:
    data = f"{user_id}:{email}"
    return hashlib.sha256(data.encode()).hexdigest()

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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action', 'login')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if action == 'register':
            email = body_data.get('email', '').strip().lower()
            password = body_data.get('password', '')
            name = body_data.get('name', 'Пользователь')
            phone = body_data.get('phone', '')
            preferences = body_data.get('preferences', [])
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT id FROM t_p7147437_shag_to_speak.users WHERE email = %s",
                (email,)
            )
            existing = cursor.fetchone()
            
            if existing:
                return {
                    'statusCode': 409,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cursor.execute(
                """INSERT INTO t_p7147437_shag_to_speak.users 
                   (email, password_hash, name, phone, status, preferences, daily_exercises_count)
                   VALUES (%s, %s, %s, %s, 'free', %s, 0)
                   RETURNING id, email, name, phone, status, preferences""",
                (email, password_hash, name, phone, preferences)
            )
            user = cursor.fetchone()
            conn.commit()
            
            token = create_token(user['id'], user['email'])
            
            cursor.execute(
                "SELECT COUNT(*) as word_count FROM t_p7147437_shag_to_speak.words WHERE user_id = %s",
                (user['id'],)
            )
            word_count = cursor.fetchone()['word_count']
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'phone': user['phone'],
                        'status': user['status'],
                        'preferences': user['preferences'] or [],
                        'word_count': word_count,
                        'exercises_remaining': 3,
                        'daily_exercises_count': 0
                    },
                    'token': token
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            email = body_data.get('email', '').strip().lower()
            password = body_data.get('password', '')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cursor.execute(
                """SELECT id, email, name, phone, status, preferences, daily_exercises_count, last_exercise_date
                   FROM t_p7147437_shag_to_speak.users 
                   WHERE email = %s AND password_hash = %s""",
                (email, password_hash)
            )
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT COUNT(*) as word_count FROM t_p7147437_shag_to_speak.words WHERE user_id = %s",
                (user['id'],)
            )
            word_count = cursor.fetchone()['word_count']
            
            daily_count = user['daily_exercises_count'] or 0
            exercises_remaining = 3 if user['status'] == 'free' else 999
            if user['status'] == 'free':
                exercises_remaining = max(0, 3 - daily_count)
            
            token = create_token(user['id'], user['email'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'phone': user['phone'],
                        'status': user['status'],
                        'preferences': user['preferences'] or [],
                        'word_count': word_count,
                        'exercises_remaining': exercises_remaining,
                        'daily_exercises_count': daily_count
                    },
                    'token': token
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'}),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()
