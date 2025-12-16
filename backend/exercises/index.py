"""
Business: Generate exercises and check user answers with 8 exercise types and difficulty levels
Args: event with httpMethod (GET/POST), headers with X-User-Id, query params (category, difficulty)
Returns: HTTP response with exercises or validation results
"""

import json
import os
import random
from typing import Dict, Any, List
from datetime import date, datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

# Встроенные функции проверки лимитов
def check_subscription_limit(cursor, user_id: int, limit_type: str):
    """Проверяет лимит подписки. Returns: (success, error_message, can_activate_trial)"""
    cursor.execute(
        """SELECT su.current_tier, su.subscription_status, su.subscription_end,
                  su.words_added, su.word_sets_added, su.exercises_completed, su.status_changes,
                  u.is_trial_used
           FROM t_p7147437_shag_to_speak.subscription_usage su
           JOIN t_p7147437_shag_to_speak.users u ON u.id = su.user_id
           WHERE su.user_id = %s
           ORDER BY su.subscription_end DESC NULLS LAST
           LIMIT 1""",
        (user_id,)
    )
    subscription = cursor.fetchone()
    
    if not subscription:
        return False, 'Subscription not found', False
    
    tier = subscription['current_tier']
    status = subscription['subscription_status']
    sub_end = subscription['subscription_end']
    is_trial_used = subscription['is_trial_used']
    now = datetime.now()
    
    if tier == 'none' or status == 'inactive':
        return False, 'no_subscription', not is_trial_used
    
    if sub_end and now > sub_end:
        return False, 'subscription_expired', not is_trial_used
    
    limit_column_map = {
        'words_added': 'words_limit',
        'word_sets_added': 'word_sets_limit',
        'exercises_completed': 'exercises_limit',
        'status_changes': 'status_changes_limit'
    }
    
    column_name = limit_column_map.get(limit_type)
    if not column_name:
        return False, 'Invalid limit type', not is_trial_used
    
    cursor.execute(
        f"""SELECT {column_name} FROM t_p7147437_shag_to_speak.subscription_plans 
           WHERE tier = %s""",
        (tier if tier != 'trial' else 'basic',)
    )
    plan = cursor.fetchone()
    
    if not plan:
        return False, 'Plan not found', not is_trial_used
    
    limit = plan[column_name]
    
    if limit == -1:
        return True, '', False
    
    current_usage = subscription[limit_type]
    
    if current_usage >= limit:
        messages = {
            'words_added': 'Достигнут лимит добавления слов',
            'word_sets_added': 'Достигнут лимит добавления наборов',
            'exercises_completed': 'Достигнут лимит упражнений',
            'status_changes': 'Достигнут лимит изменений статуса'
        }
        return False, f"limit_exceeded:{messages[limit_type]}", not is_trial_used
    
    return True, '', False


def increment_usage(cursor, conn, user_id: int, limit_type: str):
    """Увеличить счётчик использования"""
    now = datetime.now()
    period_start = datetime(now.year, now.month, 1).date()
    
    cursor.execute(
        f"""UPDATE t_p7147437_shag_to_speak.subscription_usage 
           SET {limit_type} = {limit_type} + 1
           WHERE user_id = %s AND period_start = %s""",
        (user_id, period_start)
    )
    conn.commit()


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
        print('[EXERCISES] ERROR: GENAPI_KEY not configured')
        return {'error': 'AI API not configured'}
    
    try:
        full_prompt = f"{system_message or 'You are a language learning assistant.'}\n\n{prompt}"
        
        response = requests.post(
            'https://api.gen-api.ru/api/v1/networks/o1-mini',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'is_sync': True,
                'messages': [{
                    'role': 'user',
                    'content': full_prompt
                }],
                'model': 'o1-mini-2024-09-12',
                'stream': False
            },
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            content = None
            
            if 'response' in result and len(result['response']) > 0:
                content = result['response'][0]['message']['content']
            elif 'output' in result and 'choices' in result['output']:
                content = result['output']['choices'][0]['message']['content']
            
            if not content:
                error_msg = 'AI API returned unexpected format'
                print(f'[EXERCISES] {error_msg}')
                return {'error': error_msg}
            
            content = content.strip()
            parsed = json.loads(content)
            return parsed
        else:
            error_msg = f'AI API error: {response.status_code}'
            print(f'[EXERCISES] {error_msg}')
            return {'error': error_msg}
    except json.JSONDecodeError as e:
        error_msg = f'JSON parse error: {str(e)}'
        print(f'[EXERCISES] {error_msg}')
        return {'error': error_msg}
    except Exception as e:
        error_msg = f'AI API exception: {str(e)}'
        print(f'[EXERCISES] {error_msg}')
        return {'error': error_msg}

