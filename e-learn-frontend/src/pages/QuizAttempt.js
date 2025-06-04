import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { AuthContext } from '../context/AuthContext';

const QuizAttempt = () => {
  const { id } = useParams();
  const context = useContext(AuthContext);
  // Fallback to localStorage if context token is missing
  const token = context?.token || localStorage.getItem('token');
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Add error state

  useEffect(() => {
    if (!token) {
      setError("You must be logged in to attempt a quiz.");
      setLoading(false);
      return;
    }
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/quiz/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuiz(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load quiz. Please try again.");
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, token]);

  const handleChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!quiz) return;
      const answersArray = quiz.questions.map((_, index) => answers[index] || "");
      const res = await axios.post(
        `/quiz/${id}/submit`,
        { answers: answersArray },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const attemptId = res.data.attemptId;
      const attemptRes = await axios.get(`/quiz/attempt/${attemptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/quiz/result`, { state: { result: attemptRes.data } });
    } catch (err) {
      setError("Error submitting quiz. Please try again.");
    }
  };

  if (loading) return <div className="text-center mt-8 text-xl">Loading quiz...</div>;
  if (error) return <div className="text-center mt-8 text-xl text-red-500">{error}</div>;
  if (!quiz || !quiz.questions) {
    return <div className="text-center mt-8 text-xl text-red-500">Quiz not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{quiz.title}</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{quiz.description}</p>

      {quiz.questions.map((q, index) => {
        const qType = q.type || 'mcq';
        return (
          <div key={index} className="mb-6 p-4 bg-white dark:bg-gray-700 rounded shadow">
            <p className="mb-2 font-medium text-gray-800 dark:text-white">
              {index + 1}. {q.question}
            </p>
            {qType === 'mcq' ? (
              <div className="space-y-2">
                {q.options && q.options.map((option, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={answers[index] === option}
                      onChange={() => handleChange(index, option)}
                      className="form-radio text-blue-600"
                    />
                    <span className="text-gray-700 dark:text-gray-200">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Your answer"
                value={answers[index] || ''}
                onChange={(e) => handleChange(index, e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded border dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            )}
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizAttempt;