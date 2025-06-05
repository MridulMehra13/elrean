import axios from 'axios';

export async function generateQuestions(query: string) {
  try {
    const response = await axios.post(
      'http://localhost:5001/api/question-generator/generate',
      { course_content: query }
    );
    const questions = response.data.questions || [];
    return questions;
  } catch (error) {
    console.error('Error while generating questions:', error);
    return [];
  }
}
