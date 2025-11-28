"""
Business: Enrich words with metadata (transcription, part_of_speech, difficulty_level, example_sentence)
Args: event with httpMethod, body (word_id or batch of word_ids), headers with X-User-Id
Returns: HTTP response with enriched word data
"""

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers_dict = event.get('headers', {})
    user_id = headers_dict.get('X-User-Id') or headers_dict.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            word_id = body_data.get('word_id')
            
            if not word_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'word_id required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, english_word, user_id FROM words WHERE id = %s AND user_id = %s",
                    (word_id, user_id)
                )
                word = cur.fetchone()
                
                if not word:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Word not found'})
                    }
                
                english_word = word['english_word']
                metadata = generate_word_metadata(english_word)
                
                cur.execute("""
                    UPDATE words 
                    SET transcription = %s,
                        part_of_speech = %s,
                        difficulty_level = %s,
                        example_sentence = %s
                    WHERE id = %s
                    RETURNING id, english_word, russian_translation, transcription, 
                              part_of_speech, difficulty_level, example_sentence, examples
                """, (
                    metadata['transcription'],
                    metadata['part_of_speech'],
                    metadata['difficulty_level'],
                    metadata['example_sentence'],
                    word_id
                ))
                
                updated_word = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'word': dict(updated_word)
                    })
                }
        
        elif method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, english_word 
                    FROM words 
                    WHERE user_id = %s 
                      AND (transcription IS NULL OR part_of_speech IS NULL OR difficulty_level IS NULL)
                    LIMIT 10
                """, (user_id,))
                
                words_to_enrich = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'words': [dict(w) for w in words_to_enrich],
                        'count': len(words_to_enrich)
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()


def generate_word_metadata(english_word: str) -> Dict[str, str]:
    """
    Generate metadata for a word using AI API
    Returns: dict with transcription, part_of_speech, difficulty_level, example_sentence
    """
    api_key = os.environ.get('GENAPI_KEY')
    if not api_key:
        return {
            'transcription': '',
            'part_of_speech': 'noun',
            'difficulty_level': 'intermediate',
            'example_sentence': f'This is an example with {english_word}.'
        }
    
    prompt = f"""Analyze the English word: "{english_word}"

Provide the following information in JSON format:
{{
  "transcription": "IPA phonetic transcription",
  "part_of_speech": "noun/verb/adjective/adverb/etc",
  "difficulty_level": "beginner/intermediate/advanced/master",
  "example_sentence": "Natural English sentence using this word"
}}

Rules:
- transcription: Use IPA format, e.g., /wɜːrd/
- part_of_speech: Most common usage (noun, verb, adjective, adverb, preposition, etc.)
- difficulty_level: 
  * beginner: A1-A2 (basic words like "cat", "run", "happy")
  * intermediate: B1-B2 (common words like "achieve", "demonstrate")
  * advanced: C1 (sophisticated words like "endeavor", "meticulous")
  * master: C2 (rare/academic words like "ephemeral", "ubiquitous")
- example_sentence: Natural, simple sentence (10-15 words max)

Return ONLY the JSON object, no additional text."""

    try:
        response = requests.post(
            'https://api.vsegpt.ru/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'openai/gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You are a linguistics expert. Respond only with valid JSON.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.3,
                'max_tokens': 300
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            content = data['choices'][0]['message']['content'].strip()
            
            if content.startswith('```json'):
                content = content[7:]
            if content.startswith('```'):
                content = content[3:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            metadata = json.loads(content)
            
            valid_pos = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun', 'conjunction', 'interjection']
            if metadata.get('part_of_speech') not in valid_pos:
                metadata['part_of_speech'] = 'noun'
            
            valid_levels = ['beginner', 'intermediate', 'advanced', 'master']
            if metadata.get('difficulty_level') not in valid_levels:
                metadata['difficulty_level'] = 'intermediate'
            
            return {
                'transcription': metadata.get('transcription', ''),
                'part_of_speech': metadata['part_of_speech'],
                'difficulty_level': metadata['difficulty_level'],
                'example_sentence': metadata.get('example_sentence', f'Example with {english_word}.')
            }
    
    except Exception as e:
        print(f'AI API error: {e}')
    
    return {
        'transcription': '',
        'part_of_speech': 'noun',
        'difficulty_level': 'intermediate',
        'example_sentence': f'This is an example with {english_word}.'
    }
