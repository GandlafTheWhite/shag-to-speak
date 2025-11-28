"""
Business: Generate exercises and check user answers with 8 exercise types and difficulty levels
Args: event with httpMethod (GET/POST), headers with X-User-Id, query params (category, difficulty)
Returns: HTTP response with exercises or validation results
"""

import json
import os
import random
from typing import Dict, Any, List
from datetime import date, datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

EXERCISE_TYPES_BY_DIFFICULTY = {
    'beginner': ['translation', 'multiple_choice'],
    'intermediate': ['translation', 'multiple_choice', 'synonym_antonym', 'fill_blank'],
    'advanced': ['translation', 'multiple_choice', 'synonym_antonym', 'fill_blank', 'sentence_construction', 'context_match'],
    'master': ['translation', 'multiple_choice', 'synonym_antonym', 'fill_blank', 'sentence_construction', 'context_match', 'reverse_translation', 'word_formation']
}

DIFFICULTY_POINTS = {
    'beginner': 0,
    'intermediate': 5,
    'advanced': 10,
    'master': 15
}

EXERCISE_POINTS = {
    'translation': 0,
    'multiple_choice': 0,
    'synonym_antonym': 3,
    'fill_blank': 4,
    'sentence_construction': 8,
    'context_match': 5,
    'reverse_translation': 10,
    'word_formation': 12
}

