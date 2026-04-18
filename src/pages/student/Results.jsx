import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Results = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const res = await api.get('/attempts');
      setAttempts(res.data);
    } catch (err) {
      console.error('Failed to fetch attempts', err);
    } finally {
      setLoading(false);
    }
  };

  const viewReview = async (attemptId) => {
    try {
      const res = await api.get(`/attempts/${attemptId}`);
      setSelectedAttempt(res.data.attempt);
      setReviewQuestions(res.data.questions);
    } catch (err) {
      alert('Failed to load review');
    }
  };

  const closeReview = () => {
    setSelectedAttempt(null);
    setReviewQuestions([]);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate statistics
  const overallAverage = attempts.length > 0
    ? (attempts.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / attempts.length).toFixed(1)
    : 0;

  // Group by subject and calculate average
  const subjectStats = {};
  attempts.forEach(a => {
    const subject = a.subject_name;
    if (!subjectStats[subject]) {
      subjectStats[subject] = { totalScore: 0, totalQuestions: 0, count: 0, grade: a.grade };
    }
    subjectStats[subject].totalScore += a.score;
    subjectStats[subject].totalQuestions += a.total_questions;
    subjectStats[subject].count++;
  });

  const subjectAverages = Object.entries(subjectStats).map(([subject, data]) => ({
    subject,
    grade: data.grade,
    average: ((data.totalScore / data.totalQuestions) * 100).toFixed(1),
    attempts: data.count
  }));

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ color: '#1e3c72', marginBottom: '30px' }}>📊 My Quiz Results</h1>

      {attempts.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>You haven't taken any quizzes yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: '20px', padding: '10px 24px', background: '#2a5298', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer' }}
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
            <div style={{ background: 'linear-gradient(145deg, #1e3c72, #2a5298)', borderRadius: '20px', padding: '24px', flex: 1, minWidth: '200px', color: '#fff', boxShadow: '0 8px 20px rgba(30,60,114,0.2)' }}>
              <h3 style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>Overall Average</h3>
              <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '10px 0 0' }}>{overallAverage}%</p>
              <p style={{ margin: '5px 0 0', opacity: 0.8 }}>{attempts.length} quizzes taken</p>
            </div>
            {subjectAverages.map(item => (
              <div key={item.subject} style={{ background: '#fff', borderRadius: '20px', padding: '24px', flex: 1, minWidth: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#1e3c72' }}>{item.subject}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '5px 0' }}>Grade {item.grade}</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#2a5298', margin: '10px 0 0' }}>{item.average}%</p>
                <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: '13px' }}>{item.attempts} attempt(s)</p>
              </div>
            ))}
          </div>

          {/* Attempts Table */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#1e3c72', marginBottom: '20px' }}>All Attempts</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4b5563' }}>Quiz</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4b5563' }}>Subject</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4b5563' }}>Grade</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4b5563' }}>Score</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4b5563' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4b5563' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4b5563' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>{a.quiz_name}</td>
                    <td style={{ padding: '12px' }}>{a.subject_name}</td>
                    <td style={{ padding: '12px' }}>{a.grade}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: a.score === a.total_questions ? '#059669' : '#1e3c72' }}>
                      {a.score} / {a.total_questions} ({(a.score / a.total_questions * 100).toFixed(0)}%)
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{formatTime(a.time_taken)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{formatDate(a.created_at)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => viewReview(a.id)}
                        style={{ padding: '6px 14px', background: '#e8f0fe', color: '#2a5298', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Review Modal (unchanged) */}
      {selectedAttempt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '800px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1e3c72' }}>Review: {selectedAttempt.quiz_name}</h2>
              <button onClick={closeReview} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ marginBottom: '20px' }}>
              Score: <strong>{selectedAttempt.score} / {selectedAttempt.total_questions}</strong> | Time: {formatTime(selectedAttempt.time_taken)}
            </p>
            {reviewQuestions.map((q, idx) => (
              <div key={q.id} style={{ marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
                <p><strong>Q{idx+1}: {q.question}</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0' }}>
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const isCorrect = q.correct_answer === opt;
                    return (
                      <div key={opt} style={{ padding: '8px', background: isCorrect ? '#d1fae5' : 'transparent', borderRadius: '6px' }}>
                        {opt}: {q[`option${opt}`]} {isCorrect && '✓'}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && <p style={{ fontSize: '14px', color: '#4b5563' }}><em>Explanation: {q.explanation}</em></p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;