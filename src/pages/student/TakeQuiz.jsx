import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const TakeQuiz = () => {
  const { typeId } = useParams();
  const { user, triggerRefresh } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [typeInfo, setTypeInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading(true);
      try {
        // 1. Check if student already attempted this quiz
        const attemptsRes = await api.get('/attempts');
        const attempts = attemptsRes.data;

        const existingAttempt = attempts.find(a =>
          String(a.type_id) === String(typeId)
        );

        if (existingAttempt) {
          // ▶ Already attempted – fetch review data and show it immediately
          const reviewRes = await api.get(`/attempts/${existingAttempt.id}`);
          const { attempt, questions: reviewQuestions } = reviewRes.data;

          // Build answers map from stored answers
          const storedAnswers = {};
          reviewQuestions.forEach(q => {
            if (q.student_answer) storedAnswers[q.id] = q.student_answer;
          });

          setTypeInfo({ name: attempt.quiz_name });
          setQuestions(reviewQuestions);
          setAnswers(storedAnswers);
          setScore(attempt.score);
          setSubmitted(true);   // activates review screen
          setLoading(false);
          return;
        }

        // 2. First attempt – load quiz normally
        const [typeRes, questionsRes] = await Promise.all([
          api.get(`/question-types/${typeId}`),
          api.get(`/questions?type_id=${typeId}`)
        ]);

        if (!questionsRes.data || questionsRes.data.length === 0) {
          setError('This quiz has no questions yet.');
          setLoading(false);
          return;
        }

        setTypeInfo(typeRes.data);
        setQuestions(questionsRes.data);
        if (typeRes.data.total_time) {
          setTimeLeft(typeRes.data.total_time);
        }
        setStartTime(Date.now());
      } catch (err) {
        console.error('Failed to load quiz:', err);
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [typeId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || submitted || loading) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitted, loading]);

  const handleAutoSubmit = () => {
    if (!submitted) handleSubmit();
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    clearTimeout(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);   // show review screen immediately

    // Save attempt in background – do NOT navigate away
    try {
      await api.post('/attempts', {
        type_id: typeId,
        score: correct,
        total_questions: questions.length,
        time_taken: timeTaken,
        answers: answers
      });
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Failed to save attempt', err);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return 'No time limit';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ========== LOADING ==========
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading quiz...</div>;
  }

  // ========== ERROR ==========
  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  // ========== NO QUESTIONS ==========
  if (questions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No questions available for this quiz.</h2>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  // ========== REVIEW MODE (after submission or for re‑attempt) ==========
  if (submitted) {
    return (
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
        <div style={{ background: '#f0f4ff', borderRadius: '20px', padding: '30px', marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ color: '#1e3c72' }}>Quiz Completed!</h1>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2a5298', margin: '20px 0' }}>
            {score} / {questions.length}
          </div>
          <p style={{ fontSize: '18px', color: '#4b5563' }}>
            {score === questions.length ? '🎉 Perfect score! Excellent work!' :
             score >= questions.length / 2 ? '👍 Good job! Keep practicing.' :
             '💪 Keep practicing! You can do better next time.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '20px',
              padding: '12px 30px',
              background: '#2a5298',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>

        <h2 style={{ color: '#1e3c72', marginBottom: '20px' }}>Review Your Answers</h2>
        {questions.map((q, idx) => {
          const studentAnswer = answers[q.id];
          const isCorrect = studentAnswer === q.correct_answer;
          const isAnswered = studentAnswer !== null && studentAnswer !== undefined;

          return (
            <div key={q.id} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #eef2f6'
            }}>
              <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '15px' }}>
                {idx + 1}. {q.question}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const isCorrectOption = q.correct_answer === opt;
                  const isStudentChoice = studentAnswer === opt;

                  let background = '#f9fafb';
                  if (isStudentChoice && isCorrect) background = '#d1fae5';
                  else if (isStudentChoice && !isCorrect) background = '#fee2e2';
                  else if (isCorrectOption) background = '#d1fae5';

                  return (
                    <div
                      key={opt}
                      style={{
                        padding: '12px',
                        background,
                        borderRadius: '10px',
                        border: isStudentChoice ? '2px solid #2a5298' : '1px solid #e5e7eb'
                      }}
                    >
                      <strong>{opt}:</strong> {q[`option${opt}`]}
                      {isCorrectOption && <span style={{ marginLeft: '8px', color: '#059669' }}>✓</span>}
                      {isStudentChoice && !isCorrect && <span style={{ marginLeft: '8px', color: '#dc2626' }}>✗ (Your answer)</span>}
                    </div>
                  );
                })}
              </div>
              {!isAnswered && <p style={{ color: '#6b7280', fontStyle: 'italic' }}>You did not answer this question.</p>}
              {q.explanation && (
                <div style={{ background: '#f0f4ff', padding: '12px', borderRadius: '10px', fontSize: '14px' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ========== QUIZ IN PROGRESS ==========
  const currentQ = questions[currentIndex];

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #eef2f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e3c72' }}>{typeInfo?.name}</h2>
          <p style={{ margin: '5px 0 0', color: '#6b7280' }}>
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div style={{
          background: timeLeft < 60 ? '#fee2e2' : '#e8f0fe',
          padding: '12px 20px',
          borderRadius: '30px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: timeLeft < 60 ? '#dc2626' : '#1e3c72'
        }}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #eef2f6',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#1e3c72', fontSize: '20px' }}>
          {currentQ.question}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {['A', 'B', 'C', 'D'].map(opt => (
            <label key={opt} style={{
              padding: '15px',
              background: answers[currentQ.id] === opt ? '#e8f0fe' : '#f9fafb',
              border: answers[currentQ.id] === opt ? '2px solid #2a5298' : '1px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name={`q${currentQ.id}`}
                value={opt}
                checked={answers[currentQ.id] === opt}
                onChange={() => handleAnswer(currentQ.id, opt)}
                style={{ marginRight: '10px' }}
              />
              <strong>{opt}:</strong> {currentQ[`option${opt}`]}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{
            padding: '12px 24px',
            background: currentIndex === 0 ? '#e5e7eb' : '#e2e8f0',
            color: currentIndex === 0 ? '#9ca3af' : '#1e3c72',
            border: 'none',
            borderRadius: '30px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          ← Previous
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            style={{
              padding: '12px 30px',
              background: '#2a5298',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            style={{
              padding: '12px 30px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
