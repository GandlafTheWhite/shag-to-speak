import json
import os
import hashlib
import hmac
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Authenticate or register user via Telegram Login Widget
    Args: event with httpMethod, body (telegram auth data)
          context with request_id
    Returns: HTTP response with user data and auth token
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
        
        telegram_id = body_data.get('id')
        username = body_data.get('username', '')
        first_name = body_data.get('first_name', '')
        photo_url = body_data.get('photo_url', '')
        auth_date = body_data.get('auth_date')
        hash_received = body_data.get('hash')
        
        if not telegram_id or not hash_received or not auth_date:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required Telegram auth data'}),
                'isBase64Encoded': False
            }
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Bot token not configured'}),
                'isBase64Encoded': False
            }
        
        data_check_arr = []
        for key in ['auth_date', 'first_name', 'id', 'photo_url', 'username']:
            if key in body_data and body_data[key]:
                data_check_arr.append(f"{key}={body_data[key]}")
        
        data_check_arr.sort()
        data_check_string = '\n'.join(data_check_arr)
        
        secret_key = hashlib.sha256(bot_token.encode()).digest()
        hash_calculated = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if hash_calculated != hash_received:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid Telegram authentication'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT * FROM users WHERE telegram_id = %s",
            (telegram_id,)
        )
        user = cur.fetchone()
        
        if user:
            cur.execute(
                """
                UPDATE users 
                SET telegram_username = %s, telegram_first_name = %s, telegram_photo_url = %s
                WHERE telegram_id = %s
                """,
                (username, first_name, photo_url, telegram_id)
            )
            conn.commit()
        else:
            name = first_name or username or f'User{telegram_id}'
            cur.execute(
                """
                INSERT INTO users (telegram_id, telegram_username, telegram_first_name, telegram_photo_url, 
                                   name, email, password_hash, status, preferences, daily_exercises_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (telegram_id, username, first_name, photo_url, name, '', '', 'free', [], 3)
            )
            user = cur.fetchone()
            conn.commit()
        
        cur.execute("SELECT COUNT(*) as count FROM words WHERE user_id = %s", (user['id'],))
        word_count_result = cur.fetchone()
        word_count = word_count_result['count'] if word_count_result else 0
        
        cur.close()
        conn.close()
        
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
