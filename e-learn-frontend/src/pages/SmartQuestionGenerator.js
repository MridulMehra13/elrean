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
  const [source, setSource] = useState('ml'); // 'ml' or 'gemini'
  const { token } = useContext(AuthContext);

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please enter course content or a topic.');
      return;
    }
    setLoading(true);
    setError('');
    setQuestions([]);

    try {
      const endpoint =
        source === 'ml'
          ? 'http://localhost:5001/api/question-generator/generate'
          : 'http://localhost:5001/api/question-generator/generate-gemini';

      const res = await axios.post(
        endpoint,
        { course_content: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const generatedQuestions =
        source === 'gemini'
          ? (res.data.questions || []).map((q) => ({
              type: 'descriptive',
              question: q,
              options: [],
              answer: '',
              approved: true,
            }))
          : (res.data.questions || []).map((q) => ({
              ...q,
              type: q.type || 'fill-in-the-blank',
              options: q.options || ['', '', '', ''],
              answer: q.answer || '',
              approved: true,
            }));

      setQuestions(generatedQuestions);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, oi) => (oi === optIdx ? value : opt)),
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
    const approvedQuestions = questions.filter((q) => q.approved);
    if (approvedQuestions.length === 0) {
      alert('No questions selected! Please approve questions to add.');
      return;
    }

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
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Smart Question Generator</h1>
      <p className="text-gray-600 mb-4">
        Enter course content or a topic below to generate questions automatically.
      </p>

      <textarea
        className="w-full p-4 rounded-lg border border-gray-300 text-gray-800 bg-gray-50 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={6}
        placeholder="Paste course content or enter a topic..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
        >
          <option value="ml">Use ML Model (T5)</option>
          <option value="gemini">Use Gemini API</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={loading || !content.trim()}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition duration-200 ${
            loading || !content.trim()
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
        {error && <p className="text-red-600 font-medium">{error}</p>}
      </div>

      {questions.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Review & Edit Questions</h2>
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-5 bg-gray-50 rounded-lg border border-blue-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        q.type === 'mcq'
                          ? 'bg-blue-600'
                          : q.type === 'fill-in-the-blank'
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                    >
                      {q.type.toUpperCase()}
                    </span>
                    <label className="flex items-center gap-1 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={q.approved}
                        onChange={() => handleApproveToggle(idx)}
                      />
                      Approve
                    </label>
                  </div>
                  <select
                    value={q.type}
                    onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                    className="p-2 rounded border border-gray-300 bg-white text-sm"
                  >
                    {defaultQuestionTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="w-full p-3 rounded border border-gray-300 text-gray-800 bg-white"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                  rows={2}
                />

                {q.type === 'mcq' && (
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Options:</label>
                    {q.options.map((opt, optIdx) => (
                      <input
                        key={optIdx}
                        className="block w-full p-2 rounded border border-gray-300 mb-2 text-gray-800 bg-white"
                        value={opt}
                        placeholder={`Option ${optIdx + 1}`}
                        onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                      />
                    ))}
                  </div>
                )}

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Answer:</label>
                  <input
                    className="w-full p-2 rounded border border-gray-300 text-gray-800 bg-white"
                    value={q.answer}
                    onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            className="mt-6 w-full px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition duration-200"
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
