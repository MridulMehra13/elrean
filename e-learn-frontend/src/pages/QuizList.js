// e-learn-frontend/src/pages/QuizList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // adjust as per your auth logic

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        console.log('Token:', token);
        const res = await axios.get('/quiz/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuizzes(res.data);
        console.log('Fetched quizzes:', res.data);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
      }
    };

    fetchQuizzes();
  }, [token]);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.length === 0 ? (
          <p className="col-span-2 text-gray-400">No quizzes available at the moment.</p>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-gray-800 p-4 rounded shadow-md hover:bg-gray-700 transition"
            >
              <h3 className="text-xl font-semibold">{quiz.title}</h3>
              <p className="text-gray-300">Topic: {quiz.topic}</p>
              <p className="text-gray-400">Questions: {quiz.questions.length}</p>
              <button
                onClick={() => {
                  console.log('Navigating to quiz attempt with ID:', quiz._id);
                  navigate(`/quiz/attempt/${quiz._id}`);
                }}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
              >
                Attempt Quiz
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizList;
