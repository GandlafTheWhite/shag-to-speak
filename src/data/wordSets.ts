export interface WordSet {
  id: string;
  title: string;
  topic: string;
  description: string;
  words: string[];
}

export const WORD_SETS: WordSet[] = [
  {
    id: 'essential_basic_500',
    title: '500 базовых слов',
    topic: 'essential_1000',
    description: 'Самые употребляемые слова для начинающих',
    words: ['hello', 'goodbye', 'please', 'thank', 'yes', 'no', 'help', 'sorry', 'love', 'time', 'day', 'night', 'morning', 'evening', 'today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'water', 'food', 'house', 'home', 'family', 'friend', 'work', 'school', 'book', 'car', 'phone', 'money', 'person', 'man', 'woman', 'child', 'good', 'bad', 'big', 'small', 'new', 'old', 'young', 'happy', 'sad', 'hot', 'cold', 'fast', 'slow', 'easy']
  },
  {
    id: 'essential_advanced_500',
    title: '500 важных слов (продвинутый)',
    topic: 'essential_1000',
    description: 'Следующий уровень базовой лексики',
    words: ['ability', 'achieve', 'active', 'address', 'advantage', 'afraid', 'agree', 'allow', 'almost', 'already', 'although', 'among', 'amount', 'ancient', 'angry', 'answer', 'appear', 'approach', 'area', 'argue', 'arrive', 'article', 'aspect', 'attack', 'attempt', 'attend', 'attention', 'attitude', 'attract', 'audience', 'available', 'average', 'avoid', 'aware', 'balance', 'base', 'basic', 'beautiful', 'become', 'before', 'begin', 'behavior', 'behind', 'believe', 'benefit', 'better', 'between', 'beyond', 'brain', 'branch']
  },
  {
    id: 'travel_airport',
    title: 'Аэропорт и полёт',
    topic: 'travel',
    description: 'Всё для путешествия самолётом',
    words: ['flight', 'airport', 'passport', 'boarding', 'gate', 'luggage', 'baggage', 'check-in', 'security', 'customs', 'departure', 'arrival', 'terminal', 'runway', 'pilot', 'steward', 'stewardess', 'seat', 'seatbelt', 'overhead', 'aisle', 'window', 'emergency', 'delay', 'cancelled', 'connecting', 'direct', 'layover', 'visa', 'ticket', 'reservation', 'destination', 'immigration', 'declare', 'duty-free', 'boarding pass', 'carry-on', 'checked', 'excess', 'weight', 'allowance', 'claim', 'carousel', 'trolley', 'porter', 'transfer', 'announce', 'final call', 'takeoff', 'landing']
  },
  {
    id: 'travel_hotel',
    title: 'Гостиница и проживание',
    topic: 'travel',
    description: 'Бронирование и размещение в отеле',
    words: ['hotel', 'hostel', 'room', 'reservation', 'booking', 'check-in', 'check-out', 'reception', 'receptionist', 'key', 'keycard', 'lobby', 'single', 'double', 'twin', 'suite', 'floor', 'elevator', 'stairs', 'bed', 'pillow', 'blanket', 'towel', 'bathroom', 'shower', 'toilet', 'amenities', 'housekeeping', 'maid', 'service', 'breakfast', 'minibar', 'safe', 'wifi', 'air conditioning', 'heating', 'view', 'balcony', 'complimentary', 'charge', 'bill', 'payment', 'deposit', 'refund', 'vacancy', 'occupied', 'available', 'facilities', 'gym', 'pool']
  },
  {
    id: 'business_meetings',
    title: 'Деловые встречи',
    topic: 'business',
    description: 'Переговоры и совещания',
    words: ['meeting', 'conference', 'agenda', 'participant', 'chairman', 'presentation', 'proposal', 'negotiate', 'agreement', 'contract', 'deadline', 'budget', 'forecast', 'revenue', 'profit', 'loss', 'investment', 'stakeholder', 'shareholder', 'board', 'director', 'executive', 'manager', 'employee', 'colleague', 'client', 'customer', 'supplier', 'vendor', 'partner', 'competitor', 'market', 'strategy', 'goal', 'objective', 'target', 'achievement', 'success', 'failure', 'challenge', 'opportunity', 'threat', 'strength', 'weakness', 'analysis', 'report', 'summary', 'conclusion', 'recommendation', 'decision']
  },
  {
    id: 'business_office',
    title: 'Офис и рабочее место',
    topic: 'business',
    description: 'Офисная лексика и оборудование',
    words: ['office', 'desk', 'chair', 'computer', 'laptop', 'keyboard', 'mouse', 'screen', 'monitor', 'printer', 'scanner', 'copier', 'fax', 'phone', 'extension', 'email', 'document', 'file', 'folder', 'cabinet', 'drawer', 'shelf', 'stationery', 'pen', 'pencil', 'paper', 'notebook', 'stapler', 'clips', 'tape', 'scissors', 'calculator', 'calendar', 'schedule', 'appointment', 'meeting room', 'boardroom', 'cubicle', 'workspace', 'break room', 'cafeteria', 'reception', 'entrance', 'exit', 'elevator', 'restroom', 'supplies', 'equipment', 'furniture', 'lighting']
  },
  {
    id: 'everyday_greetings',
    title: 'Приветствия и прощания',
    topic: 'everyday',
    description: 'Базовые фразы общения',
    words: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'good night', 'goodbye', 'bye', 'see you', 'take care', 'have a nice day', 'welcome', 'nice to meet you', 'pleased to meet you', 'how are you', 'how do you do', 'fine', 'great', 'excellent', 'not bad', 'so-so', 'terrible', 'awful', 'excuse me', 'pardon', 'sorry', 'apologize', 'forgive', 'please', 'thank you', 'thanks', 'you\'re welcome', 'no problem', 'my pleasure', 'sure', 'certainly', 'of course', 'absolutely', 'definitely', 'perhaps', 'maybe', 'probably', 'possibly', 'never mind', 'don\'t worry', 'no worries', 'congratulations', 'good luck', 'bless you']
  },
  {
    id: 'everyday_shopping',
    title: 'Покупки и магазины',
    topic: 'everyday',
    description: 'Шоппинг и торговля',
    words: ['shop', 'store', 'market', 'supermarket', 'mall', 'boutique', 'shopping', 'buy', 'purchase', 'sell', 'price', 'cost', 'expensive', 'cheap', 'bargain', 'discount', 'sale', 'offer', 'deal', 'receipt', 'cash', 'card', 'credit card', 'payment', 'change', 'checkout', 'cashier', 'queue', 'line', 'customer', 'shopper', 'basket', 'cart', 'bag', 'product', 'item', 'goods', 'merchandise', 'brand', 'quality', 'size', 'color', 'fit', 'try on', 'return', 'exchange', 'refund', 'guarantee', 'warranty', 'stock']
  },
  {
    id: 'work_interview',
    title: 'Собеседование',
    topic: 'work',
    description: 'Поиск работы и интервью',
    words: ['job', 'position', 'vacancy', 'opening', 'career', 'employment', 'interview', 'interviewer', 'candidate', 'applicant', 'resume', 'CV', 'cover letter', 'application', 'qualification', 'experience', 'skill', 'ability', 'strength', 'weakness', 'achievement', 'reference', 'background', 'education', 'degree', 'certificate', 'training', 'internship', 'probation', 'permanent', 'temporary', 'full-time', 'part-time', 'freelance', 'contract', 'salary', 'wage', 'benefit', 'package', 'bonus', 'commission', 'raise', 'promotion', 'opportunity', 'responsibility', 'duty', 'task', 'requirement', 'expectation', 'hire', 'recruit']
  },
  {
    id: 'work_communication',
    title: 'Рабочая коммуникация',
    topic: 'work',
    description: 'Общение с коллегами',
    words: ['colleague', 'coworker', 'teammate', 'boss', 'supervisor', 'manager', 'director', 'CEO', 'employee', 'staff', 'team', 'department', 'division', 'company', 'organization', 'corporation', 'business', 'enterprise', 'project', 'task', 'assignment', 'deadline', 'meeting', 'discussion', 'conversation', 'communication', 'email', 'message', 'call', 'conference', 'presentation', 'report', 'update', 'feedback', 'suggestion', 'complaint', 'problem', 'solution', 'decision', 'approval', 'permission', 'authorization', 'agreement', 'cooperation', 'collaboration', 'teamwork', 'support', 'assist', 'help', 'advice']
  },
  {
    id: 'tech_computer',
    title: 'Компьютер и интернет',
    topic: 'technology',
    description: 'Базовая IT-терминология',
    words: ['computer', 'laptop', 'desktop', 'tablet', 'smartphone', 'device', 'hardware', 'software', 'program', 'application', 'app', 'system', 'operating system', 'Windows', 'MacOS', 'Linux', 'browser', 'internet', 'web', 'website', 'webpage', 'online', 'offline', 'connection', 'wifi', 'network', 'server', 'cloud', 'email', 'password', 'username', 'login', 'logout', 'download', 'upload', 'file', 'folder', 'document', 'data', 'backup', 'virus', 'antivirus', 'security', 'firewall', 'update', 'upgrade', 'install', 'uninstall', 'delete', 'save']
  },
  {
    id: 'tech_programming',
    title: 'Программирование',
    topic: 'technology',
    description: 'Разработка и код',
    words: ['code', 'programming', 'developer', 'programmer', 'software', 'application', 'algorithm', 'function', 'variable', 'constant', 'array', 'object', 'class', 'method', 'parameter', 'argument', 'return', 'loop', 'condition', 'if', 'else', 'switch', 'for', 'while', 'break', 'continue', 'try', 'catch', 'error', 'exception', 'debug', 'bug', 'test', 'compile', 'run', 'execute', 'syntax', 'logic', 'database', 'query', 'API', 'framework', 'library', 'package', 'module', 'import', 'export', 'repository', 'commit', 'push']
  },
  {
    id: 'food_restaurant',
    title: 'Ресторан и кафе',
    topic: 'food',
    description: 'Заказ еды в заведениях',
    words: ['restaurant', 'cafe', 'bar', 'menu', 'dish', 'meal', 'breakfast', 'lunch', 'dinner', 'appetizer', 'starter', 'main course', 'entree', 'dessert', 'drink', 'beverage', 'waiter', 'waitress', 'server', 'order', 'reserve', 'reservation', 'table', 'seat', 'chair', 'bill', 'check', 'tip', 'service', 'delicious', 'tasty', 'spicy', 'sweet', 'sour', 'salty', 'bitter', 'fresh', 'organic', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'allergy', 'ingredient', 'recipe', 'cook', 'chef', 'kitchen', 'portion', 'serving']
  },
  {
    id: 'food_cooking',
    title: 'Приготовление пищи',
    topic: 'food',
    description: 'Кулинария и рецепты',
    words: ['cook', 'cooking', 'kitchen', 'recipe', 'ingredient', 'preparation', 'bake', 'boil', 'fry', 'grill', 'roast', 'steam', 'stir', 'mix', 'blend', 'chop', 'slice', 'dice', 'peel', 'cut', 'pour', 'add', 'combine', 'heat', 'simmer', 'season', 'flavor', 'taste', 'oven', 'stove', 'pan', 'pot', 'bowl', 'plate', 'knife', 'spoon', 'fork', 'spatula', 'whisk', 'measure', 'cup', 'tablespoon', 'teaspoon', 'gram', 'kilogram', 'liter', 'temperature', 'timer', 'serve', 'garnish']
  },
  {
    id: 'health_symptoms',
    title: 'Симптомы и недомогания',
    topic: 'health',
    description: 'Описание состояния здоровья',
    words: ['sick', 'ill', 'disease', 'illness', 'symptom', 'pain', 'ache', 'headache', 'stomachache', 'toothache', 'backache', 'sore', 'throat', 'cough', 'cold', 'flu', 'fever', 'temperature', 'dizzy', 'nausea', 'vomit', 'diarrhea', 'constipation', 'tired', 'fatigue', 'weak', 'exhausted', 'swelling', 'inflammation', 'rash', 'itch', 'bleeding', 'bruise', 'wound', 'injury', 'fracture', 'sprain', 'allergy', 'infection', 'virus', 'bacteria', 'chronic', 'acute', 'severe', 'mild', 'serious', 'emergency', 'urgent', 'recovery', 'heal']
  },
  {
    id: 'health_medical',
    title: 'Медицина и лечение',
    topic: 'health',
    description: 'Врачи, лекарства, процедуры',
    words: ['doctor', 'physician', 'nurse', 'patient', 'hospital', 'clinic', 'pharmacy', 'medicine', 'medication', 'drug', 'pill', 'tablet', 'capsule', 'prescription', 'dose', 'treatment', 'therapy', 'cure', 'heal', 'recover', 'examination', 'checkup', 'diagnosis', 'test', 'scan', 'X-ray', 'ultrasound', 'blood test', 'surgery', 'operation', 'procedure', 'injection', 'shot', 'vaccine', 'vaccination', 'bandage', 'dressing', 'stitch', 'cast', 'crutch', 'wheelchair', 'ambulance', 'emergency', 'insurance', 'appointment', 'consultation', 'referral', 'specialist', 'surgeon', 'dentist']
  },
  {
    id: 'emotions_positive',
    title: 'Положительные эмоции',
    topic: 'emotions',
    description: 'Радость и счастье',
    words: ['happy', 'joy', 'joyful', 'cheerful', 'delighted', 'pleased', 'satisfied', 'content', 'glad', 'excited', 'thrilled', 'ecstatic', 'enthusiastic', 'optimistic', 'hopeful', 'confident', 'proud', 'grateful', 'thankful', 'appreciative', 'relieved', 'calm', 'peaceful', 'serene', 'relaxed', 'comfortable', 'love', 'affection', 'fond', 'caring', 'warm', 'tender', 'passionate', 'inspired', 'motivated', 'energetic', 'alive', 'blessed', 'fortunate', 'lucky', 'amazing', 'wonderful', 'fantastic', 'excellent', 'great', 'brilliant', 'superb', 'magnificent', 'awesome', 'incredible']
  },
  {
    id: 'emotions_negative',
    title: 'Негативные эмоции',
    topic: 'emotions',
    description: 'Грусть и злость',
    words: ['sad', 'unhappy', 'miserable', 'depressed', 'gloomy', 'melancholy', 'sorrowful', 'grief', 'heartbroken', 'disappointed', 'frustrated', 'upset', 'hurt', 'angry', 'mad', 'furious', 'enraged', 'irritated', 'annoyed', 'bothered', 'worried', 'anxious', 'nervous', 'stressed', 'tense', 'afraid', 'scared', 'frightened', 'terrified', 'fearful', 'panic', 'shocked', 'surprised', 'confused', 'bewildered', 'embarrassed', 'ashamed', 'guilty', 'regretful', 'jealous', 'envious', 'lonely', 'isolated', 'rejected', 'abandoned', 'hopeless', 'desperate', 'overwhelmed', 'exhausted', 'tired']
  },
  {
    id: 'nature_animals',
    title: 'Животные',
    topic: 'nature',
    description: 'Дикие и домашние животные',
    words: ['animal', 'pet', 'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'rabbit', 'mouse', 'rat', 'lion', 'tiger', 'bear', 'elephant', 'giraffe', 'zebra', 'monkey', 'gorilla', 'wolf', 'fox', 'deer', 'moose', 'eagle', 'hawk', 'owl', 'parrot', 'penguin', 'dolphin', 'whale', 'shark', 'snake', 'lizard', 'turtle', 'frog', 'butterfly', 'bee', 'ant', 'spider', 'fly', 'mosquito', 'wild', 'domestic', 'tame', 'dangerous']
  },
  {
    id: 'nature_environment',
    title: 'Природа и окружающая среда',
    topic: 'nature',
    description: 'Экология и климат',
    words: ['nature', 'environment', 'ecology', 'climate', 'weather', 'temperature', 'season', 'spring', 'summer', 'autumn', 'fall', 'winter', 'rain', 'snow', 'wind', 'storm', 'thunder', 'lightning', 'cloud', 'sky', 'sun', 'moon', 'star', 'mountain', 'hill', 'valley', 'forest', 'jungle', 'desert', 'ocean', 'sea', 'lake', 'river', 'stream', 'island', 'beach', 'coast', 'tree', 'plant', 'flower', 'grass', 'leaf', 'branch', 'root', 'seed', 'pollution', 'waste', 'recycle', 'conservation', 'protect']
  },
  {
    id: 'sport_team',
    title: 'Командные виды спорта',
    topic: 'sport',
    description: 'Футбол, баскетбол и др.',
    words: ['sport', 'team', 'player', 'coach', 'game', 'match', 'competition', 'tournament', 'championship', 'league', 'season', 'football', 'soccer', 'basketball', 'volleyball', 'baseball', 'hockey', 'rugby', 'cricket', 'goal', 'score', 'point', 'win', 'lose', 'draw', 'tie', 'victory', 'defeat', 'champion', 'trophy', 'medal', 'stadium', 'field', 'court', 'pitch', 'ball', 'net', 'referee', 'whistle', 'foul', 'penalty', 'corner', 'throw', 'kick', 'pass', 'tackle', 'defense', 'attack', 'offense', 'strategy']
  },
  {
    id: 'sport_individual',
    title: 'Индивидуальные виды спорта',
    topic: 'sport',
    description: 'Теннис, плавание, бег',
    words: ['tennis', 'swimming', 'running', 'jogging', 'marathon', 'sprint', 'race', 'track', 'athletics', 'gymnastics', 'boxing', 'wrestling', 'martial arts', 'judo', 'karate', 'cycling', 'skiing', 'snowboarding', 'skating', 'surfing', 'diving', 'climbing', 'hiking', 'fitness', 'exercise', 'workout', 'training', 'practice', 'gym', 'weight', 'strength', 'endurance', 'speed', 'flexibility', 'technique', 'skill', 'performance', 'record', 'personal best', 'improve', 'progress', 'achieve', 'compete', 'competitor', 'athlete', 'professional', 'amateur', 'beginner', 'advanced', 'expert']
  },
  {
    id: 'art_music',
    title: 'Музыка',
    topic: 'art',
    description: 'Инструменты и жанры',
    words: ['music', 'song', 'melody', 'rhythm', 'beat', 'tempo', 'harmony', 'note', 'chord', 'scale', 'tone', 'pitch', 'instrument', 'piano', 'guitar', 'violin', 'drum', 'trumpet', 'flute', 'saxophone', 'singer', 'musician', 'band', 'orchestra', 'concert', 'performance', 'stage', 'audience', 'compose', 'composer', 'play', 'practice', 'rehearse', 'record', 'studio', 'album', 'track', 'lyrics', 'verse', 'chorus', 'classical', 'rock', 'pop', 'jazz', 'blues', 'folk', 'electronic', 'hip-hop', 'rap', 'country']
  },
  {
    id: 'art_visual',
    title: 'Изобразительное искусство',
    topic: 'art',
    description: 'Живопись и скульптура',
    words: ['art', 'artist', 'painting', 'drawing', 'sculpture', 'statue', 'canvas', 'brush', 'paint', 'color', 'palette', 'sketch', 'portrait', 'landscape', 'still life', 'abstract', 'modern', 'contemporary', 'classical', 'renaissance', 'museum', 'gallery', 'exhibition', 'display', 'collection', 'masterpiece', 'artwork', 'create', 'creative', 'creativity', 'inspire', 'inspiration', 'imagine', 'imagination', 'express', 'expression', 'style', 'technique', 'design', 'designer', 'illustration', 'illustrator', 'graphic', 'digital', 'photography', 'photograph', 'camera', 'picture', 'image', 'frame']
  },
  {
    id: 'education_school',
    title: 'Школа и образование',
    topic: 'education',
    description: 'Учебный процесс',
    words: ['school', 'student', 'pupil', 'teacher', 'professor', 'class', 'lesson', 'subject', 'course', 'study', 'learn', 'teach', 'education', 'knowledge', 'skill', 'textbook', 'book', 'notebook', 'pen', 'pencil', 'homework', 'assignment', 'project', 'test', 'exam', 'quiz', 'grade', 'mark', 'score', 'pass', 'fail', 'graduate', 'diploma', 'certificate', 'degree', 'bachelor', 'master', 'doctorate', 'PhD', 'university', 'college', 'campus', 'library', 'laboratory', 'classroom', 'lecture', 'seminar', 'tutorial', 'research', 'thesis']
  },
  {
    id: 'family_relations',
    title: 'Семья и родственники',
    topic: 'family',
    description: 'Члены семьи',
    words: ['family', 'relative', 'relation', 'parent', 'father', 'dad', 'daddy', 'mother', 'mom', 'mommy', 'child', 'son', 'daughter', 'brother', 'sister', 'sibling', 'twin', 'grandfather', 'grandpa', 'grandmother', 'grandma', 'grandparent', 'grandson', 'granddaughter', 'uncle', 'aunt', 'nephew', 'niece', 'cousin', 'husband', 'wife', 'spouse', 'partner', 'marriage', 'wedding', 'divorce', 'widow', 'widower', 'orphan', 'ancestor', 'descendant', 'generation', 'genealogy', 'family tree', 'inherit', 'inheritance', 'adopt', 'adoption', 'foster', 'stepfather', 'stepmother']
  },
  {
    id: 'finance_money',
    title: 'Деньги и финансы',
    topic: 'finance',
    description: 'Банки и валюта',
    words: ['money', 'cash', 'currency', 'dollar', 'euro', 'pound', 'coin', 'bill', 'banknote', 'cent', 'penny', 'bank', 'account', 'balance', 'deposit', 'withdraw', 'withdrawal', 'transfer', 'payment', 'transaction', 'credit', 'debit', 'loan', 'borrow', 'lend', 'debt', 'owe', 'interest', 'rate', 'fee', 'charge', 'save', 'saving', 'spend', 'expense', 'income', 'salary', 'wage', 'profit', 'loss', 'budget', 'afford', 'cost', 'price', 'value', 'worth', 'exchange', 'invest', 'investment', 'stock']
  },
  {
    id: 'phrasal_verbs_common',
    title: 'Распространённые фразовые глаголы',
    topic: 'phrasal_verbs',
    description: 'Самые употребляемые phrasal verbs',
    words: ['get up', 'wake up', 'stand up', 'sit down', 'lie down', 'go out', 'come in', 'come back', 'go back', 'turn on', 'turn off', 'switch on', 'switch off', 'put on', 'take off', 'look at', 'look for', 'look after', 'look forward to', 'give up', 'give back', 'give away', 'take up', 'take back', 'take away', 'pick up', 'pick out', 'put up', 'put down', 'put away', 'bring up', 'bring back', 'set up', 'set off', 'make up', 'make out', 'break up', 'break down', 'work out', 'figure out', 'find out', 'carry on', 'carry out', 'keep on', 'keep up', 'hold on', 'hold up', 'call off', 'call back']
  },
  {
    id: 'idioms_common',
    title: 'Популярные идиомы',
    topic: 'idioms',
    description: 'Устойчивые выражения',
    words: ['piece of cake', 'break a leg', 'hit the nail on the head', 'let the cat out of the bag', 'cost an arm and a leg', 'once in a blue moon', 'when pigs fly', 'beat around the bush', 'bite the bullet', 'break the ice', 'call it a day', 'cut corners', 'get cold feet', 'give someone the cold shoulder', 'go the extra mile', 'hit the sack', 'it takes two to tango', 'jump on the bandwagon', 'keep your chin up', 'let someone off the hook', 'make a long story short', 'miss the boat', 'no pain no gain', 'on the ball', 'pull someones leg', 'see eye to eye', 'speak of the devil', 'spill the beans', 'steal someones thunder', 'take it with a grain of salt', 'the best of both worlds', 'time flies', 'to make matters worse', 'under the weather', 'you can say that again']
  },
  {
    id: 'academic_essay',
    title: 'Академическое письмо',
    topic: 'academic',
    description: 'Написание эссе и работ',
    words: ['essay', 'thesis', 'dissertation', 'paper', 'article', 'journal', 'research', 'study', 'analysis', 'argument', 'claim', 'evidence', 'source', 'reference', 'citation', 'quote', 'paraphrase', 'summarize', 'introduction', 'conclusion', 'paragraph', 'sentence', 'structure', 'outline', 'draft', 'revision', 'edit', 'proofread', 'grammar', 'vocabulary', 'terminology', 'definition', 'explain', 'describe', 'discuss', 'compare', 'contrast', 'analyze', 'evaluate', 'criticize', 'support', 'oppose', 'agree', 'disagree', 'furthermore', 'moreover', 'however', 'nevertheless', 'therefore', 'thus', 'consequently']
  }
];