import { initializeQuestionsFromFile } from './initializeQuestions';

export async function loadQuestionsFromFile(): Promise<void> {
  try {
    // Fetch the questions.txt file
    const response = await fetch('/asset/questions.txt');
    if (!response.ok) {
      throw new Error('Failed to fetch questions.txt');
    }

    const questionsText = await response.text();
    initializeQuestionsFromFile(questionsText);
  } catch (error) {
    console.error('Error loading questions:', error);
    throw error;
  }
} 