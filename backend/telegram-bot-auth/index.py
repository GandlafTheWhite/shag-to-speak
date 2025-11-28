import json
import os
import hashlib
from datetime import datetime
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Authenticate or register user via Telegram bot code
    Args: event with httpMethod, body (telegram_id, code)
          context with request_id
    Returns: HTTP response with user data and auth token
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        code = body_data.get('code', '').strip().upper()
        
        if not code:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Code is required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            """
            SELECT * FROM auth_codes 
            WHERE code = %s AND used = FALSE AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
            """,
            (code,)
        )
        auth_code = cur.fetchone()
        
        if not auth_code:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный или истекший код'}),
                'isBase64Encoded': False
            }
        
        telegram_id = auth_code['telegram_id']
        
        cur.execute(
            "SELECT * FROM users WHERE telegram_id = %s",
            (telegram_id,)
        )
        user = cur.fetchone()
        
        is_new_user = False
        
        if user:
            cur.execute(
                "UPDATE users SET updated_at = NOW() WHERE telegram_id = %s",
                (telegram_id,)
            )
            conn.commit()
        else:
            is_new_user = True
            name = f'User{telegram_id}'
            cur.execute(
                """
                INSERT INTO users (telegram_id, name, email, password_hash, status, preferences, daily_exercises_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (telegram_id, name, '', '', 'free', [], 3)
            )
            user = cur.fetchone()
            conn.commit()
        
        cur.execute(
            "UPDATE auth_codes SET used = TRUE WHERE id = %s",
            (auth_code['id'],)
        )
        conn.commit()
        
        cur.execute("SELECT COUNT(*) as count FROM words WHERE user_id = %s", (user['id'],))
        word_count_result = cur.fetchone()
        word_count = word_count_result['count'] if word_count_result else 0
        
        cur.close()
        conn.close()
        
        if is_new_user:
            bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
            if bot_token:
                welcome_message = (
                    "🎉 Добро пожаловать в ShagToSpeak!\n\n"
                    "Вы успешно зарегистрировались. Теперь вы можете пользоваться всеми функциями платформы.\n\n"
                    "📱 Присоединяйтесь к нашему сообществу: https://t.me/+msaxjItr0iZmMGNi"
                )
                telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                requests.post(telegram_url, json={
                    'chat_id': telegram_id,
                    'text': welcome_message,
                    'parse_mode': 'HTML'
                })
        
        token = hashlib.sha256(f"{user['id']}{telegram_id}{context.request_id}".encode()).hexdigest()
        
        user_response = {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'] or '',
            'status': user['status'],
            'preferences': user['preferences'] or [],
            'word_count': word_count,
            'exercises_remaining': 3 - user['daily_exercises_count'],
            'daily_exercises_count': user['daily_exercises_count'],
            'telegram_id': user['telegram_id']
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'user': user_response, 'token': token}),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
