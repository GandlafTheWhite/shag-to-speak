'''
Business: Управление пользователями и словами - аутентификация, CRUD операции, AI генерация контента
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с statusCode, headers, body
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List
import hashlib
import requests
from datetime import datetime, date

def get_user_subscription(cursor: RealDictCursor, user_id: int) -> Dict[str, Any]:
    cursor.execute(
        """SELECT su.current_tier, su.subscription_status, su.subscription_end,
                  sp.words_limit, sp.exercises_limit, sp.word_sets_limit, sp.status_changes_limit
           FROM t_p7147437_shag_to_speak.subscription_usage su
           LEFT JOIN t_p7147437_shag_to_speak.subscription_plans sp ON su.current_tier = sp.tier
           WHERE su.user_id = %s
           ORDER BY su.subscription_end DESC NULLS LAST
           LIMIT 1""",
        (user_id,)
    )
    sub = cursor.fetchone()
    if not sub:
        return {'tier': 'none', 'is_active': False, 'limits': {'words_limit': 0, 'exercises_limit': 0, 'word_sets_limit': 0, 'status_changes_limit': 0}, 'subscription_end': None}
    now = datetime.now()
    sub_end = sub['subscription_end']
    is_active = sub['subscription_status'] == 'active' and sub_end is not None and now < sub_end
    return {'tier': sub['current_tier'] or 'none', 'is_active': is_active, 'limits': {'words_limit': sub['words_limit'] or 0, 'exercises_limit': sub['exercises_limit'] or 0, 'word_sets_limit': sub['word_sets_limit'] or 0, 'status_changes_limit': sub['status_changes_limit'] or 0}, 'subscription_end': sub_end.isoformat() if sub_end else None}

def check_limit(cursor: RealDictCursor, user_id: int, limit_type: str) -> Dict[str, Any]:
    subscription = get_user_subscription(cursor, user_id)
    if not subscription['is_active']:
        return {'allowed': False, 'used': 0, 'limit': 0, 'remaining': 0, 'tier': subscription['tier']}
    limit_field_map = {'words': ('words_limit', 'words_added'), 'exercises': ('exercises_limit', 'exercises_completed'), 'word_sets': ('word_sets_limit', 'word_sets_added'), 'status_changes': ('status_changes_limit', 'status_changes')}
    if limit_type not in limit_field_map:
        raise ValueError(f"Unknown limit_type: {limit_type}")
    limit_field, usage_field = limit_field_map[limit_type]
    limit_value = subscription['limits'][limit_field]
    cursor.execute(f"""SELECT {usage_field} FROM t_p7147437_shag_to_speak.subscription_usage WHERE user_id = %s ORDER BY subscription_end DESC NULLS LAST LIMIT 1""", (user_id,))
    usage_row = cursor.fetchone()
    used = usage_row[usage_field] if usage_row else 0
    if limit_value == -1:
        remaining = -1
        allowed = True
    else:
        remaining = max(0, limit_value - used)
        allowed = remaining > 0
    return {'allowed': allowed, 'used': used, 'limit': limit_value, 'remaining': remaining, 'tier': subscription['tier']}

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def call_ai(prompt: str) -> str:
    api_key = os.environ.get('GENAPI_KEY')
    url = 'https://gen-api.ru/api/v1/chat/completions'
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'model': 'o1-mini',
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 500
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    result = response.json()
    return result['choices'][0]['message']['content'].strip()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    
    try:
        if method == 'POST':
            if path == 'register':
                return register_user(event)
            elif path == 'login':
                return login_user(event)
            elif path == 'add-word':
                return add_word(event)
            elif path == 'add-words-batch':
                return add_words_batch(event)
            elif path == 'generate-translation':
                return generate_translation(event)
        
        elif method == 'GET':
            if path == 'user-info':
                return get_user_info(event)
            elif path == 'words':
                return get_words(event)
            elif path == 'stats':
                return get_stats(event)
        
        elif method == 'PUT':
            if path == 'word-status':
                return update_word_status(event)
            elif path == 'exercise-complete':
                return complete_exercise(event)
        
        elif method == 'DELETE':
            if path == 'word':
                return delete_word(event)
        
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Action not found'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def register_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    email = body_data.get('email')
    password = body_data.get('password')
    name = body_data.get('name')
    preferences = body_data.get('preferences', [])
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    password_hash = hash_password(password)
    
    cur.execute(
        "INSERT INTO users (email, password_hash, name, preferences) VALUES (%s, %s, %s, %s) RETURNING id",
        (email, password_hash, name, preferences)
    )
    user_id = cur.fetchone()['id']
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'user_id': user_id, 'message': 'User registered'}),
        'isBase64Encoded': False
    }

def login_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    email = body_data.get('email')
    password = body_data.get('password')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    password_hash = hash_password(password)
    
    cur.execute(
        "SELECT id, name FROM t_p7147437_shag_to_speak.users WHERE email = %s AND password_hash = %s",
        (email, password_hash)
    )
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid credentials'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps(dict(user)),
        'isBase64Encoded': False
    }

def get_user_info(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('headers', {}).get('x-user-id')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, email, name, preferences, daily_exercises_count, last_exercise_date FROM t_p7147437_shag_to_speak.users WHERE id = %s",
        (user_id,)
    )
    user = cur.fetchone()
    
    cur.execute("SELECT COUNT(*) as count FROM t_p7147437_shag_to_speak.words WHERE user_id = %s", (user_id,))
    word_count = cur.fetchone()['count']
    
    subscription = get_user_subscription(cur, int(user_id))
    
    cur.close()
    conn.close()
    
    user_data = dict(user)
    user_data['word_count'] = word_count
    user_data['last_exercise_date'] = str(user_data['last_exercise_date']) if user_data['last_exercise_date'] else None
    
    today = date.today()
    last_exercise = user_data['last_exercise_date']
    if last_exercise and str(today) != last_exercise:
        user_data['daily_exercises_count'] = 0
    
    exercises_limit = subscription['limits']['exercises_limit']
    exercises_remaining = exercises_limit - user_data['daily_exercises_count'] if exercises_limit > 0 else 999
    user_data['subscription'] = subscription
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({**user_data, 'exercises_remaining': exercises_remaining}),
        'isBase64Encoded': False
    }

def add_word(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('headers', {}).get('x-user-id')
    body_data = json.loads(event.get('body', '{}'))
    
    english_word = body_data.get('word').strip().lower()
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    limit_check = check_limit(cur, int(user_id), 'words')
    
    if not limit_check['allowed']:
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Word limit reached', 'limit': True, 'tier': limit_check['tier']}),
            'isBase64Encoded': False
        }
    
    prompt_translate = f"Translate this English word or phrase to Russian (only translation, no explanation): {english_word}"
    russian_translation = call_ai(prompt_translate)
    
    prompt_examples = f"Generate 3 example sentences using the word '{english_word}' in English. Return only sentences, one per line."
    examples_text = call_ai(prompt_examples)
    examples = [ex.strip() for ex in examples_text.split('\n') if ex.strip()][:3]
    
    cur.execute(
        "INSERT INTO words (user_id, english_word, russian_translation, examples) VALUES (%s, %s, %s, %s) RETURNING id",
        (user_id, english_word, russian_translation, examples)
    )
    word_id = cur.fetchone()['id']
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'word_id': word_id,
            'english_word': english_word,
            'russian_translation': russian_translation,
            'examples': examples
        }),
        'isBase64Encoded': False
    }

def add_words_batch(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('headers', {}).get('x-user-id')
    body_data = json.loads(event.get('body', '{}'))
    
    words_text = body_data.get('words', '')
    words_list = [w.strip().lower() for w in words_text.split(',') if w.strip()]
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    limit_check = check_limit(cur, int(user_id), 'words')
    
    if not limit_check['allowed'] or limit_check['remaining'] < len(words_list):
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Word limit reached', 'limit': True, 'tier': limit_check['tier']}),
            'isBase64Encoded': False
        }
    
    added_count = 0
    for word in words_list:
        try:
            prompt_translate = f"Translate this English word or phrase to Russian (only translation): {word}"
            russian_translation = call_ai(prompt_translate)
            
            prompt_examples = f"Generate 3 example sentences using '{word}' in English. One per line."
            examples_text = call_ai(prompt_examples)
            examples = [ex.strip() for ex in examples_text.split('\n') if ex.strip()][:3]
            
            cur.execute(
                "INSERT INTO words (user_id, english_word, russian_translation, examples) VALUES (%s, %s, %s, %s)",
                (user_id, word, russian_translation, examples)
            )
            added_count += 1
        except:
            pass
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'added': added_count}),
        'isBase64Encoded': False
    }

def get_words(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('headers', {}).get('x-user-id')
    params = event.get('queryStringParameters', {})
    status_filter = params.get('status', 'all')
    page = int(params.get('page', 1))
    limit = 10
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if status_filter != 'all':
        cur.execute(
            "SELECT * FROM words WHERE user_id = %s AND status = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (user_id, status_filter, limit, offset)
        )
    else:
        cur.execute(
            "SELECT * FROM words WHERE user_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (user_id, limit, offset)
        )
    
    words = cur.fetchall()
    
    cur.execute("SELECT COUNT(*) as count FROM words WHERE user_id = %s", (user_id,))
    total = cur.fetchone()['count']
    
    cur.close()
    conn.close()
    
    words_list = [dict(w) for w in words]
    for w in words_list:
        w['created_at'] = str(w['created_at'])
        w['last_recall_date'] = str(w['last_recall_date']) if w['last_recall_date'] else None
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'words': words_list, 'total': total}),
        'isBase64Encoded': False
    }

def update_word_status(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('headers', {}).get('x-user-id')
    body_data = json.loads(event.get('body', '{}'))
    
    word_id = body_data.get('word_id')
    new_status = body_data.get('status')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE words SET status = %s WHERE id = %s AND user_id = %s",
        (new_status, word_id, user_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'message': 'Status updated'}),
        'isBase64Encoded': False
    }

def delete_word(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('headers', {}).get('x-user-id')
    params = event.get('queryStringParameters', {})
    word_id = params.get('word_id')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM words WHERE id = %s AND user_id = %s", (word_id, user_id))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'message': 'Word deleted'}),
        'isBase64Encoded': False
    }

def complete_exercise(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('headers', {}).get('x-user-id')
    body_data = json.loads(event.get('body', '{}'))
    
    word_ids = body_data.get('word_ids', [])
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    for word_id in word_ids:
        cur.execute(
            "UPDATE words SET recall_count = recall_count + 1, last_recall_date = CURRENT_TIMESTAMP WHERE id = %s AND user_id = %s",
            (word_id, user_id)
        )
    
    today = date.today()
    cur.execute(
        "UPDATE users SET daily_exercises_count = daily_exercises_count + 1, last_exercise_date = %s WHERE id = %s",
        (today, user_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'message': 'Exercise completed'}),
        'isBase64Encoded': False
    }

def get_stats(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('headers', {}).get('x-user-id')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) as count FROM words WHERE user_id = %s AND status = 'learning'", (user_id,))
    learning_count = cur.fetchone()['count']
    
    cur.execute("SELECT COUNT(*) as count FROM words WHERE user_id = %s AND status = 'done'", (user_id,))
    done_count = cur.fetchone()['count']
    
    total_count = learning_count + done_count
    percent_done = round((done_count / total_count * 100) if total_count > 0 else 0, 1)
    
    cur.execute(
        "SELECT english_word, recall_count FROM words WHERE user_id = %s ORDER BY recall_count DESC LIMIT 1",
        (user_id,)
    )
    top_word = cur.fetchone()
    
    cur.execute("SELECT last_recall_date FROM words WHERE user_id = %s ORDER BY last_recall_date DESC LIMIT 1", (user_id,))
    last_recall = cur.fetchone()
    last_recall_date = str(last_recall['last_recall_date']) if last_recall and last_recall['last_recall_date'] else None
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'learning': learning_count,
            'done': done_count,
            'total': total_count,
            'percent_done': percent_done,
            'last_recall_date': last_recall_date,
            'top_word': dict(top_word) if top_word else None
        }),
        'isBase64Encoded': False
    }

def generate_translation(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    word = body_data.get('word', '')
    
    prompt = f"Translate to Russian (only translation): {word}"
    translation = call_ai(prompt)
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'translation': translation}),
        'isBase64Encoded': False
    }