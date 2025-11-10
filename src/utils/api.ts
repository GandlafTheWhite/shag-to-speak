const API_URLS = {
  auth: 'https://functions.poehali.dev/ce741311-6fd7-45a8-9770-f5d6979da050',
  words: 'https://functions.poehali.dev/d87144a4-ac34-4dce-bdf8-449ebd85b759',
  exercises: 'https://functions.poehali.dev/dab10f03-8dd4-4dc3-af8d-0cb6fd69aeb7',
  stats: 'https://functions.poehali.dev/5e32e154-08b5-4bdf-b5dd-bc3de2075ce1'
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
}

export interface Exercise {
  word_id: number;
  type: 'translation' | 'multiple_choice';
  question: string;
  options?: string[];
  correct_answer: string;
}

export interface ExerciseResult {
  word_id: number;
  is_correct: boolean;
  correct_answer: string;
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
  };
  activity: {
    days_active: number;
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

  async addWords(words: string[]): Promise<{ words: Word[]; count: number }> {
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

  async getExercises(): Promise<{ exercises: Exercise[]; exercises_remaining: number }> {
    const response = await fetch(API_URLS.exercises, {
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
    answers: Array<{ word_id: number; answer: string }>
  ): Promise<{ results: ExerciseResult[]; score: number; total: number; exercises_remaining: number }> {
    const response = await fetch(API_URLS.exercises, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ answers }),
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
}

export const apiClient = new ApiClient();
