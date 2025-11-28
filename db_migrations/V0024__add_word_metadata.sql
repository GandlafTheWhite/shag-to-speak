-- Add metadata fields to words table for enhanced exercise system
ALTER TABLE words ADD COLUMN IF NOT EXISTS transcription VARCHAR(255);
ALTER TABLE words ADD COLUMN IF NOT EXISTS part_of_speech VARCHAR(50);
ALTER TABLE words ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'master'));
ALTER TABLE words ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE words ADD COLUMN IF NOT EXISTS example_sentence TEXT;

-- Add index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_user_category ON words(user_id, category);
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty_level);

COMMENT ON COLUMN words.transcription IS 'Phonetic transcription (IPA format)';
COMMENT ON COLUMN words.part_of_speech IS 'Part of speech: noun, verb, adjective, adverb, etc.';
COMMENT ON COLUMN words.difficulty_level IS 'Word difficulty level for adaptive exercises';
COMMENT ON COLUMN words.audio_url IS 'URL to audio pronunciation file';
COMMENT ON COLUMN words.example_sentence IS 'Example sentence using this word';
