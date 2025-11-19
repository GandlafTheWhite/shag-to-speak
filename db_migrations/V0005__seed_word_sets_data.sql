-- Вставка набора: Аэропорт
UPDATE t_p7147437_shag_to_speak.word_sets SET title = 'Аэропорт и полёт' WHERE id = 'travel_airport' AND 1=0;
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count) 
SELECT 'travel_airport', 'Аэропорт и полёт', 'travel', 'Всё для путешествия самолётом', 10
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'travel_airport');

-- Вставка набора: Приветствия  
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'everyday_greetings', 'Приветствия', 'everyday', 'Базовые фразы общения', 10
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'everyday_greetings');

-- Вставка набора: Деловые встречи
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'business_meetings', 'Деловые встречи', 'business', 'Переговоры и совещания', 10
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'business_meetings');

-- Вставка набора: Компьютер
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'tech_computer', 'Компьютер и интернет', 'technology', 'Базовая IT-терминология', 10
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'tech_computer');

-- Вставка набора: Ресторан
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'food_restaurant', 'Ресторан и кафе', 'food', 'Заказ еды в заведениях', 10
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'food_restaurant');

-- Слова для набора: Аэропорт
INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'flight', 'рейс, полёт', ARRAY['My flight leaves at 10 AM.', 'The flight was delayed.', 'Book a direct flight.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'flight');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'airport', 'аэропорт', ARRAY['We arrived at the airport early.', 'The airport is crowded today.', 'Meet me at the airport.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'airport');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'passport', 'паспорт', ARRAY['Show your passport please.', 'I lost my passport.', 'Valid passport required.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'passport');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'boarding', 'посадка', ARRAY['Boarding starts at gate 5.', 'Final boarding call.', 'Show boarding pass.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'boarding');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'gate', 'выход (на посадку)', ARRAY['Go to gate B12.', 'The gate is closing.', 'Wait at the gate.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'gate');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'luggage', 'багаж', ARRAY['Where is my luggage?', 'Check your luggage.', 'Carry-on luggage only.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'luggage');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'security', 'служба безопасности', ARRAY['Pass through security.', 'Security check required.', 'Airport security is strict.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'security');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'customs', 'таможня', ARRAY['Go through customs.', 'Declare at customs.', 'Customs officer checked my bag.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'customs');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'departure', 'вылет, отправление', ARRAY['Departure time is 3 PM.', 'Check departure board.', 'Departure gate changed.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'departure');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'travel_airport', 'arrival', 'прилёт, прибытие', ARRAY['Arrival time is 5 PM.', 'Meet at arrivals hall.', 'Early arrival possible.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'travel_airport' AND english_word = 'arrival');
