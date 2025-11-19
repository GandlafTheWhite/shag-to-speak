-- Наборы слов
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'travel_hotel', 'Гостиница и проживание', 'travel', 'Бронирование и размещение в отеле', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'travel_hotel');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'business_office', 'Офис и рабочее место', 'business', 'Офисная лексика и оборудование', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'business_office');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'everyday_shopping', 'Покупки и магазины', 'everyday', 'Шоппинг и торговля', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'everyday_shopping');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'work_interview', 'Собеседование', 'work', 'Поиск работы и интервью', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'work_interview');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'work_communication', 'Рабочая коммуникация', 'work', 'Общение с коллегами', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'work_communication');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'tech_programming', 'Программирование', 'technology', 'Разработка и код', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'tech_programming');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'food_cooking', 'Приготовление пищи', 'food', 'Кулинария и рецепты', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'food_cooking');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'health_medical', 'Медицина и здоровье', 'health', 'Поход к врачу', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'health_medical');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'sports_activities', 'Спорт и активности', 'sports', 'Виды спорта', 15
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'sports_activities');

-- Обновляем количество слов для food_restaurant и tech_computer
UPDATE t_p7147437_shag_to_speak.word_sets SET word_count = (
    SELECT COUNT(*) FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'food_restaurant'
) WHERE id = 'food_restaurant';

UPDATE t_p7147437_shag_to_speak.word_sets SET word_count = (
    SELECT COUNT(*) FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'tech_computer'
) WHERE id = 'tech_computer';
