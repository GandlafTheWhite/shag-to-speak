-- Add profile_completed flag for new users onboarding
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT TRUE;

-- Set profile_completed to FALSE only for Telegram-only registrations (email like 'tg%@shagtospeak.ru')
UPDATE users SET profile_completed = FALSE WHERE email LIKE 'tg%@shagtospeak.ru';