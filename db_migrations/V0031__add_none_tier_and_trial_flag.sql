-- Добавляем тариф 'none' для пользователей без подписки
INSERT INTO t_p7147437_shag_to_speak.subscription_plans (tier, price_rub, words_limit, word_sets_limit, exercises_limit, status_changes_limit, is_active) 
VALUES ('none', 0, 0, 0, 0, 0, TRUE)
ON CONFLICT (tier) DO NOTHING;

-- Добавляем поле is_trial_used в users если его нет
ALTER TABLE t_p7147437_shag_to_speak.users 
ADD COLUMN IF NOT EXISTS is_trial_used BOOLEAN DEFAULT FALSE;