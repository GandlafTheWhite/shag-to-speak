-- Создание таблицы для хранения фраз/предложений пользователей
CREATE TABLE t_p7147437_shag_to_speak.sentences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p7147437_shag_to_speak.users(id),
  english_text TEXT NOT NULL,
  russian_translation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска фраз пользователя
CREATE INDEX idx_sentences_user_id ON t_p7147437_shag_to_speak.sentences(user_id);

-- Комментарии
COMMENT ON TABLE t_p7147437_shag_to_speak.sentences IS 'Хранит фразы и предложения пользователей (не участвуют в упражнениях)';
COMMENT ON COLUMN t_p7147437_shag_to_speak.sentences.english_text IS 'Фраза на английском языке';
COMMENT ON COLUMN t_p7147437_shag_to_speak.sentences.russian_translation IS 'Перевод фразы на русский (генерируется AI)';