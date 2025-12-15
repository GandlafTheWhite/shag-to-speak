import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Update user settings including exercise difficulty, theme, and onboarding status
    Args: event with httpMethod, body (user_id, exercise_difficulty, preferences, theme, onboarding_completed)
          context with request_id
    Returns: HTTP response with updated user data
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method not in ['POST', 'PUT']:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        exercise_difficulty = body_data.get('exercise_difficulty')
        preferences = body_data.get('preferences')
        theme = body_data.get('theme')
        onboarding_completed = body_data.get('onboarding_completed')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User ID is required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        update_parts = []
        params = []
        
        if exercise_difficulty and exercise_difficulty in ['beginner', 'intermediate', 'advanced', 'master']:
            update_parts.append('exercise_difficulty = %s')
            params.append(exercise_difficulty)
        
        if preferences is not None:
            update_parts.append('preferences = %s')
            params.append(preferences)
        
        if theme and theme in ['light', 'dark']:
            update_parts.append('theme = %s')
            params.append(theme)
        
        if onboarding_completed is not None:
            update_parts.append('onboarding_completed = %s')
            params.append(onboarding_completed)
        
        if not update_parts:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No valid fields to update'}),
                'isBase64Encoded': False
            }
        
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
        
        cur.close()
        conn.close()
        
        user_response = {
            'id': user['id'],
            'exercise_difficulty': user.get('exercise_difficulty', 'beginner'),
            'preferences': user.get('preferences', [])
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