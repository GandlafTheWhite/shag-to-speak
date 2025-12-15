-- Расширение таблицы users для подписок
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_trial_used BOOLEAN DEFAULT FALSE;

-- Таблица тарифных планов
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  tier VARCHAR(20) UNIQUE NOT NULL,
  price_rub INTEGER NOT NULL,
  words_limit INTEGER NOT NULL,
  word_sets_limit INTEGER NOT NULL,
  exercises_limit INTEGER NOT NULL,
  status_changes_limit INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Заполнение тарифов
INSERT INTO subscription_plans (tier, price_rub, words_limit, word_sets_limit, exercises_limit, status_changes_limit) 
VALUES
('basic', 399, 60, 4, 20, 10),
('pro', 799, 150, 10, 50, 20),
('unlimited', 1499, -1, -1, -1, -1)
ON CONFLICT (tier) DO NOTHING;

-- Таблица использования лимитов
CREATE TABLE IF NOT EXISTS subscription_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  words_added INTEGER DEFAULT 0,
  word_sets_added INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  status_changes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, period_start)
);

-- Таблица транзакций
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  transaction_id UUID UNIQUE,
  tier VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  payment_method INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier, subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON subscription_usage(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON payment_transactions(user_id, status);