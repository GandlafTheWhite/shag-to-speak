export interface Category {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'people_family', title: 'Люди и семья', titleEn: 'People & Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'appearance', title: 'Внешность', titleEn: 'Appearance', icon: '👤' },
  { id: 'character_personality', title: 'Характер и личность', titleEn: 'Character & Personality', icon: '🎭' },
  { id: 'emotions_feelings', title: 'Эмоции и чувства', titleEn: 'Emotions & Feelings', icon: '😊' },
  { id: 'health_medicine', title: 'Здоровье и медицина', titleEn: 'Health & Medicine', icon: '⚕️' },
  { id: 'body_parts', title: 'Части тела', titleEn: 'Body Parts', icon: '🫀' },
  { id: 'clothes_fashion', title: 'Одежда и мода', titleEn: 'Clothes & Fashion', icon: '👔' },
  { id: 'food_drink', title: 'Еда и напитки', titleEn: 'Food & Drink', icon: '🍽️' },
  { id: 'cooking_kitchen', title: 'Готовка и кухня', titleEn: 'Cooking & Kitchen', icon: '👨‍🍳' },
  { id: 'house_home', title: 'Дом и жильё', titleEn: 'House & Home', icon: '🏠' },
  { id: 'furniture_appliances', title: 'Мебель и техника', titleEn: 'Furniture & Appliances', icon: '🛋️' },
  { id: 'daily_routine', title: 'Повседневная жизнь', titleEn: 'Daily Routine', icon: '⏰' },
  { id: 'work_jobs', title: 'Работа и профессии', titleEn: 'Work & Jobs', icon: '💼' },
  { id: 'business_money', title: 'Бизнес и деньги', titleEn: 'Business & Money', icon: '💰' },
  { id: 'education_school', title: 'Образование и школа', titleEn: 'Education & School', icon: '🎓' },
  { id: 'university_studies', title: 'Университет и учёба', titleEn: 'University & Studies', icon: '📚' },
  { id: 'science_technology', title: 'Наука и технологии', titleEn: 'Science & Technology', icon: '🔬' },
  { id: 'computers_internet', title: 'Компьютеры и интернет', titleEn: 'Computers & Internet', icon: '💻' },
  { id: 'sport_fitness', title: 'Спорт и фитнес', titleEn: 'Sport & Fitness', icon: '⚽' },
  { id: 'hobbies_free_time', title: 'Хобби и досуг', titleEn: 'Hobbies & Free Time', icon: '🎨' },
  { id: 'music', title: 'Музыка', titleEn: 'Music', icon: '🎵' },
  { id: 'art_literature', title: 'Искусство и литература', titleEn: 'Art & Literature', icon: '🖼️' },
  { id: 'cinema_theatre', title: 'Кино и театр', titleEn: 'Cinema & Theatre', icon: '🎬' },
  { id: 'media_news', title: 'СМИ и новости', titleEn: 'Media & News', icon: '📰' },
  { id: 'travel_transport', title: 'Путешествия и транспорт', titleEn: 'Travel & Transport', icon: '✈️' },
  { id: 'countries_nationalities', title: 'Страны и национальности', titleEn: 'Countries & Nationalities', icon: '🌍' },
  { id: 'languages', title: 'Языки', titleEn: 'Languages', icon: '🗣️' },
  { id: 'weather', title: 'Погода', titleEn: 'Weather', icon: '🌤️' },
  { id: 'nature_environment', title: 'Природа и экология', titleEn: 'Nature & Environment', icon: '🌳' },
  { id: 'animals_pets', title: 'Животные и питомцы', titleEn: 'Animals & Pets', icon: '🐕' },
  { id: 'plants_gardening', title: 'Растения и садоводство', titleEn: 'Plants & Gardening', icon: '🌱' },
  { id: 'city_countryside', title: 'Город и деревня', titleEn: 'City & Countryside', icon: '🏙️' },
  { id: 'shops_shopping', title: 'Магазины и шопинг', titleEn: 'Shops & Shopping', icon: '🛍️' },
  { id: 'services', title: 'Услуги', titleEn: 'Services', icon: '🏦' },
  { id: 'crime_law', title: 'Преступность и закон', titleEn: 'Crime & Law', icon: '⚖️' },
  { id: 'politics_government', title: 'Политика и государство', titleEn: 'Politics & Government', icon: '🏛️' },
  { id: 'war_peace', title: 'Война и мир', titleEn: 'War & Peace', icon: '☮️' },
  { id: 'history', title: 'История', titleEn: 'History', icon: '📜' },
  { id: 'religion', title: 'Религия', titleEn: 'Religion', icon: '🕌' },
  { id: 'society_social_issues', title: 'Общество и социум', titleEn: 'Society & Social Issues', icon: '👥' },
  { id: 'holidays_celebrations', title: 'Праздники и торжества', titleEn: 'Holidays & Celebrations', icon: '🎉' },
  { id: 'time_dates', title: 'Время и даты', titleEn: 'Time & Dates', icon: '📅' },
  { id: 'numbers_quantities', title: 'Числа и количества', titleEn: 'Numbers & Quantities', icon: '🔢' },
  { id: 'colours', title: 'Цвета', titleEn: 'Colours', icon: '🎨' },
  { id: 'shapes_sizes', title: 'Формы и размеры', titleEn: 'Shapes & Sizes', icon: '📐' },
  { id: 'materials', title: 'Материалы', titleEn: 'Materials', icon: '🧱' },
  { id: 'tools_equipment', title: 'Инструменты и оборудование', titleEn: 'Tools & Equipment', icon: '🔧' },
  { id: 'uncategorized', title: 'Без категории', titleEn: 'Uncategorized', icon: '📦' }
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryTitle = (id: string): string => {
  const category = getCategoryById(id);
  return category ? category.title : 'Без категории';
};

export const getCategoryIcon = (id: string): string => {
  const category = getCategoryById(id);
  return category ? category.icon : '📦';
};