def generate_word_metadata_inline(english_word: str) -> Dict[str, str]:
    """Generate metadata for a word using AI API (inline during exercise generation)"""
    api_key = os.environ.get('GENAPI_KEY')
    if not api_key:
        return {
            'transcription': '',
            'part_of_speech': 'noun',
            'difficulty_level': 'intermediate',
            'example_sentence': ''
        }
    
    prompt = f"""Analyze "{english_word}". Return JSON:
{{"transcription": "IPA", "part_of_speech": "noun/verb/adj/adv", "difficulty_level": "beginner/intermediate/advanced/master", "example_sentence": "short sentence"}}

Rules:
- transcription: IPA format /wɜːrd/
- part_of_speech: most common usage
- difficulty_level: beginner(A1-A2), intermediate(B1-B2), advanced(C1), master(C2)
- example_sentence: 10-15 words max

Return ONLY JSON, no extra text."""

    try:
        response = requests.post(
            'https://api.gen-api.ru/api/v1/networks/o1-mini',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'is_sync': True,
                'messages': [{
                    'role': 'user',
                    'content': f'You are a linguistics expert. Respond only with valid JSON.\n\n{prompt}'
                }],
                'model': 'o1-mini-2024-09-12',
                'stream': False
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            content = None
            
            if 'response' in data and len(data['response']) > 0:
                content = data['response'][0]['message']['content']
            elif 'output' in data and 'choices' in data['output']:
                content = data['output']['choices'][0]['message']['content']
            
            if not content:
                return {
                    'transcription': '',
                    'part_of_speech': 'noun',
                    'difficulty_level': 'intermediate',
                    'example_sentence': ''
                }
            
            content = content.strip()
            
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
                'example_sentence': metadata.get('example_sentence', '')
            }
    
    except Exception as e:
        print(f'Metadata generation error: {e}')
    
    return {
        'transcription': '',
        'part_of_speech': 'noun',
        'difficulty_level': 'intermediate',
        'example_sentence': ''
    }

