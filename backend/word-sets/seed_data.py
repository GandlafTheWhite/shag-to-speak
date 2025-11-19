"""
Скрипт для заполнения базы данных готовыми наборами слов
Запускать вручную при необходимости обновить наборы
"""

import os
import psycopg2

# Готовые наборы слов с переводами и примерами
WORD_SETS_DATA = [
    {
        'id': 'travel_airport',
        'title': 'Аэропорт и полёт',
        'topic': 'travel',
        'description': 'Всё для путешествия самолётом',
        'words': [
            {'word': 'flight', 'translation': 'рейс, полёт', 'examples': ['My flight leaves at 10 AM.', 'The flight was delayed.', 'Book a direct flight.']},
            {'word': 'airport', 'translation': 'аэропорт', 'examples': ['We arrived at the airport early.', 'The airport is crowded today.', 'Meet me at the airport.']},
            {'word': 'passport', 'translation': 'паспорт', 'examples': ['Show your passport please.', 'I lost my passport.', 'Valid passport required.']},
            {'word': 'boarding', 'translation': 'посадка', 'examples': ['Boarding starts at gate 5.', 'Final boarding call.', 'Show boarding pass.']},
            {'word': 'gate', 'translation': 'выход (на посадку)', 'examples': ['Go to gate B12.', 'The gate is closing.', 'Wait at the gate.']},
            {'word': 'luggage', 'translation': 'багаж', 'examples': ['Where is my luggage?', 'Check your luggage.', 'Carry-on luggage only.']},
            {'word': 'security', 'translation': 'служба безопасности', 'examples': ['Pass through security.', 'Security check required.', 'Airport security is strict.']},
            {'word': 'customs', 'translation': 'таможня', 'examples': ['Go through customs.', 'Declare at customs.', 'Customs officer checked my bag.']},
            {'word': 'departure', 'translation': 'вылет, отправление', 'examples': ['Departure time is 3 PM.', 'Check departure board.', 'Departure gate changed.']},
            {'word': 'arrival', 'translation': 'прилёт, прибытие', 'examples': ['Arrival time is 5 PM.', 'Meet at arrivals hall.', 'Early arrival possible.']},
        ]
    },
    {
        'id': 'everyday_greetings',
        'title': 'Приветствия',
        'topic': 'everyday',
        'description': 'Базовые фразы общения',
        'words': [
            {'word': 'hello', 'translation': 'привет, здравствуйте', 'examples': ['Hello! How are you?', 'Say hello to everyone.', 'Hello, nice to meet you.']},
            {'word': 'goodbye', 'translation': 'до свидания', 'examples': ['Goodbye! See you later.', 'Say goodbye to your friends.', 'Goodbye and good luck!']},
            {'word': 'please', 'translation': 'пожалуйста (просьба)', 'examples': ['Help me, please.', 'Please come in.', 'Could you please wait?']},
            {'word': 'thank', 'translation': 'благодарить', 'examples': ['Thank you very much.', 'I want to thank you.', 'Thank you for your help.']},
            {'word': 'sorry', 'translation': 'извините, простите', 'examples': ["I'm sorry for being late.", 'Sorry to bother you.', 'Sorry, I made a mistake.']},
            {'word': 'excuse', 'translation': 'извинить, извинение', 'examples': ['Excuse me, can I pass?', 'Please excuse my error.', 'Excuse me for interrupting.']},
            {'word': 'welcome', 'translation': 'добро пожаловать', 'examples': ['Welcome to our home!', "You're welcome.", 'Welcome back!']},
            {'word': 'morning', 'translation': 'утро', 'examples': ['Good morning!', 'See you tomorrow morning.', 'Morning coffee is essential.']},
            {'word': 'evening', 'translation': 'вечер', 'examples': ['Good evening!', 'See you this evening.', 'Evening walk is relaxing.']},
            {'word': 'night', 'translation': 'ночь', 'examples': ['Good night!', 'Sleep well tonight.', 'Night shift starts at 10.']},
        ]
    },
    {
        'id': 'business_meetings',
        'title': 'Деловые встречи',
        'topic': 'business',
        'description': 'Переговоры и совещания',
        'words': [
            {'word': 'meeting', 'translation': 'встреча, собрание', 'examples': ['We have a meeting at 2 PM.', 'The meeting was productive.', 'Schedule a meeting.']},
            {'word': 'agenda', 'translation': 'повестка дня', 'examples': ["What's on the agenda?", 'Send the meeting agenda.', 'First item on agenda.']},
            {'word': 'presentation', 'translation': 'презентация', 'examples': ['Give a presentation.', 'Great presentation!', 'Prepare slides for presentation.']},
            {'word': 'deadline', 'translation': 'крайний срок', 'examples': ['Meet the deadline.', 'Deadline is Friday.', 'Extend the deadline.']},
            {'word': 'budget', 'translation': 'бюджет', 'examples': ['Stay within budget.', 'Budget approved.', 'Cut the budget.']},
            {'word': 'profit', 'translation': 'прибыль', 'examples': ['Make a profit.', 'Profit increased.', 'Calculate profit margin.']},
            {'word': 'client', 'translation': 'клиент', 'examples': ['Meet the client.', 'Client satisfaction.', 'New client acquired.']},
            {'word': 'partner', 'translation': 'партнёр', 'examples': ['Business partner.', 'Partner with us.', 'Strategic partner.']},
            {'word': 'strategy', 'translation': 'стратегия', 'examples': ['Marketing strategy.', 'Develop a strategy.', 'Strategy meeting.']},
            {'word': 'goal', 'translation': 'цель', 'examples': ['Set a goal.', 'Achieve the goal.', 'Long-term goal.']},
        ]
    },
    {
        'id': 'tech_computer',
        'title': 'Компьютер и интернет',
        'topic': 'technology',
        'description': 'Базовая IT-терминология',
        'words': [
            {'word': 'computer', 'translation': 'компьютер', 'examples': ['Turn on the computer.', 'My computer is slow.', 'Desktop computer.']},
            {'word': 'internet', 'translation': 'интернет', 'examples': ['Connect to internet.', 'Internet connection lost.', 'Browse the internet.']},
            {'word': 'email', 'translation': 'электронная почта', 'examples': ['Send an email.', 'Check your email.', 'Email address required.']},
            {'word': 'password', 'translation': 'пароль', 'examples': ['Enter your password.', 'Change password.', 'Strong password required.']},
            {'word': 'download', 'translation': 'скачать', 'examples': ['Download the file.', 'Download speed.', 'Download complete.']},
            {'word': 'upload', 'translation': 'загрузить', 'examples': ['Upload the document.', 'Upload failed.', 'Upload to cloud.']},
            {'word': 'file', 'translation': 'файл', 'examples': ['Open the file.', 'Save file.', 'Delete file.']},
            {'word': 'data', 'translation': 'данные', 'examples': ['Save your data.', 'Data backup.', 'Analyze data.']},
            {'word': 'virus', 'translation': 'вирус', 'examples': ['Computer virus detected.', 'Antivirus software.', 'Remove virus.']},
            {'word': 'update', 'translation': 'обновление', 'examples': ['Software update available.', 'Update the app.', 'Latest update.']},
        ]
    },
    {
        'id': 'food_restaurant',
        'title': 'Ресторан и кафе',
        'topic': 'food',
        'description': 'Заказ еды в заведениях',
        'words': [
            {'word': 'restaurant', 'translation': 'ресторан', 'examples': ['Go to a restaurant.', 'Book a restaurant.', 'Restaurant review.']},
            {'word': 'menu', 'translation': 'меню', 'examples': ['Look at the menu.', 'Menu please.', 'Special menu.']},
            {'word': 'order', 'translation': 'заказ, заказывать', 'examples': ['Take my order.', 'Order food online.', 'Ready to order?']},
            {'word': 'waiter', 'translation': 'официант', 'examples': ['Call the waiter.', 'Waiter, check please!', 'Waiter service.']},
            {'word': 'bill', 'translation': 'счёт', 'examples': ['Can I have the bill?', 'Split the bill.', 'Pay the bill.']},
            {'word': 'tip', 'translation': 'чаевые', 'examples': ['Leave a tip.', '15% tip.', 'Tip included.']},
            {'word': 'delicious', 'translation': 'вкусный', 'examples': ['This is delicious!', 'Delicious food.', 'Looks delicious.']},
            {'word': 'spicy', 'translation': 'острый', 'examples': ['Too spicy for me.', 'Spicy food.', 'Not spicy.']},
            {'word': 'fresh', 'translation': 'свежий', 'examples': ['Fresh vegetables.', 'Fresh bread.', 'Farm fresh.']},
            {'word': 'reservation', 'translation': 'бронь, резервация', 'examples': ['Make a reservation.', 'Reservation confirmed.', 'Reservation name?']},
        ]
    }
]

