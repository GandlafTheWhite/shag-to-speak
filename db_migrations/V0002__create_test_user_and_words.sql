-- Create test user with test words
INSERT INTO users (email, password_hash, name, status, preferences, daily_exercises_count) 
VALUES ('test@shagtospeak.com', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', 'Тестовый пользователь', 'free', ARRAY['travel', 'business', 'technology'], 0);

-- Add sample words for test user
INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'serendipity',
  'счастливая случайность',
  ARRAY['It was pure serendipity that we met at the coffee shop.', 'The discovery was a moment of serendipity.', 'Serendipity played a role in their success.'],
  'learning',
  3;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'embrace',
  'принимать, обнимать',
  ARRAY['We should embrace new challenges.', 'She embraced her friend warmly.', 'The company embraced digital transformation.'],
  'learning',
  5;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'resilient',
  'стойкий, устойчивый',
  ARRAY['She proved to be resilient in difficult times.', 'The city is resilient after the storm.', 'Building resilient systems is crucial.'],
  'done',
  10;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'abundant',
  'изобильный, обильный',
  ARRAY['The forest has abundant wildlife.', 'There is abundant evidence to support this.', 'She has abundant energy.'],
  'learning',
  2;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'mindful',
  'внимательный, осознанный',
  ARRAY['Be mindful of your surroundings.', 'She practices mindful meditation.', 'We should be mindful of the environment.'],
  'learning',
  4;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'journey',
  'путешествие, путь',
  ARRAY['Life is a journey, not a destination.', 'The journey took three hours.', 'This is an important part of your journey.'],
  'learning',
  6;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'achieve',
  'достигать, добиваться',
  ARRAY['You can achieve anything you set your mind to.', 'They achieved their goals.', 'Hard work helps you achieve success.'],
  'learning',
  8;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'inspire',
  'вдохновлять',
  ARRAY['Her story will inspire others.', 'Great leaders inspire their teams.', 'Art can inspire creativity.'],
  'done',
  12;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'perspective',
  'перспектива, точка зрения',
  ARRAY['Try to see things from a different perspective.', 'This gives us a new perspective.', 'Traveling broadens your perspective.'],
  'learning',
  3;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'balance',
  'баланс, равновесие',
  ARRAY['Find a balance between work and life.', 'She lost her balance and fell.', 'Balance is key to success.'],
  'learning',
  5;

INSERT INTO words (user_id, english_word, russian_translation, examples, status, recall_count) 
SELECT 
  (SELECT id FROM users WHERE email = 'test@shagtospeak.com'),
  'wisdom',
  'мудрость',
  ARRAY['Age brings wisdom.', 'She shared her wisdom with us.', 'There is wisdom in patience.'],
  'done',
  15;