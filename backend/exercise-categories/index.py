import json
import os
import random
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get exercise categories from user's actual word dictionary
    Args: event with httpMethod, headers (X-User-Id)
          context with request_id
    Returns: HTTP response with up to 4 random categories from user's words
    '''
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
    
    try:
        headers = event.get('headers', {})
        user_id = headers.get('x-user-id') or headers.get('X-User-Id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User ID required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            """
            SELECT DISTINCT category, COUNT(*) as word_count
            FROM words 
            WHERE user_id = %s AND category IS NOT NULL AND category != ''
            GROUP BY category
            ORDER BY word_count DESC
            """,
            (user_id,)
        )
        all_categories = cur.fetchall()
        
        cur.close()
        conn.close()
        
        if not all_categories:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'categories': []}),
                'isBase64Encoded': False
            }
        
        categories_list = [
            {
                'name': cat['category'],
                'word_count': cat['word_count']
            }
            for cat in all_categories
        ]
        
        if len(categories_list) <= 4:
            selected_categories = categories_list
        else:
            selected_categories = random.sample(categories_list, 4)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'categories': selected_categories,
                'total_categories': len(categories_list)
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
