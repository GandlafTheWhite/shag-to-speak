# ShagToSpeak — Документация

> Платформа для изучения английского языка методом интервального повторения с AI-генерацией упражнений.

**Версия:** 1.0.2

---

## 🎯 Описание

**ShagToSpeak** — веб-приложение для изучения английских слов. Пользователь добавляет слова в словарь, система генерирует персонализированные упражнения с AI. Геймификация через streak и очки мотивирует на регулярные занятия.

---

## 🏗 Архитектура

```
Frontend (React SPA + PWA)
    ↓ REST API
Backend (Cloud Functions)
    ↓
PostgreSQL + AI API (gen-api.ru)
```

**Компоненты:**
- **Frontend** — React SPA с offline-first подходом
- **Backend** — Serverless функции (Python/TypeScript)
- **Database** — PostgreSQL для хранения данных
- **AI** — gen-api.ru (o1-mini) для генерации контента

---

## 🛠 Технологии

### Frontend
- React 18 + TypeScript
- Vite (сборщик)
- Tailwind CSS + shadcn/ui
- Service Worker (offline)
- PWA (установка на устройства)

### Backend
- **Python 3.11** — БД, AI, бизнес-логика
- **TypeScript/Node.js 22** — auth, real-time
- **psycopg2** — PostgreSQL драйвер
- **requests** — HTTP клиент

### Внешние сервисы
- **gen-api.ru** — AI генерация упражнений
- **Telegram Bot API** — авторизация
- **CDN** — хранение изображений

---

## 📁 Структура

```
src/
  ├── components/      # React компоненты
  ├── pages/           # Страницы
  ├── utils/           # API клиент
  └── version.ts       # Версионирование

backend/
  ├── auth/            # Авторизация (TS)
  ├── exercises/       # Упражнения (Python)
  ├── words/           # Словарь (Python)
  └── func2url.json    # Маппинг URLs

db_migrations/         # SQL миграции
public/
  ├── manifest.json    # PWA манифест
  └── service-worker.js # Offline
```

---

## ⚙️ Функционал

### Словарь
- Добавление слов (вручную/AI)
- Категоризация (45+ категорий)
- Метаданные (транскрипция, примеры)
- Фильтрация по статусам

### Упражнения
**8 типов:**
- Translation
- Multiple Choice
- Fill in the Blank
- Synonym/Antonym
- Context Match
- Sentence Construction
- Reverse Translation
- Word Formation

**4 уровня сложности:**
- Beginner / Intermediate / Advanced / Master

### Геймификация
- Streak Counter (дни подряд)
- Points System (очки)
- Progress Tracking (статистика)

### PWA
- Установка на устройства
- Offline режим
- Кэширование API

---

## 🗄 База данных

**Основные таблицы:**

**users**
```
id, email, name, telegram_id
exercise_difficulty, total_points, current_streak
status (free/premium)
```

**user_words**
```
user_id, english_word, russian_translation
category, transcription, difficulty_level
mastery_level, practice_count
```

**exercise_history**
```
user_id, exercise_date, difficulty
correct_count, total_count, points_earned
```

**daily_streaks**
```
user_id, current_streak, longest_streak
last_activity_date
```

---

## 🚀 Развёртывание

### Секреты (Environment Variables)
```
DATABASE_URL          # PostgreSQL
GENAPI_KEY           # AI API
TELEGRAM_BOT_TOKEN   # Telegram
```

### Команды
```bash
bun install          # Установка
bun run dev          # Разработка
bun run build        # Production сборка
```

### Backend
- Функции деплоятся через `sync_backend`
- URLs доступны в `func2url.json`

---

## 🔐 Безопасность

- JWT токены
- Password hashing (bcrypt)
- CORS настройки
- Custom auth headers (X-User-Id, X-Auth-Token)
- Параметризованные SQL запросы

---

## 📊 Тарифы

| | Free | Premium (199₽/мес) |
|---|---|---|
| Словарь | 50 слов | ∞ |
| Упражнения | 3/день | ∞ |

---

## 🔄 Версионирование

- Автоматическое через `src/version.ts`
- Очистка кэшей при обновлении
- Сохранение авторизации
- Формат: Major.Minor.Patch

**Текущая:** 1.0.2

---

## 🐛 Ограничения

- PostgreSQL: Simple Query Protocol only
- AI генерация: до 30 сек
- Offline: только кэш, без синхронизации
- Toast: 1 уведомление одновременно

---

## 📞 Ссылки

- **Сообщество:** https://t.me/+QgiLIa1gFRY4Y2Iy
- **Документация:** https://docs.poehali.dev
- **Платформа:** https://poehali.dev

---

**Разработано на [poehali.dev](https://poehali.dev)**
