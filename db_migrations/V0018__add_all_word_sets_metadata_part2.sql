-- Add remaining word sets metadata

-- Technology
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'tech_computer', 'Компьютер и интернет', 'technology', 'Базовая IT-терминология', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'tech_computer');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'tech_programming', 'Программирование', 'technology', 'Разработка и код', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'tech_programming');

-- Food
INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'food_restaurant', 'Ресторан и кафе', 'food', 'Заказ еды в заведениях', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'food_restaurant');

INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
SELECT 'food_cooking', 'Готовка и кухня', 'food', 'Приготовление еды дома', 50
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = 'food_cooking');