import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Results = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get('/attempts');
        setAttempts(res.data);
      } catch (err) {
        console.error('Failed to fetch attempts');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const handleReview = async (attemptId) => {
    try {
      const res = await api.get(`/attempts/${attemptId}`);
      setReviewAttempt(res.data.attempt);
      setReviewQuestions(res.data.questions);
    } catch (err) {
      alert('Failed to load review');
    }
  };

  const closeReview = () => {
    setReviewAttempt(null);
    setReviewQuestions([]);
  };

  // ✅ Back to Dashboard button component
  const BackButton = () => (
    <button
      onClick={() => navigate('/dashboard')}
      style={{
        background: 'transparent',
        border: '1px solid #e5e7eb',
        padding: '8px 16px',
        borderRadius: '30px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '20px',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f3f4f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      ← Back to Dashboard
    </button>
  );

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <BackButton />
        <div style={{ textAlign: 'center', color: '#666' }}>Loading your results...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', background: '#f8faff', minHeight: '100vh', padding: '24px 32px' }}>
      <BackButton />
      
      <h1 style={{ color: '#1e3c72', marginBottom: '24px' }}>My Quiz Results</h1>

      {attempts.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h3 style={{ color: '#1e3c72', marginBottom: '8px' }}>No quiz attempts yet</h3>
          <p>Once you complete quizzes, your results will appear here.</p>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6b7280', fontSize: '14px' }}>Quiz Name</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6b7280', fontSize: '14px' }}>Score</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6b7280', fontSize: '14px' }}>Percentage</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6b7280', fontSize: '14px' }}>Date</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6b7280', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map(attempt => (
                <tr key={attempt.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 8px', color: '#1e3c72', fontWeight: '500' }}>{attempt.quiz_name}</td>
                  <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                    {attempt.score} / {attempt.total_questions}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '600', color: '#2a5298' }}>
                    {Math.round((attempt.score / attempt.total_questions) * 100)}%
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 8px', color: '#6b7280', fontSize: '13px' }}>
                    {new Date(attempt.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <button
                      onClick={() => handleReview(attempt.id)}
                      style={{
                        padding: '6px 16px',
                        background: '#e8f0fe',
                        border: 'none',
                        borderRadius: '20px',
                        color: '#2a5298',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      📋 Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal (same as in dashboard) */}
      {reviewAttempt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1e3c72' }}>Review: {reviewAttempt.quiz_name}</h2>
              <button onClick={closeReview} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ marginBottom: '20px' }}>
              Score: <strong>{reviewAttempt.score} / {reviewAttempt.total_questions}</strong>
            </p>
            {reviewQuestions.map((q, idx) => {
  const studentAnswer = q.student_answer;
  const isCorrect = studentAnswer === q.correct_answer;
  const isAnswered = studentAnswer !== null && studentAnswer !== undefined;

  return (
    <div key={q.id} style={{ marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
      <p><strong>Q{idx + 1}: {q.question}</strong></p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0' }}>
        {['A', 'B', 'C', 'D'].map(opt => {
          const isCorrectOption = q.correct_answer === opt;
          const isStudentChoice = studentAnswer === opt;

          let background = 'transparent';
          if (isStudentChoice && isCorrect) background = '#d1fae5'; // green – correct
          else if (isStudentChoice && !isCorrect) background = '#fee2e2'; // red – wrong
          else if (isCorrectOption) background = '#d1fae5'; // show correct answer

          return (
            <div
              key={opt}
              style={{
                padding: '8px',
                background,
                borderRadius: '6px',
                border: isStudentChoice ? '2px solid #2a5298' : '1px solid transparent'
              }}
            >
              {opt}: {q[`option${opt}`]}
              {isCorrectOption && <span style={{ marginLeft: '8px', color: '#059669' }}>✓</span>}
              {isStudentChoice && !isCorrect && <span style={{ marginLeft: '8px', color: '#dc2626' }}>✗ (Your answer)</span>}
            </div>
          );
        })}
      </div>
      {!isAnswered && <p style={{ color: '#6b7280', fontStyle: 'italic' }}>You did not answer this question.</p>}
      {q.explanation && <p style={{ marginTop: '8px', fontSize: '14px', color: '#4b5563' }}><em>Explanation: {q.explanation}</em></p>}
    </div>
  );
})}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
