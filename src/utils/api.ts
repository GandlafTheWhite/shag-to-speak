const API_URLS = {
  auth: 'https://functions.poehali.dev/ce741311-6fd7-45a8-9770-f5d6979da050',
  words: 'https://functions.poehali.dev/d87144a4-ac34-4dce-bdf8-449ebd85b759',
  exercises: 'https://functions.poehali.dev/dab10f03-8dd4-4dc3-af8d-0cb6fd69aeb7',
  stats: 'https://functions.poehali.dev/5e32e154-08b5-4bdf-b5dd-bc3de2075ce1',
  telegramBotAuth: 'https://functions.poehali.dev/11cbde8f-4051-4ebf-8487-67996dc71ef3',
  telegramWebhook: 'https://functions.poehali.dev/e09a4bc7-f64b-4892-8115-71c6adc8bd2c',
  completeProfile: 'https://functions.poehali.dev/d7a51546-f81a-49bc-8dec-0e1026b78fe5',
  telegramLink: 'https://functions.poehali.dev/c2111525-7f03-404a-8a73-22afb051c82f',
  exerciseCategories: 'https://functions.poehali.dev/2cb6dda2-5dee-4cc0-afe0-67993e14943d',
  settings: 'https://functions.poehali.dev/988818e5-d5bb-4ef3-8d05-bd6be60b40a0',
  enrichWords: 'https://functions.poehali.dev/5c93fe2a-0fff-4db2-9d06-24cd6af4f983'
};

export interface ApiError {
  error: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  status: 'free' | 'premium';
  preferences: string[];
  word_count: number;
  exercises_remaining: number;
  daily_exercises_count: number;
  telegram_id?: number;
  profile_completed?: boolean;
  exercise_difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
  total_points?: number;
  current_streak?: number;
  longest_streak?: number;
}

export interface Word {
  id: number;
  english_word: string;
  russian_translation: string;
  examples: string[];
  status: 'learning' | 'done';
  recall_count: number;
  last_recall_date?: string;
  created_at?: string;
  category?: string;
  is_generating?: boolean;
  transcription?: string;
  part_of_speech?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'master';
  example_sentence?: string;
}

export interface Exercise {
  word_id: number;
  type: 'translation' | 'multiple_choice' | 'synonym_antonym' | 'sentence_construction' | 
        'fill_blank' | 'context_match' | 'reverse_translation' | 'word_formation';
  question: string;
  options?: string[];
  correct_answer: string;
  transcription?: string;
  part_of_speech?: string;
  word?: string;
  hint?: string;
}

export interface ExerciseResult {
  word_id: number;
  is_correct: boolean;
  correct_answer: string;
  points_earned?: number;
}

export interface ExerciseCategory {
  name: string;
  word_count: number;
}

export interface Stats {
  words: {
    total: number;
    learning: number;
    done: number;
  };
  exercises: {
    total: number;
    correct: number;
    accuracy: number;
    avg_time?: number;
    total_points?: number;
    by_type?: Array<{
      type: string;
      count: number;
      accuracy: number;
    }>;
  };
  activity: {
    days_active: number;
    unique_days_active?: number;
    weekly: Array<{ date: string; count: number }>;
  };
  top_words: Array<{
    word: string;
    translation: string;
    attempts: number;
    accuracy: number;
  }>;
}

class ApiClient {
  private userId: number | null = null;
  private token: string | null = null;

  setAuth(userId: number, token: string) {
    this.userId = userId;
    this.token = token;
  }

  clearAuth() {
    this.userId = null;
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.userId) {
      headers['X-User-Id'] = this.userId.toString();
    }

    if (this.token) {
      headers['X-Auth-Token'] = this.token;
    }

