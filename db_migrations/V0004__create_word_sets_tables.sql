-- Таблица наборов слов
CREATE TABLE IF NOT EXISTS t_p7147437_shag_to_speak.word_sets (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    description TEXT,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица слов в наборах
CREATE TABLE IF NOT EXISTS t_p7147437_shag_to_speak.word_set_items (
    id SERIAL PRIMARY KEY,
    set_id VARCHAR(100) NOT NULL,
    english_word VARCHAR(100) NOT NULL,
    russian_translation TEXT NOT NULL,
    examples TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(set_id, english_word)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_word_set_items_set_id ON t_p7147437_shag_to_speak.word_set_items(set_id);

COMMENT ON TABLE t_p7147437_shag_to_speak.word_sets IS 'Готовые наборы слов для изучения';
COMMENT ON TABLE t_p7147437_shag_to_speak.word_set_items IS 'Слова с переводами и примерами в наборах';
