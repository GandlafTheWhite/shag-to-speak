"""
Управление подписками: получение статуса, создание платежа (заглушка), обработка webhook
"""

import json
import os
from typing import Dict, Any
from datetime import datetime, timedelta
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
import requests


def error_response(status: int, message: str) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }


def activate_subscription(cursor, conn, user_id: int, tier: str) -> None:
    """
    Активирует или продлевает подписку пользователя
    - Trial → платная: меняем тариф, сбрасываем лимиты, +30 дней
    - Та же подписка: продлеваем на +30 дней
    - Апгрейд: меняем тариф, лимиты НЕ сбрасываем, +30 дней
    """
    now = datetime.now()
    
    cursor.execute(
        """SELECT current_tier, subscription_end, subscription_status
           FROM t_p7147437_shag_to_speak.subscription_usage
           WHERE user_id = %s
           ORDER BY subscription_end DESC NULLS LAST
           LIMIT 1""",
        (user_id,)
    )
    current_sub = cursor.fetchone()
    
    if not current_sub:
        new_end = now + timedelta(days=30)
        period_start = datetime(now.year, now.month, 1).date()
        period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        cursor.execute(
            """INSERT INTO t_p7147437_shag_to_speak.subscription_usage
               (user_id, current_tier, subscription_status, subscription_start, subscription_end,
                period_start, period_end, words_added, word_sets_added, exercises_completed, status_changes)
               VALUES (%s, %s, 'active', %s, %s, %s, %s, 0, 0, 0, 0)""",
            (user_id, tier, now, new_end, period_start, period_end)
        )
        conn.commit()
        return
    
    current_tier = current_sub['current_tier']
    sub_end = current_sub['subscription_end']
    is_active = current_sub['subscription_status'] == 'active' and sub_end and now < sub_end
    
    if current_tier == 'trial':
        new_end = now + timedelta(days=30)
        cursor.execute(
            """UPDATE t_p7147437_shag_to_speak.subscription_usage
               SET current_tier = %s,
                   subscription_status = 'active',
                   subscription_start = %s,
                   subscription_end = %s,
                   words_added = 0,
                   word_sets_added = 0,
                   exercises_completed = 0,
                   status_changes = 0
               WHERE user_id = %s""",
            (tier, now, new_end, user_id)
        )
    else:
        if is_active:
            new_end = sub_end + timedelta(days=30)
        else:
            new_end = now + timedelta(days=30)
        
        cursor.execute(
            """UPDATE t_p7147437_shag_to_speak.subscription_usage
               SET current_tier = %s,
                   subscription_status = 'active',
                   subscription_end = %s
               WHERE user_id = %s""",
            (tier, new_end, user_id)
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
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-MerchantId, X-Secret, X-Transaction-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id_str = headers.get('X-User-Id') or headers.get('x-user-id')
    merchant_id = headers.get('X-MerchantId') or headers.get('x-merchantid')
    secret = headers.get('X-Secret') or headers.get('x-secret')
    
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
                """SELECT su.current_tier, su.subscription_status, su.subscription_start, su.subscription_end,
                          su.words_added, su.word_sets_added, su.exercises_completed, su.status_changes,
                          u.is_trial_used
                   FROM t_p7147437_shag_to_speak.subscription_usage su
                   JOIN t_p7147437_shag_to_speak.users u ON u.id = su.user_id
                   WHERE su.user_id = %s
                   ORDER BY su.subscription_end DESC NULLS LAST
                   LIMIT 1""",
                (user_id,)
            )
            subscription = cursor.fetchone()
            
            if not subscription:
                return error_response(404, 'Subscription not found')
            
            now = datetime.now()
            tier = subscription['current_tier']
            status = subscription['subscription_status']
            sub_end = subscription['subscription_end']
            
            is_trial = tier == 'trial'
            is_active = status == 'active' and sub_end and now < sub_end
            trial_days_left = 0
            
            if is_trial and sub_end:
                trial_days_left = max(0, (sub_end - now).days)
            
            cursor.execute(
                """SELECT words_limit, word_sets_limit, exercises_limit, status_changes_limit
                   FROM t_p7147437_shag_to_speak.subscription_plans WHERE tier = %s""",
                (tier if tier != 'trial' else 'basic',)
            )
            limits = cursor.fetchone()
            
            if not limits:
                limits = {'words_limit': 60, 'word_sets_limit': 4, 'exercises_limit': 20, 'status_changes_limit': 10}
            
            cursor.execute(
                "SELECT tier, price_rub FROM t_p7147437_shag_to_speak.subscription_plans WHERE is_active = TRUE ORDER BY price_rub"
            )
            plans = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'tier': tier,
                    'status': 'active' if is_active else 'expired',
                    'is_trial': is_trial,
                    'trial_days_left': trial_days_left,
                    'subscription_end_date': sub_end.isoformat() if sub_end else None,
                    'can_activate_trial': not subscription['is_trial_used'],
                    'limits': {
                        'words_added': {
                            'used': subscription['words_added'],
                            'limit': limits['words_limit'],
                            'remaining': limits['words_limit'] - subscription['words_added'] if limits['words_limit'] > 0 else -1
                        },
                        'word_sets_added': {
                            'used': subscription['word_sets_added'],
                            'limit': limits['word_sets_limit'],
                            'remaining': limits['word_sets_limit'] - subscription['word_sets_added'] if limits['word_sets_limit'] > 0 else -1
                        },
                        'exercises_completed': {
                            'used': subscription['exercises_completed'],
                            'limit': limits['exercises_limit'],
                            'remaining': limits['exercises_limit'] - subscription['exercises_completed'] if limits['exercises_limit'] > 0 else -1
                        },
                        'status_changes': {
                            'used': subscription['status_changes'],
                            'limit': limits['status_changes_limit'],
                            'remaining': limits['status_changes_limit'] - subscription['status_changes'] if limits['status_changes_limit'] > 0 else -1
                        }
                    },
                    'available_plans': [{'tier': p['tier'], 'price': p['price_rub']} for p in plans]
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'activate_trial':
            if not user_id_str:
                return error_response(401, 'User ID required')
            
            user_id = int(user_id_str)
            
            cursor.execute(
                """SELECT is_trial_used FROM t_p7147437_shag_to_speak.users WHERE id = %s""",
                (user_id,)
            )
            user = cursor.fetchone()
            
            if not user:
                return error_response(404, 'User not found')
            
            if user['is_trial_used']:
                return error_response(400, 'Пробный период уже был использован')
            
            now = datetime.now()
            trial_start = now
            trial_end = now + timedelta(days=7)
            period_start = datetime(now.year, now.month, 1).date()
            period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            cursor.execute(
                """UPDATE t_p7147437_shag_to_speak.subscription_usage
                   SET current_tier = 'trial',
                       subscription_status = 'active',
                       subscription_start = %s,
                       subscription_end = %s,
                       words_added = 0,
                       word_sets_added = 0,
                       exercises_completed = 0,
                       status_changes = 0
                   WHERE user_id = %s AND period_start = %s""",
                (trial_start, trial_end, user_id, period_start)
            )
            
            if cursor.rowcount == 0:
                cursor.execute(
                    """INSERT INTO t_p7147437_shag_to_speak.subscription_usage
                       (user_id, current_tier, subscription_status, subscription_start, subscription_end,
                        period_start, period_end, words_added, word_sets_added, exercises_completed, status_changes)
                       VALUES (%s, 'trial', 'active', %s, %s, %s, %s, 0, 0, 0, 0)""",
                    (user_id, trial_start, trial_end, period_start, period_end)
                )
            
            cursor.execute(
                """UPDATE t_p7147437_shag_to_speak.users
                   SET is_trial_used = TRUE
                   WHERE id = %s""",
                (user_id,)
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': '🎉 Пробный период на 7 дней активирован!',
                    'trial_end_date': trial_end.isoformat()
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'create':
            if not user_id_str:
                return error_response(401, 'User ID required')
            
            user_id = int(user_id_str)
            body_data = json.loads(event.get('body', '{}'))
            tier = body_data.get('tier', 'basic')
            
            # Для тестового тарифа используем фиксированную сумму
            if tier == 'test':
                amount = 10
            else:
                cursor.execute(
                    "SELECT price_rub FROM t_p7147437_shag_to_speak.subscription_plans WHERE tier = %s",
                    (tier,)
                )
                plan = cursor.fetchone()
                
                if not plan:
                    return error_response(400, 'Invalid tier')
                
                amount = plan['price_rub']
            
            platega_payload = {
                'paymentMethod': 2,
                'paymentDetails': {
                    'amount': float(amount),
                    'currency': 'RUB'
                },
                'description': f'Подписка ShagToSpeak - тариф {tier}',
                'return': 'https://airnold.poehali.dev/?payment=success',
                'failedUrl': 'https://airnold.poehali.dev/?payment=failed',
                'payload': json.dumps({'user_id': user_id, 'tier': tier})
            }
            
            platega_response = requests.post(
                'https://app.platega.io/transaction/process',
                headers={
                    'Content-Type': 'application/json',
                    'X-MerchantId': os.environ['PLATEGA_MERCHANT_ID'],
                    'X-Secret': os.environ['PLATEGA_SECRET']
                },
                json=platega_payload,
                timeout=10
            )
            
            if platega_response.status_code != 200:
                return error_response(500, f'Platega API error: {platega_response.text}')
            
            platega_data = platega_response.json()
            transaction_id = platega_data.get('transactionId')
            redirect_url = platega_data.get('redirect')
            
            if not transaction_id or not redirect_url:
                return error_response(500, 'Invalid Platega response')
            
            cursor.execute(
                """INSERT INTO t_p7147437_shag_to_speak.payment_transactions 
                   (user_id, transaction_id, tier, amount, status, payment_method)
                   VALUES (%s, %s, %s, %s, 'PENDING', %s)
                   RETURNING id""",
                (user_id, transaction_id, tier, amount, 2)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'transaction_id': transaction_id,
                    'redirect_url': redirect_url,
                    'amount': amount,
                    'tier': tier
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'webhook':
            expected_merchant_id = os.environ.get('PLATEGA_MERCHANT_ID')
            expected_secret = os.environ.get('PLATEGA_SECRET')
            
            if not merchant_id or not secret:
                return error_response(401, 'Missing authentication headers')
            
            if merchant_id != expected_merchant_id or secret != expected_secret:
                return error_response(403, 'Invalid credentials')
            
            body_data = json.loads(event.get('body', '{}'))
            transaction_id = body_data.get('transactionId')
            status = body_data.get('status')
            payload_str = body_data.get('payload', '{}')
            
            if not transaction_id:
                return error_response(400, 'Missing transactionId')
            
            try:
                payload = json.loads(payload_str) if isinstance(payload_str, str) else payload_str
                tier = payload.get('tier')
            except:
                tier = None
            
            cursor.execute(
                """SELECT user_id, tier, status FROM t_p7147437_shag_to_speak.payment_transactions
                   WHERE transaction_id = %s""",
                (transaction_id,)
            )
            transaction = cursor.fetchone()
            
            if not transaction:
                return error_response(404, 'Transaction not found')
            
            if transaction['status'] == 'COMPLETED':
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Already processed'}),
                    'isBase64Encoded': False
                }
            
            if status == 'success' or status == 'SUCCESS':
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.payment_transactions
                       SET status = 'COMPLETED', confirmed_at = %s
                       WHERE transaction_id = %s""",
                    (datetime.now(), transaction_id)
                )
                conn.commit()
                
                subscription_tier = tier or transaction['tier']
                
                # Только для НЕ тестовых платежей активируем подписку
                if subscription_tier != 'test':
                    activate_subscription(cursor, conn, transaction['user_id'], subscription_tier)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Payment processed successfully'}),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.payment_transactions
                       SET status = 'FAILED'
                       WHERE transaction_id = %s""",
                    (transaction_id,)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Payment failed'}),
                    'isBase64Encoded': False
                }
        

        
        else:
            return error_response(400, f'Unknown action: {action}')
    
    except Exception as e:
        conn.rollback()
        return error_response(500, str(e))
    
    finally:
        cursor.close()
        conn.close()