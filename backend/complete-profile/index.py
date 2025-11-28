import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Complete user profile after Telegram registration
    Args: event with httpMethod, body (user_id, name, email, phone, preferences)
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
        name = body_data.get('name', '').strip()
        email = body_data.get('email', '').strip()
        phone = body_data.get('phone', '').strip()
        preferences = body_data.get('preferences', [])
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User ID is required'}),
                'isBase64Encoded': False
            }
        
        if not name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Name is required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        update_parts = ['name = %s', 'profile_completed = TRUE']
        params = [name]
        
        if email and not email.startswith('tg') and '@' in email:
            update_parts.append('email = %s')
            params.append(email)
        
        if phone:
            update_parts.append('phone = %s')
            params.append(phone)
        
        if preferences:
            update_parts.append('preferences = %s')
            params.append(preferences)
        
        params.append(user_id)
        
        query = f"UPDATE users SET {', '.join(update_parts)} WHERE id = %s RETURNING *"
        cur.execute(query, params)
        user = cur.fetchone()
        conn.commit()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT COUNT(*) as count FROM words WHERE user_id = %s", (user['id'],))
        word_count_result = cur.fetchone()
        word_count = word_count_result['count'] if word_count_result else 0
        
        cur.close()
        conn.close()
        
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
            'telegram_id': user.get('telegram_id'),
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
