import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ NEW
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const FreeTrialQuiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ NEW
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch free trial questions for the student's registered grade ONLY
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user?.grade) return;
      try {
        const res = await api.get(`/free-trial?grade=${user.grade}`);
        setQuestions(res.data);
      } catch (err) {
        console.error('Failed to fetch free trial questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [user]);

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  // ✅ Back button component (reused)
  const BackButton = () => (
    <button
      onClick={() => navigate('/dashboard')}
      style={{
        background: 'transparent',
        border: '1px solid #e5e7eb',
        padding: '8px 16px',
        borderRadius: '30px',
        fontSize: '14px',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        marginBottom: '20px',
      }}
    >
      ← Back to Dashboard
    </button>
  );

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <BackButton />
        <div>Loading free trial questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <BackButton />
        <h2>Free Trial Quiz (Grade {user?.grade})</h2>
        <p>No free trial questions available for your grade yet.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ padding: '20px' }}>
        <BackButton />
        <h2>Quiz Results</h2>
        <p>Score: {score} / {questions.length}</p>
        {questions.map((q, idx) => (
          <div key={q.id} style={{ border: '1px solid #ddd', margin: '15px 0', padding: '15px' }}>
            <p><strong>Q{idx + 1}: {q.question}</strong></p>
            <p>Your answer: {answers[q.id] || 'Not answered'}</p>
            <p style={{ color: answers[q.id] === q.correct_answer ? 'green' : 'red' }}>
              Correct answer: {q.correct_answer}
            </p>
            <p><em>Explanation: {q.explanation}</em></p>
          </div>
        ))}
        <button onClick={() => window.location.reload()}>Try Another</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div style={{ padding: '20px' }}>
      <BackButton />
      <h2>Free Trial Quiz (Grade {user?.grade})</h2>
      <h3>Question {currentIndex + 1} of {questions.length}</h3>
      <p><strong>{currentQ.question}</strong></p>
      <div>
        {['A', 'B', 'C', 'D'].map(opt => (
          <label key={opt} style={{ display: 'block', margin: '10px 0' }}>
            <input
              type="radio"
              name={`q${currentQ.id}`}
              value={opt}
              checked={answers[currentQ.id] === opt}
              onChange={() => handleAnswer(currentQ.id, opt)}
            />
            {opt}: {currentQ[`option${opt}`]}
          </label>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        {currentIndex > 0 && (
          <button onClick={() => setCurrentIndex(currentIndex - 1)}>Previous</button>
        )}
        {currentIndex < questions.length - 1 ? (
          <button onClick={() => setCurrentIndex(currentIndex + 1)}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Submit Quiz</button>
        )}
      </div>
    </div>
  );
};

export default FreeTrialQuiz;