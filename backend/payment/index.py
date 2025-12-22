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


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-MerchantId, X-Secret',
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
            
            cursor.execute(
                "SELECT price_rub FROM t_p7147437_shag_to_speak.subscription_plans WHERE tier = %s",
                (tier,)
            )
            plan = cursor.fetchone()
            
            if not plan:
                return error_response(400, 'Invalid tier')
            
            amount = plan['price_rub']
            
            platega_payload = {
                'paymentMethod': 10,
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
            payment_method = platega_data.get('paymentMethod')
            
            if not transaction_id or not redirect_url:
                return error_response(500, 'Invalid Platega response')
            
            cursor.execute(
                """INSERT INTO t_p7147437_shag_to_speak.payment_transactions 
                   (user_id, transaction_id, tier, amount, status, payment_method)
                   VALUES (%s, %s, %s, %s, 'PENDING', %s)
                   RETURNING id""",
                (user_id, transaction_id, tier, amount, payment_method)
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
        
        elif method == 'POST' and action == 'callback':
            merchant_id = headers.get('X-MerchantId') or headers.get('x-merchantid')
            secret = headers.get('X-Secret') or headers.get('x-secret')
            
            if merchant_id != os.environ['PLATEGA_MERCHANT_ID'] or secret != os.environ['PLATEGA_SECRET']:
                return error_response(401, 'Invalid credentials')
            
            body_data = json.loads(event.get('body', '{}'))
            transaction_id = body_data.get('id')
            payment_status = body_data.get('status')
            
            if not transaction_id:
                return error_response(400, 'Transaction ID required')
            
            cursor.execute(
                """SELECT user_id, tier, amount FROM t_p7147437_shag_to_speak.payment_transactions 
                   WHERE transaction_id = %s""",
                (transaction_id,)
            )
            transaction = cursor.fetchone()
            
            if not transaction:
                return error_response(404, 'Transaction not found')
            
            if payment_status == 'CONFIRMED':
                user_id = transaction['user_id']
                tier = transaction['tier']
                
                now = datetime.now()
                subscription_start = now
                subscription_end = now + timedelta(days=30)
                period_start = datetime(now.year, now.month, 1).date()
                period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                
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
                       WHERE user_id = %s AND period_start = %s""",
                    (tier, subscription_start, subscription_end, user_id, period_start)
                )
                
                if cursor.rowcount == 0:
                    cursor.execute(
                        """INSERT INTO t_p7147437_shag_to_speak.subscription_usage
                           (user_id, current_tier, subscription_status, subscription_start, subscription_end,
                            period_start, period_end, words_added, word_sets_added, exercises_completed, status_changes)
                           VALUES (%s, %s, 'active', %s, %s, %s, %s, 0, 0, 0, 0)""",
                        (user_id, tier, subscription_start, subscription_end, period_start, period_end)
                    )
                
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.users
                       SET status = %s
                       WHERE id = %s""",
                    ('premium' if tier in ('basic', 'pro', 'unlimited') else 'free', user_id)
                )
                
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.payment_transactions
                       SET status = 'CONFIRMED', confirmed_at = %s
                       WHERE transaction_id = %s""",
                    (now, transaction_id)
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Subscription activated', 'tier': tier}),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.payment_transactions
                       SET status = 'CANCELED'
                       WHERE transaction_id = %s""",
                    (transaction_id,)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Payment canceled'}),
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