INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'tech_computer', 'computer', 'компьютер', ARRAY['Turn on the computer.', 'My computer is slow.', 'Desktop computer.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'tech_computer' AND english_word = 'computer');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'tech_computer', 'internet', 'интернет', ARRAY['Connect to internet.', 'Internet connection lost.', 'Browse the internet.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'tech_computer' AND english_word = 'internet');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'tech_computer', 'email', 'электронная почта', ARRAY['Send an email.', 'Check your email.', 'Email address required.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'tech_computer' AND english_word = 'email');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'tech_computer', 'password', 'пароль', ARRAY['Enter your password.', 'Change password.', 'Strong password required.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'tech_computer' AND english_word = 'password');

INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'tech_computer', 'download', 'скачать', ARRAY['Download the file.', 'Download speed.', 'Download complete.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'tech_computer' AND english_word = 'download');