def seed_word_sets():
    conn = psycopg2.connect(os.environ.get('DATABASE_URL', 'postgresql://user:pass@localhost/db'))
    cursor = conn.cursor()
    
    try:
        for word_set in WORD_SETS_DATA:
            # Вставка набора
            cursor.execute(
                """INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)
                   VALUES (%s, %s, %s, %s, %s)
                   ON CONFLICT (id) DO UPDATE SET
                   title = EXCLUDED.title,
                   topic = EXCLUDED.topic,
                   description = EXCLUDED.description,
                   word_count = EXCLUDED.word_count""",
                (word_set['id'], word_set['title'], word_set['topic'], word_set['description'], len(word_set['words']))
            )
            
            # Вставка слов
            for word_data in word_set['words']:
                cursor.execute(
                    """INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)
                       VALUES (%s, %s, %s, %s)
                       ON CONFLICT (set_id, english_word) DO UPDATE SET
                       russian_translation = EXCLUDED.russian_translation,
                       examples = EXCLUDED.examples""",
                    (word_set['id'], word_data['word'], word_data['translation'], word_data['examples'])
                )
            
            print(f"✓ Набор '{word_set['title']}' добавлен ({len(word_set['words'])} слов)")
        
        conn.commit()
        print(f"\n✅ Успешно добавлено {len(WORD_SETS_DATA)} наборов слов")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Ошибка: {str(e)}")
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    seed_word_sets()
