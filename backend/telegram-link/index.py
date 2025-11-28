import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Link Telegram account to existing user via bot code
    Args: event with httpMethod, body (user_id, code)
          context with request_id
    Returns: HTTP response with updated user data
    '''
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        code = body_data.get('code', '').strip().upper()
        
        if not user_id or not code:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User ID and code are required'}),
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
        existing_telegram_user = cur.fetchone()
        
        if existing_telegram_user:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Этот Telegram аккаунт уже привязан к другому пользователю'}),
                'isBase64Encoded': False
            }
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        telegram_username = ''
        telegram_first_name = ''
        telegram_photo_url = ''
        
        if bot_token:
            try:
                chat_response = requests.get(
                    f"https://api.telegram.org/bot{bot_token}/getChat",
                    params={'chat_id': telegram_id},
                    timeout=5
                )
                if chat_response.status_code == 200:
                    chat_data = chat_response.json().get('result', {})
                    telegram_username = chat_data.get('username', '')
                    telegram_first_name = chat_data.get('first_name', '')
                    
                    photos_response = requests.get(
                        f"https://api.telegram.org/bot{bot_token}/getUserProfilePhotos",
                        params={'user_id': telegram_id, 'limit': 1},
                        timeout=5
                    )
                    if photos_response.status_code == 200:
                        photos_data = photos_response.json().get('result', {})
                        if photos_data.get('total_count', 0) > 0:
                            file_id = photos_data['photos'][0][0]['file_id']
                            file_response = requests.get(
                                f"https://api.telegram.org/bot{bot_token}/getFile",
                                params={'file_id': file_id},
                                timeout=5
                            )
                            if file_response.status_code == 200:
                                file_path = file_response.json()['result']['file_path']
                                telegram_photo_url = f"https://api.telegram.org/file/bot{bot_token}/{file_path}"
            except:
                pass
        
        cur.execute(
            """
            UPDATE users 
            SET telegram_id = %s, telegram_username = %s, telegram_first_name = %s, telegram_photo_url = %s
            WHERE id = %s
            RETURNING *
            """,
            (telegram_id, telegram_username, telegram_first_name, telegram_photo_url, user_id)
        )
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
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
        
        if bot_token:
            try:
                link_message = (
                    "✅ Ваш Telegram аккаунт успешно привязан к ShagToSpeak!\n\n"
                    "Теперь вы можете использовать Telegram для входа в свой аккаунт.\n\n"
                    "📱 Присоединяйтесь к нашему сообществу: https://t.me/+msaxjItr0iZmMGNi"
                )
                telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                requests.post(telegram_url, json={
                    'chat_id': telegram_id,
                    'text': link_message,
                    'parse_mode': 'HTML'
                })
            except:
                pass
        
        user_response = {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'] or '',
            'phone': user.get('phone', ''),
            'status': user['status'],
            'preferences': user['preferences'] or [],
            'word_count': word_count,
            'exercises_remaining': 3 - user['daily_exercises_count'],
            'daily_exercises_count': user['daily_exercises_count'],
            'telegram_id': user['telegram_id'],
            'profile_completed': user.get('profile_completed', True)
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'user': user_response}),
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