    return headers;
  }

  async register(
    email: string,
    password: string,
    name: string,
    phone: string,
    preferences: string[]
  ): Promise<{ user: User; token: string }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        email,
        password,
        name,
        phone,
        preferences,
      }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    this.setAuth(data.user.id, data.token);
    return data;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.setAuth(data.user.id, data.token);
    return data;
  }

  async getWords(): Promise<Word[]> {
    if (!this.userId) {
      throw new Error('User ID required');
    }

    const response = await fetch(API_URLS.words, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to get words');
    }

    const data = await response.json();
    return data.words;
  }

  async addWords(words: string[]): Promise<{ 
    words: Word[]; 
    count: number; 
    message?: string; 
    duplicates?: string[];
    corrections?: Array<{ original: string; corrected: string }>;
  }> {
    const response = await fetch(API_URLS.words, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ words }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to add words');
    }

    return await response.json();
  }



  async updateWordStatus(wordId: number, status: 'learning' | 'done'): Promise<void> {
    const response = await fetch(API_URLS.words, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ word_id: wordId, status }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to update word status');
    }
  }

  async deleteWord(wordId: number): Promise<void> {
    const response = await fetch(`${API_URLS.words}?word_id=${wordId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to delete word');
    }
  }

  async getExercises(category?: string, difficulty?: string): Promise<{ exercises: Exercise[]; difficulty: string; exercises_remaining: number }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    
    const url = `${API_URLS.exercises}${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to get exercises');
    }

    return await response.json();
  }

  async submitAnswers(
    answers: Array<{ word_id: number; answer: string; type: string; correct_answer?: string }>,
    difficulty: string,
    timeSpent: number
  ): Promise<{ results: ExerciseResult[]; correct_count: number; total_count: number; total_points: number; current_streak: number; exercises_remaining: number }> {
    const response = await fetch(API_URLS.exercises, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ answers, difficulty, time_spent: timeSpent }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to submit answers');
    }

    return await response.json();
  }

  async getStats(): Promise<Stats> {
    const response = await fetch(API_URLS.stats, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to get stats');
    }

    return await response.json();
  }

  async categorizeWords(): Promise<{ updated: number; message: string }> {
    const response = await fetch('https://functions.poehali.dev/e04e5f5d-cc07-4dd2-b55e-690bf8775c20', {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to categorize words');
    }

    return await response.json();
  }

  async telegramBotAuth(code: string): Promise<{ user: User; token: string }> {
    const response = await fetch(API_URLS.telegramBotAuth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Telegram authentication failed');
    }

    const data = await response.json();
    this.setAuth(data.user.id, data.token);
    return data;
  }

  async completeProfile(
    userId: number,
    data: { name: string; email: string; phone: string; preferences: string[] }
  ): Promise<{ user: User }> {
    const response = await fetch(API_URLS.completeProfile, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        user_id: userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferences: data.preferences
      }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to complete profile');
    }

    return await response.json();
  }

  async linkTelegram(userId: number, code: string): Promise<{ user: User }> {
    const response = await fetch(API_URLS.telegramLink, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        user_id: userId,
        code
      }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to link Telegram');
    }

    return await response.json();
  }

  async getExerciseCategories(): Promise<{ categories: ExerciseCategory[]; total_categories: number }> {
    const response = await fetch(API_URLS.exerciseCategories, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to get categories');
    }

    return await response.json();
  }

  async updateSettings(userId: number, data: { exercise_difficulty?: string; preferences?: string[] }): Promise<{ user: { id: number; exercise_difficulty: string; preferences: string[] } }> {
    const response = await fetch(API_URLS.settings, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ user_id: userId, ...data }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to update settings');
    }

    return await response.json();
  }

  async enrichWord(wordId: number): Promise<Word> {
    const response = await fetch(API_URLS.enrichWords, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ word_id: wordId }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to enrich word');
    }

    const data = await response.json();
    return data.word;
  }

  async getWordsNeedingEnrichment(): Promise<{ words: Array<{ id: number; english_word: string }>; count: number }> {
    const response = await fetch(API_URLS.enrichWords, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to get words needing enrichment');
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient();