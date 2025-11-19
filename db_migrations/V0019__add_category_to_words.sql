-- Add category column to words table
ALTER TABLE t_p7147437_shag_to_speak.words 
ADD COLUMN category VARCHAR(100) DEFAULT 'uncategorized';