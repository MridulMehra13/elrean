import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const defaultQuestionTypes = [
  { label: 'MCQ', value: 'mcq' },
  { label: 'Fill in the Blank', value: 'fill-in-the-blank' },
  { label: 'Descriptive', value: 'descriptive' },
];

const SmartQuestionGenerator = () => {
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setQuestions([]);
    try {
      const res = await axios.post(
        'http://localhost:5001/api/question-generator/generate',
        { course_content: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(
        res.data.questions.map((q) => ({
          ...q,
          type: q.type || 'fill-in-the-blank',
          options: q.options || ['', '', '', ''],
          answer: q.answer || '',
          approved: true,
        }))
      );
    } catch (err) {
      setError('Failed to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      )
    );
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === optIdx ? value : opt
              ),
            }
          : q
      )
    );
  };

  const handleApproveToggle = (idx) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, approved: !q.approved } : q))
    );
  };

  const handleAddToQuiz = async () => {
    // Filter only approved questions, send to backend for quiz creation
    const approvedQuestions = questions.filter((q) => q.approved);
    if (approvedQuestions.length === 0) return alert('No questions selected!');
    try {
      await axios.post(
        'http://localhost:5000/api/quiz/create',
        {
          title: 'Auto Generated Quiz',
          description: 'Quiz generated via Smart Question Generator',
          questions: approvedQuestions.map((q) => ({
            question: q.question,
            options: q.type === 'mcq' ? q.options : [],
            correctAnswer: q.answer,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Quiz created successfully!');
      setQuestions([]);
      setContent('');
    } catch (err) {
      console.error('Error creating quiz:', err.response || err.message);
      alert('Failed to create quiz: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Smart Question Generator</h2>
      <textarea
        className="w-full p-3 rounded border mb-4 text-gray-900"
        rows={6}
        placeholder="Paste course content or enter a topic..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded mb-6"
        onClick={handleGenerate}
        disabled={loading || !content.trim()}
      >
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {questions.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Review & Edit Questions</h3>
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-white rounded shadow border-l-4 border-blue-500 flex flex-col gap-3 mb-4">
                <div className="flex items-center mb-2 gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${q.type === 'mcq' ? 'bg-blue-600' : q.type === 'fill-in-the-blank' ? 'bg-yellow-600' : 'bg-green-600'}`}>{q.type.toUpperCase()}</span>
                  <input
                    type="checkbox"
                    checked={q.approved}
                    onChange={() => handleApproveToggle(idx)}
                    className="mr-2"
                  />
                  <select
                    value={q.type}
                    onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                    className="mr-2 p-1 rounded border"
                  >
                    {defaultQuestionTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    className="flex-1 p-2 rounded border font-bold text-gray-900 dark:text-white bg-blue-50 dark:bg-gray-800 shadow-inner"
                    value={q.question}
                    onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                  />
                </div>
                {q.type === 'mcq' && (
                  <div className="mb-2">
                    <div className="font-medium mb-1">Options:</div>
                    {q.options.map((opt, optIdx) => (
                <input
                  key={optIdx}
                  className="block w-full p-2 rounded border border-gray-400 mb-2 text-gray-900 dark:text-gray-900 bg-white"
                  value={opt}
                  placeholder={`Option ${optIdx + 1}`}
                  onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                />
                    ))}
                  </div>
                )}
              <div className="mb-2">
                <span className="font-medium">Answer: </span>
                <input
                  className="p-2 rounded border border-gray-400 text-gray-900 dark:text-gray-900 bg-white"
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                />
              </div>
              </div>
            ))}
          </div>
          <button
            className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
            onClick={handleAddToQuiz}
          >
            Add Approved Questions to Quiz
          </button>
        </>
      )}
    </div>
  );
};

export default SmartQuestionGenerator;
