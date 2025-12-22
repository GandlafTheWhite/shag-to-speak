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
from datetime import datetime, timedelta
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
                   (email, password_hash, name, phone, preferences, daily_exercises_count, theme, onboarding_completed, is_trial_used)
                   VALUES (%s, %s, %s, %s, %s, 0, 'light', FALSE, FALSE)
                   RETURNING id, email, name, phone, preferences, theme, onboarding_completed""",
                (email, password_hash, name, phone, preferences)
            )
            user = cursor.fetchone()
            user_id = user['id']
            
            period_start = datetime(datetime.now().year, datetime.now().month, 1).date()
            period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            cursor.execute(
                """INSERT INTO t_p7147437_shag_to_speak.subscription_usage 
                   (user_id, current_tier, subscription_status, subscription_start, subscription_end, period_start, period_end,
                    words_added, word_sets_added, exercises_completed, status_changes)
                   VALUES (%s, 'none', 'inactive', NULL, NULL, %s, %s, 0, 0, 0, 0)""",
                (user_id, period_start, period_end)
            )
            
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
                        'preferences': user['preferences'] or [],
                        'word_count': word_count,
                        'exercises_remaining': 0,
                        'daily_exercises_count': 0,
                        'theme': user.get('theme', 'light'),
                        'onboarding_completed': user.get('onboarding_completed', False)
                    },
                    'token': token,
                    'subscription': {
                        'tier': 'none',
                        'status': 'inactive',
                        'message': '👋 Добро пожаловать! Активируйте бесплатный пробный период на 7 дней.'
                    }
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
                """SELECT id, email, name, phone, preferences, daily_exercises_count, last_exercise_date, 
                          theme, onboarding_completed, profile_completed
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
                        'preferences': user['preferences'] or [],
                        'word_count': word_count,
                        'exercises_remaining': 0,
                        'daily_exercises_count': daily_count,
                        'theme': user.get('theme', 'light'),
                        'onboarding_completed': user.get('onboarding_completed', False),
                        'profile_completed': user.get('profile_completed', False)
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