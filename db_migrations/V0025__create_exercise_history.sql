-- Create exercise_history table to track all exercise attempts
CREATE TABLE IF NOT EXISTS exercise_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    word_id INTEGER NOT NULL REFERENCES words(id),
    exercise_type VARCHAR(50) NOT NULL CHECK (exercise_type IN (
        'translation', 'multiple_choice', 'synonym_antonym', 'sentence_construction',
        'fill_blank', 'context_match', 'reverse_translation', 'word_formation'
    )),
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'master')),
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER,
    points_earned INTEGER DEFAULT 0,
    user_answer TEXT,
    correct_answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercise_history_user ON exercise_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_history_word ON exercise_history(word_id);
CREATE INDEX IF NOT EXISTS idx_exercise_history_created ON exercise_history(created_at);
CREATE INDEX IF NOT EXISTS idx_exercise_history_user_created ON exercise_history(user_id, created_at DESC);

COMMENT ON TABLE exercise_history IS 'Tracks all exercise attempts for analytics and adaptive learning';
COMMENT ON COLUMN exercise_history.time_spent_seconds IS 'Time user spent on this exercise';
COMMENT ON COLUMN exercise_history.points_earned IS 'Points earned for this attempt (based on difficulty, speed, streak)';
