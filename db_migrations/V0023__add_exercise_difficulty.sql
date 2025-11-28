-- Add exercise difficulty preference to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS exercise_difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (exercise_difficulty IN ('beginner', 'intermediate', 'advanced', 'master'));

COMMENT ON COLUMN users.exercise_difficulty IS 'User preferred difficulty level: beginner (A1-A2), intermediate (B1-B2), advanced (C1), master (C2)';