def call_ai_api(prompt: str, system_message: str = None) -> Dict[str, Any]:
    """Call GENAPI for AI-powered exercise generation and validation"""
    api_key = os.environ.get('GENAPI_KEY')
    if not api_key:
        return {'error': 'AI API not configured'}
    
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
                    {'role': 'system', 'content': system_message or 'You are a language learning assistant.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.7,
                'max_tokens': 500
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            return json.loads(content)
        else:
            return {'error': f'AI API error: {response.status_code}'}
    except Exception as e:
        return {'error': str(e)}

def generate_synonym_antonym(word: Dict[str, Any]) -> Dict[str, Any]:
    """Generate synonym/antonym exercise using AI"""
    prompt = f"""For the English word "{word['english_word']}" (Russian: {word['russian_translation']}):
Generate 1 correct synonym/antonym and 3 incorrect options.

Return JSON:
{{"task_type": "synonym" or "antonym", "correct": "word", "options": ["word1", "word2", "word3"]}}"""
    
    ai_result = call_ai_api(prompt, 'You are an English vocabulary expert. Return only valid JSON.')
    
    if 'error' in ai_result:
        return {
            'word_id': word['id'],
            'type': 'synonym_antonym',
            'question': f"Find a synonym for: {word['english_word']}",
            'options': [word['english_word'], 'example1', 'example2', 'example3'],
            'correct_answer': word['english_word']
        }
    
    all_options = [ai_result['correct']] + ai_result['options']
    random.shuffle(all_options)
    
    task_label = 'synonym' if ai_result['task_type'] == 'synonym' else 'antonym'
    
    return {
        'word_id': word['id'],
        'type': 'synonym_antonym',
        'question': f"Find a {task_label} for: {word['english_word']}",
        'options': all_options,
        'correct_answer': ai_result['correct']
    }

def generate_fill_blank(word: Dict[str, Any]) -> Dict[str, Any]:
    """Generate fill-in-the-blank exercise using AI"""
    prompt = f"""Create a sentence with a blank where the word "{word['english_word']}" should go.
Also provide 3 incorrect word options.

Return JSON:
{{"sentence": "The ___ is very important.", "options": ["word1", "word2", "word3"]}}"""
    
    ai_result = call_ai_api(prompt, 'You are an English teacher creating fill-in-the-blank exercises.')
    
    if 'error' in ai_result:
        return {
            'word_id': word['id'],
            'type': 'fill_blank',
            'question': f"Fill in the blank: The ___ is important.",
            'options': [word['english_word'], 'option1', 'option2', 'option3'],
            'correct_answer': word['english_word']
        }
    
    all_options = [word['english_word']] + ai_result['options']
    random.shuffle(all_options)
    
    return {
        'word_id': word['id'],
        'type': 'fill_blank',
        'question': ai_result['sentence'],
        'options': all_options,
        'correct_answer': word['english_word']
    }

def generate_context_match(word: Dict[str, Any]) -> Dict[str, Any]:
    """Generate context matching exercise using AI"""
    prompt = f"""For the word "{word['english_word']}" create:
1 correct context sentence and 3 incorrect context sentences.

Return JSON:
{{"correct": "sentence where word fits", "incorrect": ["sent1", "sent2", "sent3"]}}"""
    
    ai_result = call_ai_api(prompt, 'You are creating context matching exercises.')
    
    if 'error' in ai_result:
        return {
            'word_id': word['id'],
            'type': 'context_match',
            'question': f"Which sentence correctly uses '{word['english_word']}'?",
            'options': [
                f"This is a correct use of {word['english_word']}.",
                "This is incorrect context 1.",
                "This is incorrect context 2.",
                "This is incorrect context 3."
            ],
            'correct_answer': f"This is a correct use of {word['english_word']}."
        }
    
    all_options = [ai_result['correct']] + ai_result['incorrect']
    random.shuffle(all_options)
    
    return {
        'word_id': word['id'],
        'type': 'context_match',
        'question': f"Which sentence correctly uses '{word['english_word']}'?",
        'options': all_options,
        'correct_answer': ai_result['correct']
    }

def generate_sentence_construction(word: Dict[str, Any]) -> Dict[str, Any]:
    """Generate sentence construction exercise"""
    return {
        'word_id': word['id'],
        'type': 'sentence_construction',
        'question': f"Write a sentence using the word: {word['english_word']}",
        'word': word['english_word'],
        'hint': word.get('russian_translation', ''),
        'correct_answer': ''
    }

def generate_reverse_translation(word: Dict[str, Any]) -> Dict[str, Any]:
    """Generate reverse translation exercise (Russian to English)"""
    return {
        'word_id': word['id'],
        'type': 'reverse_translation',
        'question': f"Translate to English: {word['russian_translation']}",
        'correct_answer': word['english_word']
    }

def generate_word_formation(word: Dict[str, Any]) -> Dict[str, Any]:
    """Generate word formation exercise using AI"""
    prompt = f"""For the word "{word['english_word']}", create a word formation task.
Give a base form and ask to transform it (e.g., noun to adjective, verb to noun).

Return JSON:
{{"task": "Transform 'happy' to noun form", "correct": "happiness", "options": ["happyness", "hapiness", "happyly"]}}"""
    
    ai_result = call_ai_api(prompt, 'You are teaching English word formation.')
    
    if 'error' in ai_result:
        return {
            'word_id': word['id'],
            'type': 'word_formation',
            'question': f"What is the noun form of '{word['english_word']}'?",
            'options': [word['english_word'], 'option1', 'option2', 'option3'],
            'correct_answer': word['english_word']
        }
    
    all_options = [ai_result['correct']] + ai_result['options']
    random.shuffle(all_options)
    
    return {
        'word_id': word['id'],
        'type': 'word_formation',
        'question': ai_result['task'],
        'options': all_options,
        'correct_answer': ai_result['correct']
    }

def validate_open_answer(word: str, user_answer: str, exercise_type: str) -> bool:
    """Validate open-ended answers using AI"""
    if exercise_type == 'sentence_construction':
        prompt = f"""Check if this sentence correctly uses the word "{word}":
Sentence: "{user_answer}"

Return JSON: {{"is_correct": true/false, "reason": "explanation"}}"""
    elif exercise_type == 'reverse_translation':
        prompt = f"""Check if "{user_answer}" is a correct English translation that matches "{word}".
Allow minor spelling mistakes.

Return JSON: {{"is_correct": true/false, "reason": "explanation"}}"""
    else:
        return False
    
    ai_result = call_ai_api(prompt, 'You are checking language learning exercises. Be lenient with minor errors.')
    
    if 'error' in ai_result:
        return user_answer.strip().lower() == word.strip().lower()
    
    return ai_result.get('is_correct', False)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id_str = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id_str:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    user_id = int(user_id_str)
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            category = query_params.get('category')
            difficulty = query_params.get('difficulty', 'beginner')
            
            if difficulty not in EXERCISE_TYPES_BY_DIFFICULTY:
                difficulty = 'beginner'
            
            cursor.execute(
                """SELECT status, daily_exercises_count, last_exercise_date, exercise_difficulty 
                   FROM users 
                   WHERE id = %s""",
                (user_id,)
            )
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            user_difficulty = user.get('exercise_difficulty') or 'beginner'
            difficulty = difficulty if difficulty in EXERCISE_TYPES_BY_DIFFICULTY else user_difficulty
            
            today = date.today()
            last_date = user['last_exercise_date']
            daily_count = user['daily_exercises_count'] or 0
            
            if last_date != today:
                daily_count = 0
            
            limit = 999 if user['status'] == 'premium' else 3
            if daily_count >= limit:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Daily exercise limit reached', 'limit': limit}),
                    'isBase64Encoded': False
                }
            
            query = """SELECT id, english_word, russian_translation, category, 
                              transcription, part_of_speech, example_sentence
                       FROM words 
                       WHERE user_id = %s AND status = 'learning'"""
            params = [user_id]
            
            if category:
                query += " AND category = %s"
                params.append(category)
            
            query += " ORDER BY RANDOM() LIMIT 5"
            
            cursor.execute(query, params)
            words = cursor.fetchall()
            
            if not words:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'exercises': [], 'message': 'No words for practice'}),
                    'isBase64Encoded': False
                }
            
            available_types = EXERCISE_TYPES_BY_DIFFICULTY[difficulty]
            exercises = []
            
            for word in words:
                exercise_type = random.choice(available_types)
                
                if exercise_type == 'translation':
                    exercises.append({
                        'word_id': word['id'],
                        'type': 'translation',
                        'question': word['english_word'],
                        'transcription': word.get('transcription'),
                        'part_of_speech': word.get('part_of_speech'),
                        'correct_answer': word['russian_translation']
                    })
                elif exercise_type == 'multiple_choice':
                    cursor.execute(
                        """SELECT russian_translation 
                           FROM words 
                           WHERE user_id = %s AND id != %s
                           ORDER BY RANDOM()
                           LIMIT 3""",
                        (user_id, word['id'])
                    )
                    wrong_answers = [w['russian_translation'] for w in cursor.fetchall()]
                    options = [word['russian_translation']] + wrong_answers
                    random.shuffle(options)
                    
                    exercises.append({
                        'word_id': word['id'],
                        'type': 'multiple_choice',
                        'question': word['english_word'],
                        'transcription': word.get('transcription'),
                        'part_of_speech': word.get('part_of_speech'),
                        'options': options,
                        'correct_answer': word['russian_translation']
                    })
                elif exercise_type == 'synonym_antonym':
                    exercises.append(generate_synonym_antonym(word))
                elif exercise_type == 'fill_blank':
                    exercises.append(generate_fill_blank(word))
                elif exercise_type == 'context_match':
                    exercises.append(generate_context_match(word))
                elif exercise_type == 'sentence_construction':
                    exercises.append(generate_sentence_construction(word))
                elif exercise_type == 'reverse_translation':
                    exercises.append(generate_reverse_translation(word))
                elif exercise_type == 'word_formation':
                    exercises.append(generate_word_formation(word))
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'exercises': exercises,
                    'difficulty': difficulty,
                    'exercises_remaining': limit - daily_count - 1
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            answers = body_data.get('answers', [])
            difficulty = body_data.get('difficulty', 'beginner')
            time_spent = body_data.get('time_spent', 0)
            
            if not answers:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Answers required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """SELECT status, daily_exercises_count, last_exercise_date, 
                          current_streak, longest_streak, last_exercise_date as streak_date
                   FROM users 
                   WHERE id = %s""",
                (user_id,)
            )
            user = cursor.fetchone()
            
            today = date.today()
            last_date = user['last_exercise_date']
            daily_count = user['daily_exercises_count'] or 0
            
            if last_date != today:
                daily_count = 0
            
            current_streak = user.get('current_streak', 0)
            longest_streak = user.get('longest_streak', 0)
            streak_date = user.get('streak_date')
            
            if streak_date:
                if today - streak_date == 1:
                    current_streak += 1
                elif today == streak_date:
                    pass
                else:
                    current_streak = 1
            else:
                current_streak = 1
            
            if current_streak > longest_streak:
                longest_streak = current_streak
            
            results = []
            correct_count = 0
            total_points = 0
            
            for answer in answers:
                word_id = answer.get('word_id')
                user_answer = answer.get('answer', '').strip()
                exercise_type = answer.get('type', 'translation')
                
                cursor.execute(
                    """SELECT english_word, russian_translation 
                       FROM words WHERE id = %s""",
                    (word_id,)
                )
                word = cursor.fetchone()
                
                if not word:
                    continue
                
                if exercise_type in ['sentence_construction', 'reverse_translation']:
                    is_correct = validate_open_answer(word['english_word'], user_answer, exercise_type)
                    correct_answer = word['english_word'] if exercise_type == 'reverse_translation' else 'Valid sentence'
                else:
                    correct_answer = answer.get('correct_answer', word['russian_translation'])
                    is_correct = user_answer.lower() == correct_answer.lower()
                
                if is_correct:
                    correct_count += 1
                    
                    base_points = 10
                    diff_bonus = DIFFICULTY_POINTS.get(difficulty, 0)
                    type_bonus = EXERCISE_POINTS.get(exercise_type, 0)
                    
                    speed_bonus = 0
                    if time_spent > 0:
                        avg_time = time_spent / len(answers)
                        if avg_time < 3:
                            speed_bonus = 5
                        elif avg_time < 5:
                            speed_bonus = 3
                        elif avg_time < 10:
                            speed_bonus = 0
                        else:
                            speed_bonus = -2
                    
                    streak_multiplier = 1 + (min(current_streak, 10) * 0.1)
                    
                    points = int((base_points + diff_bonus + type_bonus + speed_bonus) * streak_multiplier)
                    total_points += points
                else:
                    points = 0
                
                cursor.execute(
                    """INSERT INTO exercise_history 
                       (user_id, word_id, exercise_type, difficulty_level, is_correct, 
                        time_spent_seconds, points_earned, user_answer, correct_answer)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (user_id, word_id, exercise_type, difficulty, is_correct, 
                     time_spent, points, user_answer, correct_answer)
                )
                
                cursor.execute(
                    """UPDATE words 
                       SET recall_count = recall_count + 1,
                           last_recall_date = CURRENT_TIMESTAMP
                       WHERE id = %s""",
                    (word_id,)
                )
                
                results.append({
                    'word_id': word_id,
                    'is_correct': is_correct,
                    'correct_answer': correct_answer,
                    'points_earned': points
                })
            
            cursor.execute(
                """UPDATE users 
                   SET daily_exercises_count = %s,
                       last_exercise_date = %s,
                       total_points = total_points + %s,
                       current_streak = %s,
                       longest_streak = %s
                   WHERE id = %s""",
                (daily_count + 1, today, total_points, current_streak, longest_streak, user_id)
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'results': results,
                    'correct_count': correct_count,
                    'total_count': len(results),
                    'total_points': total_points,
                    'current_streak': current_streak,
                    'exercises_remaining': (999 if user['status'] == 'premium' else 3) - daily_count - 1
                }),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()
