"""
Helper функция для проверки статуса подписки пользователя
Используется во всех backend функциях вместо users.status
"""

from datetime import datetime
from typing import Dict, Any, Optional
import psycopg2.extras


def get_user_subscription(cursor: psycopg2.extras.RealDictCursor, user_id: int) -> Dict[str, Any]:
    """
    Получает актуальные данные подписки пользователя
    
    Args:
        cursor: курсор БД с RealDictCursor
        user_id: ID пользователя
    
    Returns:
        Dict с полями:
        - tier: текущий тариф (none/basic/pro/unlimited/trial)
        - is_active: активна ли подписка (bool)
        - limits: dict с лимитами (words_limit, exercises_limit и тд)
        - subscription_end: дата окончания подписки
    """
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
        return {
            'tier': 'none',
            'is_active': False,
            'limits': {
                'words_limit': 0,
                'exercises_limit': 0,
                'word_sets_limit': 0,
                'status_changes_limit': 0
            },
            'subscription_end': None
        }
    
    now = datetime.now()
    sub_end = sub['subscription_end']
    
    is_active = (
        sub['subscription_status'] == 'active' and
        sub_end is not None and
        now < sub_end
    )
    
    return {
        'tier': sub['current_tier'] or 'none',
        'is_active': is_active,
        'limits': {
            'words_limit': sub['words_limit'] or 0,
            'exercises_limit': sub['exercises_limit'] or 0,
            'word_sets_limit': sub['word_sets_limit'] or 0,
            'status_changes_limit': sub['status_changes_limit'] or 0
        },
        'subscription_end': sub_end.isoformat() if sub_end else None
    }


def check_limit(cursor: psycopg2.extras.RealDictCursor, user_id: int, limit_type: str) -> Dict[str, Any]:
    """
    Проверяет, не превышен ли лимит пользователя
    
    Args:
        cursor: курсор БД
        user_id: ID пользователя
        limit_type: тип лимита ('words', 'exercises', 'word_sets', 'status_changes')
    
    Returns:
        Dict с полями:
        - allowed: можно ли выполнить действие (bool)
        - used: использовано
        - limit: лимит
        - remaining: осталось
    """
    subscription = get_user_subscription(cursor, user_id)
    
    if not subscription['is_active']:
        return {
            'allowed': False,
            'used': 0,
            'limit': 0,
            'remaining': 0,
            'tier': subscription['tier']
        }
    
    limit_field_map = {
        'words': ('words_limit', 'words_added'),
        'exercises': ('exercises_limit', 'exercises_completed'),
        'word_sets': ('word_sets_limit', 'word_sets_added'),
        'status_changes': ('status_changes_limit', 'status_changes')
    }
    
    if limit_type not in limit_field_map:
        raise ValueError(f"Unknown limit_type: {limit_type}")
    
    limit_field, usage_field = limit_field_map[limit_type]
    limit_value = subscription['limits'][limit_field]
    
    cursor.execute(
        f"""SELECT {usage_field} FROM t_p7147437_shag_to_speak.subscription_usage
            WHERE user_id = %s
            ORDER BY subscription_end DESC NULLS LAST
            LIMIT 1""",
        (user_id,)
    )
    
    usage_row = cursor.fetchone()
    used = usage_row[usage_field] if usage_row else 0
    
    if limit_value == -1:
        remaining = -1
        allowed = True
    else:
        remaining = max(0, limit_value - used)
        allowed = remaining > 0
    
    return {
        'allowed': allowed,
        'used': used,
        'limit': limit_value,
        'remaining': remaining,
        'tier': subscription['tier']
    }
