/**
 * Логика автоматического перехода слов в статус "выучено"
 * 
 * Слово считается выученным если:
 * 1. Количество правильных повторений >= 8
 * 2. Последнее повторение было не ранее чем вчера (показывает стабильность знания)
 * 3. Процент правильных ответов >= 80%
 * 
 * Эта система основана на принципе интервального повторения (spaced repetition)
 * и кривой забывания Эббингауза
 */

export interface WordProgress {
  recall_count: number;
  correct_count: number;
  last_recall_date: Date | null;
  created_at: Date;
}

export function shouldMarkAsLearned(progress: WordProgress): boolean {
  const MIN_RECALLS = 8;
  const MIN_SUCCESS_RATE = 0.8;
  const MIN_DAYS_LEARNING = 3;

  if (progress.recall_count < MIN_RECALLS) {
    return false;
  }

  const successRate = progress.correct_count / progress.recall_count;
  if (successRate < MIN_SUCCESS_RATE) {
    return false;
  }

  const daysSinceCreation = progress.created_at 
    ? Math.floor((Date.now() - progress.created_at.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
    
  if (daysSinceCreation < MIN_DAYS_LEARNING) {
    return false;
  }

  if (progress.last_recall_date) {
    const hoursSinceLastRecall = (Date.now() - progress.last_recall_date.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastRecall < 24) {
      return false;
    }
  }

  return true;
}

export function getProgressMessage(progress: WordProgress): string {
  const recall_count = progress.recall_count;
  const successRate = progress.correct_count / progress.recall_count;
  
  if (recall_count < 3) {
    return 'Начинаю изучать';
  } else if (recall_count < 5) {
    return 'Знакомлюсь со словом';
  } else if (recall_count < 8) {
    return successRate >= 0.7 ? 'Хорошо запоминаю' : 'Еще нужно повторить';
  } else if (shouldMarkAsLearned(progress)) {
    return 'Готово к переходу в "Выучено"!';
  } else {
    return 'Почти выучил';
  }
}

export function calculateNextReviewDate(recall_count: number): Date {
  const intervals = [0, 1, 3, 7, 14, 30, 60, 120];
  const dayOffset = intervals[Math.min(recall_count, intervals.length - 1)];
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + dayOffset);
  
  return nextDate;
}