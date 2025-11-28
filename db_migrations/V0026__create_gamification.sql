-- Add gamification fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_exercise_date DATE;

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    achievement_code VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_code)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_code ON user_achievements(achievement_code);

COMMENT ON TABLE user_achievements IS 'Tracks unlocked achievements for each user';
COMMENT ON COLUMN users.total_points IS 'Total points earned across all exercises';
COMMENT ON COLUMN users.current_streak IS 'Current daily exercise streak';
COMMENT ON COLUMN users.longest_streak IS 'Longest daily exercise streak achieved';
COMMENT ON COLUMN users.last_exercise_date IS 'Date of last completed exercise (for streak tracking)';
