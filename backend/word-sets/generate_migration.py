"""
Скрипт для генерации SQL миграции с готовыми переводами всех наборов слов
"""

import json

# Все наборы слов с переводами (первые 15-20 слов каждого набора для демонстрации)
WORD_SETS_WITH_TRANSLATIONS = {
    'travel_hotel': {
        'title': 'Гостиница и проживание',
        'topic': 'travel',
        'description': 'Бронирование и размещение в отеле',
        'words': [
            ('hotel', 'гостиница', ['I stayed at a nice hotel.', 'The hotel has a pool.', 'Book a hotel room.']),
            ('hostel', 'хостел', ['Hostels are cheaper.', 'Youth hostel nearby.', 'Stay at a hostel.']),
            ('room', 'номер, комната', ['My room is on the 5th floor.', 'Double room please.', 'Clean the room.']),
            ('reservation', 'бронирование', ['Make a reservation.', 'Cancel reservation.', 'Reservation confirmed.']),
            ('booking', 'бронь', ['Online booking available.', 'Booking reference number.', 'Change booking.']),
            ('check-in', 'регистрация при заселении', ['Check-in time is 2 PM.', 'Early check-in possible.', 'Check-in at reception.']),
            ('check-out', 'выписка', ['Check-out is at 11 AM.', 'Late check-out fee.', 'Check-out completed.']),
            ('reception', 'стойка регистрации', ['Ask at reception.', 'Reception is open 24/7.', 'Reception desk.']),
            ('key', 'ключ', ['Room key please.', 'Lost my key.', 'Key card system.']),
            ('lobby', 'вестибюль', ['Meet in the lobby.', 'Lobby bar.', 'Wait in lobby.']),
            ('single', 'одноместный номер', ['Single room for one night.', 'Single bed.', 'Single occupancy.']),
            ('double', 'двухместный номер', ['Double room with bath.', 'Double bed.', 'Double occupancy.']),
            ('suite', 'люкс', ['Presidential suite.', 'Honeymoon suite.', 'Suite with balcony.']),
            ('floor', 'этаж', ['Which floor?', 'Ground floor.', 'Top floor.']),
            ('elevator', 'лифт', ['Take the elevator.', 'Elevator is broken.', 'Use elevator.']),
        ]
    },
    'business_office': {
        'title': 'Офис и рабочее место',
        'topic': 'business',
        'description': 'Офисная лексика и оборудование',
        'words': [
            ('office', 'офис', ['Go to the office.', 'Office hours.', 'Home office.']),
            ('desk', 'письменный стол', ['Sit at your desk.', 'Clean desk policy.', 'Desk drawer.']),
            ('chair', 'стул, кресло', ['Office chair.', 'Comfortable chair.', 'Swivel chair.']),
            ('laptop', 'ноутбук', ['Use your laptop.', 'Laptop bag.', 'Company laptop.']),
            ('keyboard', 'клавиатура', ['Wireless keyboard.', 'Type on keyboard.', 'Keyboard shortcut.']),
            ('mouse', 'мышь (компьютерная)', ['Computer mouse.', 'Click the mouse.', 'Wireless mouse.']),
            ('screen', 'экран', ['Screen brightness.', 'Dual screen setup.', 'Touch screen.']),
            ('monitor', 'монитор', ['External monitor.', 'Monitor stand.', 'Second monitor.']),
            ('printer', 'принтер', ['Use the printer.', 'Printer is out of paper.', 'Color printer.']),
            ('scanner', 'сканер', ['Scan with scanner.', 'Document scanner.', 'Flatbed scanner.']),
            ('phone', 'телефон', ['Office phone.', 'Phone extension.', 'Phone system.']),
            ('document', 'документ', ['Important document.', 'Sign the document.', 'Document folder.']),
            ('file', 'файл', ['Save the file.', 'File management.', 'Open file.']),
            ('folder', 'папка', ['Create new folder.', 'Project folder.', 'Folder structure.']),
            ('stationery', 'канцелярские принадлежности', ['Office stationery.', 'Stationery cupboard.', 'Order stationery.']),
        ]
    },
    'everyday_shopping': {
        'title': 'Покупки и магазины',
        'topic': 'everyday',
        'description': 'Шоппинг и торговля',
        'words': [
            ('shop', 'магазин', ['Go to the shop.', 'Shop online.', 'Coffee shop.']),
            ('store', 'магазин', ['Department store.', 'Grocery store.', 'Store hours.']),
            ('market', 'рынок', ['Farmers market.', 'Market day.', 'Street market.']),
            ('supermarket', 'супермаркет', ['Shop at supermarket.', 'Supermarket chain.', 'Supermarket aisle.']),
            ('mall', 'торговый центр', ['Shopping mall.', 'Mall parking.', 'Go to the mall.']),
            ('shopping', 'покупки', ['Go shopping.', 'Shopping list.', 'Shopping bag.']),
            ('buy', 'покупать', ['Buy groceries.', 'Buy online.', 'Buy in bulk.']),
            ('purchase', 'покупка, покупать', ['Make a purchase.', 'Purchase history.', 'Recent purchase.']),
            ('sell', 'продавать', ['Sell products.', 'For sale.', 'Sell online.']),
            ('price', 'цена', ['Good price.', 'Price tag.', 'Ask the price.']),
            ('cost', 'стоимость, стоить', ['How much does it cost?', 'Cost of living.', 'Total cost.']),
            ('expensive', 'дорогой', ['Too expensive.', 'Expensive taste.', 'Very expensive.']),
            ('cheap', 'дешёвый', ['Cheap price.', 'Buy cheap.', 'Cheap quality.']),
            ('bargain', 'выгодная покупка', ['Great bargain.', 'Bargain price.', 'Bargain hunter.']),
            ('discount', 'скидка', ['Student discount.', 'Discount code.', '20% discount.']),
        ]
    },
    'work_interview': {
        'title': 'Собеседование',
        'topic': 'work',
        'description': 'Поиск работы и интервью',
        'words': [
            ('job', 'работа', ['Looking for a job.', 'Job application.', 'Dream job.']),
            ('position', 'должность', ['Apply for position.', 'Open position.', 'Senior position.']),
            ('vacancy', 'вакансия', ['Job vacancy.', 'Fill vacancy.', 'Vacancy announcement.']),
            ('career', 'карьера', ['Career development.', 'Career path.', 'Career goals.']),
            ('employment', 'трудоустройство', ['Full employment.', 'Employment contract.', 'Employment history.']),
            ('interview', 'собеседование', ['Job interview.', 'Interview questions.', 'Phone interview.']),
            ('candidate', 'кандидат', ['Job candidate.', 'Ideal candidate.', 'Interview candidate.']),
            ('applicant', 'соискатель', ['Job applicant.', 'Applicant pool.', 'Review applicant.']),
            ('resume', 'резюме', ['Send resume.', 'Update resume.', 'Resume template.']),
            ('CV', 'резюме (curriculum vitae)', ['Submit CV.', 'CV format.', 'Professional CV.']),
            ('experience', 'опыт', ['Work experience.', 'Years of experience.', 'Relevant experience.']),
            ('skill', 'навык', ['Technical skills.', 'Soft skills.', 'Skill set.']),
            ('qualification', 'квалификация', ['Educational qualification.', 'Professional qualification.', 'Required qualification.']),
            ('salary', 'зарплата', ['Annual salary.', 'Salary range.', 'Negotiate salary.']),
            ('hire', 'нанимать', ['Hire employees.', 'Hiring process.', 'Get hired.']),
        ]
    },
    'work_communication': {
        'title': 'Рабочая коммуникация',
        'topic': 'work',
        'description': 'Общение с коллегами',
        'words': [
            ('colleague', 'коллега', ['My colleague helped me.', 'Colleague from IT.', 'Work with colleagues.']),
            ('coworker', 'сотрудник', ['Friendly coworker.', 'Coworker relationship.', 'Help coworker.']),
            ('teammate', 'член команды', ['Great teammate.', 'Teammate collaboration.', 'Support teammate.']),
            ('boss', 'начальник', ['Talk to boss.', 'Boss approval.', 'Report to boss.']),
            ('supervisor', 'руководитель', ['Immediate supervisor.', 'Supervisor feedback.', 'Supervisor meeting.']),
            ('manager', 'менеджер', ['Project manager.', 'Manager role.', 'Speak to manager.']),
            ('director', 'директор', ['Company director.', 'Board of directors.', 'Director meeting.']),
            ('employee', 'сотрудник', ['Company employee.', 'Employee benefits.', 'Employee handbook.']),
            ('team', 'команда', ['Team meeting.', 'Team member.', 'Team work.']),
            ('department', 'отдел', ['HR department.', 'Department head.', 'Sales department.']),
            ('company', 'компания', ['Work for company.', 'Company policy.', 'Company culture.']),
            ('project', 'проект', ['New project.', 'Project deadline.', 'Project manager.']),
            ('task', 'задача', ['Complete task.', 'Task list.', 'Assign task.']),
            ('meeting', 'встреча', ['Team meeting.', 'Meeting room.', 'Schedule meeting.']),
            ('email', 'электронная почта', ['Send email.', 'Check email.', 'Email address.']),
        ]
    },
    'tech_programming': {
        'title': 'Программирование',
        'topic': 'technology',
        'description': 'Разработка и код',
        'words': [
            ('code', 'код', ['Write code.', 'Clean code.', 'Code review.']),
            ('programming', 'программирование', ['Programming language.', 'Programming skills.', 'Learn programming.']),
            ('developer', 'разработчик', ['Software developer.', 'Frontend developer.', 'Web developer.']),
            ('programmer', 'программист', ['Experienced programmer.', 'Programmer job.', 'Computer programmer.']),
            ('algorithm', 'алгоритм', ['Sorting algorithm.', 'Algorithm design.', 'Efficient algorithm.']),
            ('function', 'функция', ['Call function.', 'Function parameter.', 'Write function.']),
            ('variable', 'переменная', ['Declare variable.', 'Variable name.', 'Variable type.']),
            ('array', 'массив', ['Array element.', 'Create array.', 'Array index.']),
            ('object', 'объект', ['JavaScript object.', 'Object properties.', 'Create object.']),
            ('class', 'класс', ['Define class.', 'Class method.', 'Class inheritance.']),
            ('method', 'метод', ['Class method.', 'Call method.', 'Method parameter.']),
            ('loop', 'цикл', ['For loop.', 'While loop.', 'Loop iteration.']),
            ('condition', 'условие', ['If condition.', 'Conditional statement.', 'Check condition.']),
            ('error', 'ошибка', ['Syntax error.', 'Error message.', 'Handle error.']),
            ('debug', 'отладка, отлаживать', ['Debug code.', 'Debug mode.', 'Debugging tools.']),
        ]
    },
    'food_cooking': {
        'title': 'Приготовление пищи',
        'topic': 'food',
        'description': 'Кулинария и рецепты',
        'words': [
            ('cook', 'готовить', ['Cook dinner.', 'Cook at home.', 'Learn to cook.']),
            ('recipe', 'рецепт', ['Follow recipe.', 'Recipe book.', 'Family recipe.']),
            ('ingredient', 'ингредиент', ['Fresh ingredients.', 'Main ingredient.', 'List ingredients.']),
            ('kitchen', 'кухня', ['Modern kitchen.', 'Kitchen appliances.', 'Work in kitchen.']),
            ('oven', 'духовка', ['Preheat oven.', 'Oven temperature.', 'Bake in oven.']),
            ('stove', 'плита', ['Gas stove.', 'Cook on stove.', 'Electric stove.']),
            ('pan', 'сковорода', ['Frying pan.', 'Heat the pan.', 'Non-stick pan.']),
            ('pot', 'кастрюля', ['Soup pot.', 'Boil in pot.', 'Large pot.']),
            ('knife', 'нож', ['Sharp knife.', 'Kitchen knife.', 'Cut with knife.']),
            ('bowl', 'миска', ['Mixing bowl.', 'Salad bowl.', 'Pour into bowl.']),
            ('spoon', 'ложка', ['Wooden spoon.', 'Tablespoon.', 'Stir with spoon.']),
            ('fork', 'вилка', ['Use fork.', 'Fork and knife.', 'Salad fork.']),
            ('plate', 'тарелка', ['Dinner plate.', 'Serve on plate.', 'Clean plates.']),
            ('boil', 'кипятить', ['Boil water.', 'Boil eggs.', 'Bring to boil.']),
            ('fry', 'жарить', ['Fry onions.', 'Deep fry.', 'Stir fry.']),
        ]
    },
    'health_medical': {
        'title': 'Медицина и здоровье',
        'topic': 'health',
        'description': 'Поход к врачу',
        'words': [
            ('doctor', 'врач', ['See a doctor.', 'Family doctor.', 'Doctor appointment.']),
            ('hospital', 'больница', ['Go to hospital.', 'Hospital ward.', 'Hospital visit.']),
            ('clinic', 'клиника', ['Medical clinic.', 'Dental clinic.', 'Visit clinic.']),
            ('patient', 'пациент', ['Patient care.', 'New patient.', 'Patient history.']),
            ('medicine', 'лекарство', ['Take medicine.', 'Prescription medicine.', 'Medicine cabinet.']),
            ('pain', 'боль', ['Feel pain.', 'Pain relief.', 'Sharp pain.']),
            ('sick', 'больной', ['Feel sick.', 'Sick leave.', 'Get sick.']),
            ('ill', 'больной', ['Seriously ill.', 'Fall ill.', 'Ill health.']),
            ('health', 'здоровье', ['Good health.', 'Health insurance.', 'Public health.']),
            ('treatment', 'лечение', ['Medical treatment.', 'Treatment plan.', 'Under treatment.']),
            ('prescription', 'рецепт (медицинский)', ['Doctor prescription.', 'Prescription medicine.', 'Fill prescription.']),
            ('symptom', 'симптом', ['Flu symptoms.', 'Show symptoms.', 'Common symptom.']),
            ('fever', 'лихорадка, жар', ['High fever.', 'Fever reducer.', 'Have fever.']),
            ('cough', 'кашель', ['Bad cough.', 'Cough medicine.', 'Cough syrup.']),
            ('headache', 'головная боль', ['Severe headache.', 'Headache relief.', 'Have headache.']),
        ]
    },
    'sports_activities': {
        'title': 'Спорт и активности',
        'topic': 'sports',
        'description': 'Виды спорта',
        'words': [
            ('sport', 'спорт', ['Play sport.', 'Favorite sport.', 'Sport activities.']),
            ('game', 'игра', ['Football game.', 'Play game.', 'Win the game.']),
            ('team', 'команда', ['Sports team.', 'Team player.', 'Join team.']),
            ('player', 'игрок', ['Football player.', 'Team player.', 'Best player.']),
            ('coach', 'тренер', ['Team coach.', 'Coach training.', 'Hire coach.']),
            ('training', 'тренировка', ['Training session.', 'Daily training.', 'Training program.']),
            ('exercise', 'упражнение', ['Physical exercise.', 'Exercise routine.', 'Do exercise.']),
            ('fitness', 'фитнес', ['Fitness club.', 'Fitness training.', 'Physical fitness.']),
            ('gym', 'тренажёрный зал', ['Go to gym.', 'Gym membership.', 'Home gym.']),
            ('run', 'бегать', ['Morning run.', 'Run daily.', 'Run fast.']),
            ('swim', 'плавать', ['Swim in pool.', 'Learn to swim.', 'Swim team.']),
            ('play', 'играть', ['Play football.', 'Play tennis.', 'Play sports.']),
            ('match', 'матч', ['Football match.', 'Watch match.', 'Match result.']),
            ('competition', 'соревнование', ['Sports competition.', 'Win competition.', 'International competition.']),
            ('winner', 'победитель', ['Match winner.', 'Competition winner.', 'Declare winner.']),
        ]
    },
}

