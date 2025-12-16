-- Миграция для унификации системы подписок
-- Проблема: поля users.status и users.subscription_tier конфликтуют
-- Решение: добавляем недостающие поля в subscription_usage

-- Шаг 1: Добавляем недостающие поля в subscription_usage
ALTER TABLE subscription_usage 
ADD COLUMN IF NOT EXISTS current_tier VARCHAR(20) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP;

-- Шаг 2: Мигрируем данные из users в subscription_usage для существующих пользователей
INSERT INTO subscription_usage (user_id, current_tier, subscription_status, subscription_start, subscription_end, period_start, period_end, words_added, word_sets_added, exercises_completed, status_changes)
SELECT 
    u.id,
    COALESCE(u.subscription_tier, 'trial') as current_tier,
    CASE 
        WHEN u.trial_end_date IS NOT NULL AND u.trial_end_date > NOW() THEN 'active'
        WHEN u.subscription_end_date IS NOT NULL AND u.subscription_end_date > NOW() THEN 'active'
        ELSE 'inactive'
    END as subscription_status,
    COALESCE(u.subscription_start_date, u.created_at) as subscription_start,
    COALESCE(u.trial_end_date, u.subscription_end_date) as subscription_end,
    DATE_TRUNC('month', CURRENT_DATE)::DATE as period_start,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE as period_end,
    0, 0, 0, 0
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM subscription_usage su WHERE su.user_id = u.id
);

-- Шаг 3: Создаём индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_subscription_usage_status ON subscription_usage(user_id, subscription_status, subscription_end);

-- Шаг 4: Обновляем users.status на основе subscription_usage (для обратной совместимости со старым кодом)
UPDATE users u
SET status = CASE 
    WHEN EXISTS (
        SELECT 1 FROM subscription_usage su 
        WHERE su.user_id = u.id 
        AND su.subscription_status = 'active' 
        AND su.subscription_end > NOW()
        AND su.current_tier IN ('basic', 'pro', 'unlimited')
    ) THEN 'premium'
    ELSE 'free'
END;