-- Слова для набора: Приветствия
INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'hello', 'привет, здравствуйте', ARRAY['Hello! How are you?', 'Say hello to everyone.', 'Hello, nice to meet you.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'hello');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'goodbye', 'до свидания', ARRAY['Goodbye! See you later.', 'Say goodbye to your friends.', 'Goodbye and good luck!']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'goodbye');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'please', 'пожалуйста (просьба)', ARRAY['Help me, please.', 'Please come in.', 'Could you please wait?']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'please');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'thank', 'благодарить', ARRAY['Thank you very much.', 'I want to thank you.', 'Thank you for your help.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'thank');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'sorry', 'извините, простите', ARRAY['I am sorry for being late.', 'Sorry to bother you.', 'Sorry, I made a mistake.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'sorry');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'excuse', 'извинить, извинение', ARRAY['Excuse me, can I pass?', 'Please excuse my error.', 'Excuse me for interrupting.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'excuse');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'welcome', 'добро пожаловать', ARRAY['Welcome to our home!', 'You are welcome.', 'Welcome back!']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'welcome');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'morning', 'утро', ARRAY['Good morning!', 'See you tomorrow morning.', 'Morning coffee is essential.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'morning');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'evening', 'вечер', ARRAY['Good evening!', 'See you this evening.', 'Evening walk is relaxing.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'evening');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'everyday_greetings', 'night', 'ночь', ARRAY['Good night!', 'Sleep well tonight.', 'Night shift starts at 10.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'everyday_greetings' AND english_word = 'night');

-- Слова для набора: Деловые встречи
INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'meeting', 'встреча, собрание', ARRAY['We have a meeting at 2 PM.', 'The meeting was productive.', 'Schedule a meeting.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'meeting');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'agenda', 'повестка дня', ARRAY['What is on the agenda?', 'Send the meeting agenda.', 'First item on agenda.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'agenda');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'presentation', 'презентация', ARRAY['Give a presentation.', 'Great presentation!', 'Prepare slides for presentation.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'presentation');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'deadline', 'крайний срок', ARRAY['Meet the deadline.', 'Deadline is Friday.', 'Extend the deadline.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'deadline');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'budget', 'бюджет', ARRAY['Stay within budget.', 'Budget approved.', 'Cut the budget.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'budget');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'profit', 'прибыль', ARRAY['Make a profit.', 'Profit increased.', 'Calculate profit margin.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'profit');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'client', 'клиент', ARRAY['Meet the client.', 'Client satisfaction.', 'New client acquired.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'client');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'partner', 'партнёр', ARRAY['Business partner.', 'Partner with us.', 'Strategic partner.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'partner');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'strategy', 'стратегия', ARRAY['Marketing strategy.', 'Develop a strategy.', 'Strategy meeting.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'strategy');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'business_meetings', 'goal', 'цель', ARRAY['Set a goal.', 'Achieve the goal.', 'Long-term goal.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'business_meetings' AND english_word = 'goal');
