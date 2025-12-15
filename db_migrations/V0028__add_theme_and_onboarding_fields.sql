ALTER TABLE users 
ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

UPDATE users SET onboarding_completed = TRUE WHERE profile_completed = TRUE;