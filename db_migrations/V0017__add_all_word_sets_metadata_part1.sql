-- Add all word sets metadata (without word_set_items)

-- Essential 1000
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'essential_basic_500', '500 базовых слов', 'essential_1000', 'Самые употребляемые слова для начинающих', 500
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'essential_basic_500');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'essential_advanced_500', '500 важных слов (продвинутый)', 'essential_1000', 'Следующий уровень базовой лексики', 500
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'essential_advanced_500');

-- Travel
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'travel_airport', 'Аэропорт и полёт', 'travel', 'Всё для путешествия самолётом', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'travel_airport');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'travel_hotel', 'Гостиница и проживание', 'travel', 'Бронирование и размещение в отеле', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'travel_hotel');

-- Business
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'business_meetings', 'Деловые встречи', 'business', 'Переговоры и совещания', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'business_meetings');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'business_office', 'Офис и рабочее место', 'business', 'Офисная лексика и оборудование', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'business_office');

-- Everyday
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'everyday_greetings', 'Приветствия и прощания', 'everyday', 'Базовые фразы общения', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'everyday_greetings');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'everyday_shopping', 'Покупки и магазины', 'everyday', 'Шоппинг и торговля', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'everyday_shopping');

-- Work
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'work_interview', 'Собеседование', 'work', 'Поиск работы и интервью', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'work_interview');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'work_communication', 'Рабочая коммуникация', 'work', 'Общение с коллегами', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'work_communication');