def generate_exercises_batch(words: List[Dict[str, Any]], exercise_types: List[str], user_id: int, cursor) -> List[Dict[str, Any]]:
    """Generate all exercises in one AI batch request"""
    
    ai_needed_types = ['synonym_antonym', 'fill_blank', 'context_match', 'word_formation']
    words_needing_ai = []
    exercise_assignments = []
    
    for word in words:
        exercise_type = random.choice(exercise_types)
        exercise_assignments.append({
            'word': word,
            'type': exercise_type
        })
        
        if exercise_type in ai_needed_types:
            words_needing_ai.append({
                'word_id': word['id'],
                'english_word': word['english_word'],
                'russian_translation': word['russian_translation'],
                'example_sentence': word.get('example_sentence', ''),
                'type': exercise_type
            })
    
    ai_generated = {}
    
    if words_needing_ai:
        prompt = f"""Generate exercises for these English words. For EACH word, create the specified exercise type.

Words and exercise types:
{json.dumps(words_needing_ai, ensure_ascii=False, indent=2)}

Exercise type requirements:
- synonym_antonym: Provide 1 correct synonym OR antonym, and 3 incorrect options
- fill_blank: Create a sentence with blank, provide 3 incorrect word options
- context_match: Create 1 correct context sentence and 3 incorrect context sentences
- word_formation: Create word transformation task with 1 correct answer and 3 incorrect options

Return ONLY valid JSON in this exact format:
{{
  "exercises": [
    {{
      "word_id": 123,
      "type": "synonym_antonym",
      "task_type": "synonym",
      "correct": "word",
      "options": ["wrong1", "wrong2", "wrong3"]
    }},
    {{
      "word_id": 124,
      "type": "fill_blank",
      "sentence": "The ___ is important.",
      "options": ["wrong1", "wrong2", "wrong3"]
    }},
    {{
      "word_id": 125,
      "type": "context_match",
      "correct": "Correct sentence here",
      "incorrect": ["wrong1", "wrong2", "wrong3"]
    }},
    {{
      "word_id": 126,
      "type": "word_formation",
      "task": "Transform X to Y form",
      "correct": "answer",
      "options": ["wrong1", "wrong2", "wrong3"]
    }}
  ]
}}"""
        
        ai_result = call_ai_api(prompt, 'You are an English teacher creating vocabulary exercises. Return only valid JSON.')
        
        if 'error' not in ai_result and 'exercises' in ai_result:
            for ex in ai_result['exercises']:
                ai_generated[ex['word_id']] = ex
    
    exercises = []
    
    for assignment in exercise_assignments:
        word = assignment['word']
        exercise_type = assignment['type']
        
        if exercise_type == 'translation':
            exercises.append({
                'word_id': word['id'],
                'type': 'translation',
                'question': word['english_word'],
                'transcription': word.get('transcription', ''),
                'part_of_speech': word.get('part_of_speech', ''),
                'correct_answer': word['russian_translation']
            })
        
        elif exercise_type == 'multiple_choice':
            cursor.execute(
                """SELECT russian_translation 
                   FROM t_p7147437_shag_to_speak.words 
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
                'transcription': word.get('transcription', ''),
                'part_of_speech': word.get('part_of_speech', ''),
                'options': options,
                'correct_answer': word['russian_translation']
            })
        
        elif exercise_type == 'sentence_construction':
            exercises.append({
                'word_id': word['id'],
                'type': 'sentence_construction',
                'question': f"Write a sentence using the word: {word['english_word']}",
                'word': word['english_word'],
                'hint': word['russian_translation'],
                'correct_answer': ''
            })
        
        elif exercise_type == 'reverse_translation':
            exercises.append({
                'word_id': word['id'],
                'type': 'reverse_translation',
                'question': f"Translate to English: {word['russian_translation']}",
                'correct_answer': word['english_word']
            })
        
        elif exercise_type == 'synonym_antonym':
            ai_ex = ai_generated.get(word['id'])
            if ai_ex:
                all_options = [ai_ex['correct']] + ai_ex['options']
                random.shuffle(all_options)
                task_label = 'synonym' if ai_ex.get('task_type') == 'synonym' else 'antonym'
                exercises.append({
                    'word_id': word['id'],
                    'type': 'synonym_antonym',
                    'question': f"Find a {task_label} for: {word['english_word']}",
                    'options': all_options,
                    'correct_answer': ai_ex['correct']
                })
            else:
                exercises.append({
                    'word_id': word['id'],
                    'type': 'synonym_antonym',
                    'question': f"Find a synonym for: {word['english_word']}",
                    'options': [word['english_word'], 'similar', 'related', 'associated'],
                    'correct_answer': word['english_word']
                })
        
        elif exercise_type == 'fill_blank':
            ai_ex = ai_generated.get(word['id'])
            if ai_ex and 'sentence' in ai_ex:
                all_options = [word['english_word']] + ai_ex['options']
                random.shuffle(all_options)
                exercises.append({
                    'word_id': word['id'],
                    'type': 'fill_blank',
                    'question': f"Fill in the blank: {ai_ex['sentence']}",
                    'options': all_options,
                    'correct_answer': word['english_word']
                })
            else:
                example = word.get('example_sentence', '')
                if example and word['english_word'].lower() in example.lower():
                    sentence_with_blank = example.replace(word['english_word'], '___').replace(word['english_word'].lower(), '___')
                    exercises.append({
                        'word_id': word['id'],
                        'type': 'fill_blank',
                        'question': f"Fill in the blank: {sentence_with_blank}",
                        'options': [word['english_word'], 'thing', 'item', 'object'],
                        'correct_answer': word['english_word']
                    })
                else:
                    exercises.append({
                        'word_id': word['id'],
                        'type': 'fill_blank',
                        'question': f"Fill in the blank: The ___ is important.",
                        'options': [word['english_word'], 'thing', 'item', 'object'],
                        'correct_answer': word['english_word']
                    })
        
        elif exercise_type == 'context_match':
            ai_ex = ai_generated.get(word['id'])
            if ai_ex:
                all_options = [ai_ex['correct']] + ai_ex['incorrect']
                random.shuffle(all_options)
                exercises.append({
                    'word_id': word['id'],
                    'type': 'context_match',
                    'question': f"Which sentence correctly uses '{word['english_word']}'?",
                    'options': all_options,
                    'correct_answer': ai_ex['correct']
                })
            else:
                exercises.append({
                    'word_id': word['id'],
                    'type': 'context_match',
                    'question': f"Which sentence correctly uses '{word['english_word']}'?",
                    'options': [
                        f"I need to use {word['english_word']} properly.",
                        f"The {word['english_word']} is important.",
                        f"We should learn {word['english_word']}.",
                        f"Everyone knows {word['english_word']}."
                    ],
                    'correct_answer': f"I need to use {word['english_word']} properly."
                })
        
        elif exercise_type == 'word_formation':
            ai_ex = ai_generated.get(word['id'])
            if ai_ex:
                all_options = [ai_ex['correct']] + ai_ex['options']
                random.shuffle(all_options)
                exercises.append({
                    'word_id': word['id'],
                    'type': 'word_formation',
                    'question': ai_ex['task'],
                    'options': all_options,
                    'correct_answer': ai_ex['correct']
                })
            else:
                exercises.append({
                    'word_id': word['id'],
                    'type': 'word_formation',
                    'question': f"What is the noun form of '{word['english_word']}'?",
                    'options': [word['english_word'], word['english_word'] + 'ness', word['english_word'] + 'tion', word['english_word'] + 'ing'],
                    'correct_answer': word['english_word']
                })
    
    return exercises

def generate_synonym_antonym(word: Dict[str, Any]) -> Dict[str, Any]:
    """DEPRECATED: Generate synonym/antonym exercise using AI"""
    prompt = f"""For the English word "{word['english_word']}" (Russian: {word['russian_translation']}):
Generate 1 correct synonym/antonym and 3 incorrect options.

Return JSON:
{{"task_type": "synonym" or "antonym", "correct": "word", "options": ["word1", "word2", "word3"]}}"""
    
    ai_result = call_ai_api(prompt, 'You are an English vocabulary expert. Return only valid JSON.')
    
    if 'error' in ai_result:
        print(f"[EXERCISES] Synonym/Antonym generation failed for '{word['english_word']}': {ai_result['error']}")
        return {
            'word_id': word['id'],
            'type': 'synonym_antonym',
            'question': f"Find a synonym for: {word['english_word']}",
            'options': [word['english_word'], 'similar', 'related', 'associated'],
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
    """Generate fill-in-the-blank exercise using AI or example_sentence"""
    example = word.get('example_sentence')
    
    if example and word['english_word'].lower() in example.lower():
        sentence_with_blank = example.replace(word['english_word'], '___').replace(word['english_word'].lower(), '___').replace(word['english_word'].capitalize(), '___')
        
        prompt = f"""For the word "{word['english_word']}", provide 3 INCORRECT alternative words that could fit grammatically but are wrong contextually.

Return JSON:
{{"options": ["wrong1", "wrong2", "wrong3"]}}"""
        
        ai_result = call_ai_api(prompt, 'You are creating distractors for fill-in-the-blank exercises.')
        
        if 'error' not in ai_result and 'options' in ai_result:
            all_options = [word['english_word']] + ai_result['options']
            random.shuffle(all_options)
            
            return {
                'word_id': word['id'],
                'type': 'fill_blank',
                'question': f"Fill in the blank: {sentence_with_blank}",
                'options': all_options,
                'correct_answer': word['english_word']
            }
    
    prompt = f"""Create a sentence with a blank where the word "{word['english_word']}" should go.
Also provide 3 incorrect word options.

Return JSON:
{{"sentence": "The ___ is very important.", "options": ["word1", "word2", "word3"]}}"""
    
    ai_result = call_ai_api(prompt, 'You are an English teacher creating fill-in-the-blank exercises.')
    
    if 'error' in ai_result:
        print(f"[EXERCISES] Fill-in-blank generation failed for '{word['english_word']}': {ai_result['error']}")
        return {
            'word_id': word['id'],
            'type': 'fill_blank',
            'question': f"Fill in the blank: The ___ is important.",
            'options': [word['english_word'], 'thing', 'item', 'object'],
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
        print(f"[EXERCISES] Context match generation failed for '{word['english_word']}': {ai_result['error']}")
        return {
            'word_id': word['id'],
            'type': 'context_match',
            'question': f"Which sentence correctly uses '{word['english_word']}'?",
            'options': [
                f"I need to use {word['english_word']} properly.",
                f"The {word['english_word']} is important.",
                f"We should learn {word['english_word']}.",
                f"Everyone knows {word['english_word']}."
            ],
            'correct_answer': f"I need to use {word['english_word']} properly."
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
        print(f"[EXERCISES] Word formation generation failed for '{word['english_word']}': {ai_result['error']}")
        return {
            'word_id': word['id'],
            'type': 'word_formation',
            'question': f"What is the noun form of '{word['english_word']}'?",
            'options': [word['english_word'], word['english_word'] + 'ness', word['english_word'] + 'tion', word['english_word'] + 'ing'],
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

def validate_open_answers_batch(answers_to_validate: List[Dict[str, Any]]) -> Dict[int, bool]:
    """Validate multiple open-ended answers in one AI batch request"""
    if not answers_to_validate:
        return {}
    
    prompt = f"""Check if these answers are correct. For EACH answer, determine if it's valid.

Answers to check:
{json.dumps(answers_to_validate, ensure_ascii=False, indent=2)}

Rules:
- sentence_construction: Check if sentence uses the word correctly and is grammatically valid
- reverse_translation: Check if answer matches the target word (allow minor spelling mistakes)

Return ONLY valid JSON:
{{
  "results": [
    {{"word_id": 123, "is_correct": true, "reason": "short explanation"}},
    {{"word_id": 124, "is_correct": false, "reason": "short explanation"}}
  ]
}}"""
    
    ai_result = call_ai_api(prompt, 'You are checking language learning exercises. Be lenient with minor errors.')
    
    if 'error' in ai_result or 'results' not in ai_result:
        return {}
    
    validation_results = {}
    for result in ai_result['results']:
        validation_results[result['word_id']] = result['is_correct']
    
    return validation_results

def validate_open_answer(word: str, user_answer: str, exercise_type: str) -> bool:
    """DEPRECATED: Validate open-ended answers using AI (use batch version instead)"""
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
                   FROM t_p7147437_shag_to_speak.users 
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
            
            success, error_msg, can_activate_trial = check_subscription_limit(cursor, user_id, 'exercises_completed')
            if not success:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': error_msg, 
                        'limit_exceeded': True,
                        'can_activate_trial': can_activate_trial
                    }),
                    'isBase64Encoded': False
                }
            
            query = """SELECT id, english_word, russian_translation, category, 
                              transcription, part_of_speech, example_sentence, difficulty_level
                       FROM t_p7147437_shag_to_speak.words 
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
            
            exercises = generate_exercises_batch(words, available_types, user_id, cursor)
            
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
                   FROM t_p7147437_shag_to_speak.users 
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
            
            open_answers_to_validate = []
            for answer in answers:
                exercise_type = answer.get('type', 'translation')
                if exercise_type in ['sentence_construction', 'reverse_translation']:
                    word_id = answer.get('word_id')
                    user_answer = answer.get('answer', '').strip()
                    
                    cursor.execute(
                        """SELECT english_word FROM t_p7147437_shag_to_speak.words WHERE id = %s""",
                        (word_id,)
                    )
                    word = cursor.fetchone()
                    
                    if word:
                        open_answers_to_validate.append({
                            'word_id': word_id,
                            'word': word['english_word'],
                            'user_answer': user_answer,
                            'type': exercise_type
                        })
            
            validation_results = validate_open_answers_batch(open_answers_to_validate)
            
            for answer in answers:
                word_id = answer.get('word_id')
                user_answer = answer.get('answer', '').strip()
                exercise_type = answer.get('type', 'translation')
                
                cursor.execute(
                    """SELECT english_word, russian_translation 
                       FROM t_p7147437_shag_to_speak.words WHERE id = %s""",
                    (word_id,)
                )
                word = cursor.fetchone()
                
                if not word:
                    continue
                
                if exercise_type in ['sentence_construction', 'reverse_translation']:
                    is_correct = validation_results.get(word_id, False)
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
                    """INSERT INTO t_p7147437_shag_to_speak.exercise_history 
                       (user_id, word_id, exercise_type, difficulty_level, is_correct, 
                        time_spent_seconds, points_earned, user_answer, correct_answer)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (user_id, word_id, exercise_type, difficulty, is_correct, 
                     time_spent, points, user_answer, correct_answer)
                )
                
                cursor.execute(
                    """UPDATE t_p7147437_shag_to_speak.words 
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
                """UPDATE t_p7147437_shag_to_speak.users 
                   SET daily_exercises_count = %s,
                       last_exercise_date = %s,
                       total_points = total_points + %s,
                       current_streak = %s,
                       longest_streak = %s
                   WHERE id = %s""",
                (daily_count + 1, today, total_points, current_streak, longest_streak, user_id)
            )
            
            increment_usage(cursor, conn, user_id, 'exercises_completed')
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