def escape_sql_string(s):
    """Экранирование одинарных кавычек для SQL"""
    return s.replace("'", "''")

def generate_migration_sql():
    """Генерация SQL миграции"""
    lines = []
    
    # Добавляем наборы
    for set_id, set_data in WORD_SETS_WITH_TRANSLATIONS.items():
        title = escape_sql_string(set_data['title'])
        topic = set_data['topic']
        description = escape_sql_string(set_data['description'])
        word_count = len(set_data['words'])
        
        lines.append(f"-- Набор: {set_data['title']}")
        lines.append(f"INSERT INTO t_p7147437_shag_to_speak.word_sets (id, title, topic, description, word_count)")
        lines.append(f"SELECT '{set_id}', '{title}', '{topic}', '{description}', {word_count}")
        lines.append(f"WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_sets WHERE id = '{set_id}');")
        lines.append("")
    
    # Добавляем слова
    for set_id, set_data in WORD_SETS_WITH_TRANSLATIONS.items():
        lines.append(f"-- Слова для набора: {set_data['title']}")
        for word, translation, examples in set_data['words']:
            word_esc = escape_sql_string(word)
            translation_esc = escape_sql_string(translation)
            examples_esc = [escape_sql_string(ex) for ex in examples]
            examples_sql = ', '.join([f"'{ex}'" for ex in examples_esc])
            
            lines.append(f"INSERT INTO t_p7147437_shag_to_speak.word_set_items (set_id, english_word, russian_translation, examples)")
            lines.append(f"SELECT '{set_id}', '{word_esc}', '{translation_esc}', ARRAY[{examples_sql}]")
            lines.append(f"WHERE NOT EXISTS (SELECT 1 FROM t_p7147437_shag_to_speak.word_set_items WHERE set_id = '{set_id}' AND english_word = '{word_esc}');")
            lines.append("")
    
    return '\n'.join(lines)

if __name__ == '__main__':
    sql = generate_migration_sql()
    
    # Сохраняем в файл
    with open('migration_all_sets.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"✅ Миграция сгенерирована: migration_all_sets.sql")
    print(f"📊 Наборов: {len(WORD_SETS_WITH_TRANSLATIONS)}")
    print(f"📝 Слов: {sum(len(data['words']) for data in WORD_SETS_WITH_TRANSLATIONS.values())}")
