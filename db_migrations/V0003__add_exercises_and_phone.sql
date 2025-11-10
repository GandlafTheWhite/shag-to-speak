-- Добавляем поле телефона в users
ALTER TABLE t_p7147437_shag_to_speak.users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Создаём таблицу exercises для истории упражнений
CREATE TABLE IF NOT EXISTS t_p7147437_shag_to_speak.exercises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p7147437_shag_to_speak.users(id),
    word_id INTEGER NOT NULL REFERENCES t_p7147437_shag_to_speak.words(id),
    exercise_type VARCHAR(50) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    user_answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаём индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON t_p7147437_shag_to_speak.exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_word_id ON t_p7147437_shag_to_speak.exercises(word_id);
CREATE INDEX IF NOT EXISTS idx_exercises_created_at ON t_p7147437_shag_to_speak.exercises(created_at);

-- Создаём таблицу для отслеживания прогресса по словам
CREATE TABLE IF NOT EXISTS t_p7147437_shag_to_speak.word_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p7147437_shag_to_speak.users(id),
    word_id INTEGER NOT NULL REFERENCES t_p7147437_shag_to_speak.words(id),
    correct_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP,
    next_review TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id)
);

-- Индекс для word_progress
CREATE INDEX IF NOT EXISTS idx_word_progress_user_word ON t_p7147437_shag_to_speak.word_progress(user_id, word_id);
CREATE INDEX IF NOT EXISTS idx_word_progress_next_review ON t_p7147437_shag_to_speak.word_progress(next_review);