-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'free' CHECK (status IN ('free', 'premium')),
    preferences TEXT[] DEFAULT '{}',
    daily_exercises_count INTEGER DEFAULT 0,
    last_exercise_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create words table
CREATE TABLE IF NOT EXISTS words (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    english_word VARCHAR(255) NOT NULL,
    russian_translation TEXT NOT NULL,
    examples TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'learning' CHECK (status IN ('learning', 'done')),
    recall_count INTEGER DEFAULT 0,
    last_recall_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, english_word)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_words_user_status ON words(user_id, status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);