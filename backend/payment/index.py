"""
Управление подписками: получение статуса, создание платежа (заглушка), обработка webhook
"""

import json
import os
from typing import Dict, Any, Tuple
from datetime import datetime, timedelta
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor


def check_limit(cursor, user_id: int, limit_type: str) -> Tuple[bool, str]:
    """Проверяет лимит и возвращает (success, error_message)"""
    cursor.execute(
        """SELECT subscription_tier, subscription_end_date, trial_end_date 
           FROM users WHERE id = %s""",
        (user_id,)
    )
    user = cursor.fetchone()
    
    if not user:
        return False, 'User not found'
    
    tier = user['subscription_tier']
    now = datetime.now()
    
    if tier == 'trial':
        if not user['trial_end_date'] or now > user['trial_end_date']:
            return False, '⚠️ Пробный период истёк. Оформите подписку для продолжения.'
    elif not user['subscription_end_date'] or now > user['subscription_end_date']:
        return False, '⚠️ Подписка истекла. Продлите доступ для продолжения.'
    
    cursor.execute(
        f"SELECT {limit_type}_limit FROM subscription_plans WHERE tier = %s",
        (tier if tier != 'trial' else 'basic',)
    )
    plan = cursor.fetchone()
    limit = plan[f'{limit_type}_limit']
    
    if limit == -1:
        return True, ''
    
    period_start = datetime(now.year, now.month, 1).date()
    cursor.execute(
        f"""SELECT {limit_type} FROM subscription_usage 
           WHERE user_id = %s AND period_start = %s""",
        (user_id, period_start)
    )
    usage = cursor.fetchone()
    current = usage[limit_type] if usage else 0
    
    if current >= limit:
        messages = {
            'words_added': 'Достигнут лимит добавления слов',
            'word_sets_added': 'Достигнут лимит добавления наборов',
            'exercises_completed': 'Достигнут лимит упражнений',
            'status_changes': 'Достигнут лимит изменений статуса'
        }
        return False, f"⚠️ {messages[limit_type]}. Обновите подписку!"
    
    return True, ''


