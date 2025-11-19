INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
SELECT 'tech_computer', 'upload', 'загрузить', ARRAY['Upload the document.', 'Upload failed.', 'Upload to cloud.']
WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = 'tech_computer' AND english_word = 'upload');