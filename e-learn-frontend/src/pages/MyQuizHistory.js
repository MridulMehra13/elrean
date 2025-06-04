import React, { useEffect, useState, useContext } from 'react';
import axios from '../services/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyQuizHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await axios.get('/quiz/attempts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttempts(res.data);
      } catch (err) {
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, [token]);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">My Quiz History</h2>
      {attempts.length === 0 ? (
        <p className="text-gray-500">No quiz attempts yet.</p>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div key={attempt._id} className="p-4 bg-white dark:bg-gray-700 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">{attempt.quiz?.title || 'Quiz'}</div>
                <div className="text-gray-500 text-sm">Attempted: {new Date(attempt.attemptedAt).toLocaleString()}</div>
                <div className="text-gray-600 text-sm">Score: {attempt.score}/{attempt.total} | XP: {attempt.xpEarned}</div>
              </div>
              <button
                className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                onClick={() => navigate(`/quiz/result`, { state: { result: attempt } })}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQuizHistory;