def increment_usage(cursor, conn, user_id: int, limit_type: str):
    """Увеличить счётчик использования"""
    now = datetime.now()
    period_start = datetime(now.year, now.month, 1).date()
    period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    
    cursor.execute(
        """INSERT INTO subscription_usage (user_id, period_start, period_end)
           VALUES (%s, %s, %s)
           ON CONFLICT (user_id, period_start) DO NOTHING""",
        (user_id, period_start, period_end)
    )
    
    cursor.execute(
        f"""UPDATE subscription_usage 
           SET {limit_type} = {limit_type} + 1
           WHERE user_id = %s AND period_start = %s""",
        (user_id, period_start)
    )
    conn.commit()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id_str = headers.get('X-User-Id') or headers.get('x-user-id')
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'status')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET' and action == 'status':
            if not user_id_str:
                return error_response(401, 'User ID required')
            
            user_id = int(user_id_str)
            
            cursor.execute(
                """SELECT subscription_tier, subscription_end_date, trial_end_date, is_trial_used
                   FROM users WHERE id = %s""",
                (user_id,)
            )
            user = cursor.fetchone()
            
            if not user:
                return error_response(404, 'User not found')
            
            now = datetime.now()
            tier = user['subscription_tier']
            is_trial = tier == 'trial'
            is_active = False
            trial_days_left = 0
            
            if is_trial and user['trial_end_date']:
                trial_end = user['trial_end_date']
                is_active = now < trial_end
                trial_days_left = max(0, (trial_end - now).days)
            elif user['subscription_end_date']:
                is_active = now < user['subscription_end_date']
            
            cursor.execute(
                """SELECT words_limit, word_sets_limit, exercises_limit, status_changes_limit
                   FROM subscription_plans WHERE tier = %s""",
                (tier if tier != 'trial' else 'basic',)
            )
            limits = cursor.fetchone()
            
            period_start = datetime(now.year, now.month, 1).date()
            cursor.execute(
                """SELECT words_added, word_sets_added, exercises_completed, status_changes
                   FROM subscription_usage 
                   WHERE user_id = %s AND period_start = %s""",
                (user_id, period_start)
            )
            usage = cursor.fetchone() or {
                'words_added': 0, 'word_sets_added': 0,
                'exercises_completed': 0, 'status_changes': 0
            }
            
            cursor.execute("SELECT tier, price_rub FROM subscription_plans WHERE is_active = TRUE ORDER BY price_rub")
            plans = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'tier': tier,
                    'status': 'active' if is_active else 'expired',
                    'is_trial': is_trial,
                    'trial_days_left': trial_days_left,
                    'subscription_end_date': user['subscription_end_date'].isoformat() if user['subscription_end_date'] else None,
                    'limits': {
                        'words_added': {
                            'used': usage['words_added'],
                            'limit': limits['words_limit'],
                            'remaining': limits['words_limit'] - usage['words_added'] if limits['words_limit'] > 0 else -1
                        },
                        'word_sets_added': {
                            'used': usage['word_sets_added'],
                            'limit': limits['word_sets_limit'],
                            'remaining': limits['word_sets_limit'] - usage['word_sets_added'] if limits['word_sets_limit'] > 0 else -1
                        },
                        'exercises_completed': {
                            'used': usage['exercises_completed'],
                            'limit': limits['exercises_limit'],
                            'remaining': limits['exercises_limit'] - usage['exercises_completed'] if limits['exercises_limit'] > 0 else -1
                        },
                        'status_changes': {
                            'used': usage['status_changes'],
                            'limit': limits['status_changes_limit'],
                            'remaining': limits['status_changes_limit'] - usage['status_changes'] if limits['status_changes_limit'] > 0 else -1
                        }
                    },
                    'available_plans': [{'tier': p['tier'], 'price': p['price_rub']} for p in plans]
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'create':
            if not user_id_str:
                return error_response(401, 'User ID required')
            
            user_id = int(user_id_str)
            body_data = json.loads(event.get('body', '{}'))
            tier = body_data.get('tier', 'basic')
            
            cursor.execute("SELECT price_rub FROM subscription_plans WHERE tier = %s", (tier,))
            plan = cursor.fetchone()
            
            if not plan:
                return error_response(400, 'Invalid tier')
            
            amount = plan['price_rub']
            transaction_id = str(uuid.uuid4())
            
            cursor.execute(
                """INSERT INTO payment_transactions (user_id, transaction_id, tier, amount, status)
                   VALUES (%s, %s, %s, %s, 'PENDING')
                   RETURNING id""",
                (user_id, transaction_id, tier, amount)
            )
            conn.commit()
            
            mock_redirect_url = f"https://mock-payment.example.com/pay?transaction={transaction_id}"
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'transaction_id': transaction_id,
                    'redirect_url': mock_redirect_url,
                    'amount': amount,
                    'tier': tier,
                    'message': '⚠️ Это заглушка оплаты. Реальная интеграция с Platega будет добавлена позже.'
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'callback':
            body_data = json.loads(event.get('body', '{}'))
            transaction_id = body_data.get('id')
            status = body_data.get('status')
            
            if not transaction_id:
                return error_response(400, 'Transaction ID required')
            
            cursor.execute(
                """SELECT user_id, tier FROM payment_transactions 
                   WHERE transaction_id = %s""",
                (transaction_id,)
            )
            transaction = cursor.fetchone()
            
            if not transaction:
                return error_response(404, 'Transaction not found')
            
            user_id = transaction['user_id']
            tier = transaction['tier']
            
            if status == 'CONFIRMED':
                now = datetime.now()
                end_date = now + timedelta(days=30)
                
                cursor.execute(
                    """UPDATE users 
                       SET subscription_tier = %s, 
                           subscription_start_date = %s,
                           subscription_end_date = %s
                       WHERE id = %s""",
                    (tier, now, end_date, user_id)
                )
                
                cursor.execute(
                    """UPDATE payment_transactions 
                       SET status = 'CONFIRMED', confirmed_at = %s
                       WHERE transaction_id = %s""",
                    (now, transaction_id)
                )
                
                period_start = datetime(now.year, now.month, 1).date()
                period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                
                cursor.execute(
                    """INSERT INTO subscription_usage (user_id, period_start, period_end)
                       VALUES (%s, %s, %s)
                       ON CONFLICT (user_id, period_start) DO NOTHING""",
                    (user_id, period_start, period_end)
                )
                
                conn.commit()
            
            elif status == 'CANCELED':
                cursor.execute(
                    """UPDATE payment_transactions 
                       SET status = 'CANCELED'
                       WHERE transaction_id = %s""",
                    (transaction_id,)
                )
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return error_response(400, 'Invalid action')
    
    except Exception as e:
        print(f'Error: {str(e)}')
        return error_response(500, f'Server error: {str(e)}')
    
    finally:
        cursor.close()
        conn.close()


def error_response(status_code: int, message: str) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }
