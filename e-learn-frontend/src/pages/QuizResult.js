import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="text-center mt-10">
        <p className="text-xl text-red-500">No result data found.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Handle detailed attempt data format
  const questions = result.quiz?.questions || [];
  const userAnswers = result.answers || [];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Quiz Results</h1>
      
      <div className="mb-6">
        <p className="text-lg text-gray-700 dark:text-gray-300">Score: <strong>{result.score}</strong></p>
        <p className="text-lg text-gray-700 dark:text-gray-300">XP Earned: <strong>{result.xpEarned}</strong></p>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded shadow">
            <p className="font-medium text-gray-800 dark:text-white">
              {index + 1}. {q.question}
            </p>
            <p className="text-sm mt-1 text-green-600">
              Correct Answer: {q.correctAnswer}
            </p>
            <p
              className={`text-sm mt-1 ${
                userAnswers[index] === q.correctAnswer ? 'text-blue-600' : 'text-red-500'
              }`}
            >
              Your Answer: {userAnswers[index] || 'No Answer'}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default QuizResult;
