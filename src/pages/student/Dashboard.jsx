import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const StudentDashboard = () => {
  const { user, logout, refreshKey } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [quizTypes, setQuizTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalLevel, setGlobalLevel] = useState(1);               // student's current global level
  const [hasGlobalPending, setHasGlobalPending] = useState(false); // whether a global upgrade request is pending

  useEffect(() => {
    const fetchData = async () => {
      try {
              const [annRes, subjectsRes, typesRes, attemptsRes, leaderRes, levelRes, pendingRes] = await Promise.all([
          api.get('/announcements'),
          api.get('/subjects'),
          api.get(`/question-types/visible?grade=${user?.grade}`),
          api.get('/attempts'),
          api.get(`/students/leaderboard?grade=${user?.grade}`),
          api.get('/students/current-level'),
          api.get('/upgrades/pending')
        ]);
        setAnnouncements(annRes.data);
        setSubjects(subjectsRes.data);
        setQuizTypes(typesRes.data);
        setAttempts(attemptsRes.data);
        setLeaderboard(leaderRes.data);
        setGlobalLevel(levelRes.data.level);
        setHasGlobalPending(pendingRes.data.pending);
        console.log('Attempts received:', attemptsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.grade) fetchData();
  }, [user, refreshKey]);

  const handleTakeQuizClick = () => {
    if (user?.status !== 'approved') {
      setShowPayment(true);
    } else {
      document.getElementById('quizzes-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payerName.trim() || !transactionRef.trim()) {
      setUploadMsg('Please fill in both fields.');
      return;
    }
    try {
      await api.post('/payments/submit', {
        payer_name: payerName.trim(),
        transaction_ref: transactionRef.trim()
      });
      setUploadMsg('Payment info submitted! Awaiting admin approval.');
      setPayerName('');
      setTransactionRef('');
      setTimeout(() => setShowPayment(false), 2000);
    } catch (err) {
      setUploadMsg(err.response?.data?.message || 'Submission failed. Try again.');
    }
  };

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const gradeSubjects = subjects.filter(s => s.grade === user?.grade);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', background: '#f8faff', minHeight: '100vh', padding: '24px 32px' }}>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        background: '#ffffff',
        padding: '20px 28px',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        border: '1px solid #eef2f6'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#1e3c72', fontWeight: '700' }}>
            Welcome back, {user?.username}!
          </h1>
          <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
            <span style={{
              background: '#e8f0fe',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#2a5298'
            }}>
              Grade {user?.grade}
            </span>
            <span style={{
              background: user?.status === 'approved' ? '#d1fae5' : '#fef3c7',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              color: user?.status === 'approved' ? '#059669' : '#d97706'
            }}>
              {user?.status === 'approved' ? '✅ Approved' : '⏳ Pending Approval'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/results')}
            style={{
              background: '#e8f0fe',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#2a5298',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d0e0fc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#e8f0fe';
            }}
          >
            📊 My Results
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #e5e7eb',
              padding: '10px 20px',
              borderRadius: '40px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '300px' }}>
          {/* Free Trial Card */}
          <div style={{
            background: 'linear-gradient(145deg, #1e3c72 0%, #2a5298 100%)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '48px' }}>🎓</div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '600' }}>Free Trial Quiz</h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>Try sample questions — no approval needed!</p>
              </div>
            </div>
            <Link to="/free-trial">
              <button style={{
                padding: '12px 28px',
                background: '#fff',
                color: '#1e3c72',
                border: 'none',
                borderRadius: '30px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>Start Free Trial →</button>
            </Link>
          </div>

          {/* Take Quizzes Button */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => document.getElementById('quizzes-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: '#2a5298',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '30px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 8px rgba(42,82,152,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e3c72';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2a5298';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              📝 Take Quizzes
            </button>
          </div>
                     {/* Global Upgrade Box */}
          {user?.status === 'approved' && (() => {
            const levelQuizzes = quizTypes.filter(q => q.level === globalLevel);
            if (levelQuizzes.length === 0) return null;

            const attemptMap = {};
            attempts.forEach(a => { attemptMap[a.type_id] = a; });

            const allAttempted = levelQuizzes.every(q => attemptMap[q.id]);
            const totalAttempted = levelQuizzes.filter(q => attemptMap[q.id]).length;
            const remaining = levelQuizzes.length - totalAttempted;

            let overallAvg = 0;
            if (allAttempted) {
              let totalPercent = 0;
              levelQuizzes.forEach(q => {
                const att = attemptMap[q.id];
                totalPercent += (att.score / att.total_questions) * 100;
              });
              overallAvg = totalPercent / levelQuizzes.length;
            }

            // Eligible and no pending request
            if (allAttempted && overallAvg >= 70 && !hasGlobalPending) {
              return (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e3c72' }}>
                    🎉 You've completed all Level {globalLevel} quizzes with an average of {overallAvg.toFixed(1)}%!
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.post('/upgrades/request', {});
                        alert(res.data.message);
                        const refreshed = await api.get('/upgrades/pending');
                        setHasGlobalPending(refreshed.data.pending);
                      } catch (err) {
                        alert(err.response?.data?.message || 'Failed to request upgrade');
                      }
                    }}
                    style={{ padding: '10px 24px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}
                  >
                    🚀 Request Level {globalLevel + 1} Upgrade
                  </button>
                </div>
              );
            }

            // Pending request
            if (hasGlobalPending) {
              return (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
                  <p>⏳ Upgrade request pending for Level {globalLevel + 1}</p>
                </div>
              );
            }

            // All attempted but below threshold
            if (allAttempted && overallAvg < 70) {
              return (
                <div style={{ background: '#fee2e2', border: '1px solid #dc2626', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                  <p style={{ fontWeight: '600', color: '#1e3c72' }}>
                    Your overall average is {overallAvg.toFixed(1)}%. You need 70% to unlock Level {globalLevel + 1}.
                  </p>
                  <p style={{ color: '#4b5563' }}>
                    Retake option coming soon.
                  </p>
                </div>
              );
            }

            // Not all quizzes completed
            return (
              <div style={{ background: '#e8f0fe', border: '1px solid #2a5298', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <p>
                  📚 Complete all Level {globalLevel} quizzes to unlock Level {globalLevel + 1}. ({totalAttempted}/{levelQuizzes.length} completed)
                </p>
                {remaining > 0 && <p style={{ fontSize: '14px', color: '#4b5563' }}>{remaining} quiz{remaining > 1 ? 'zes' : ''} remaining.</p>}
              </div>
            );
          })()}
          {/* Subjects and Quizzes */}
          {user?.status === 'approved' && (
            <div id="quizzes-section" style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '28px' }}>📚</span>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#1e3c72', fontWeight: '600' }}>
                  Your Subjects — Grade {user.grade}
                </h2>
              </div>
              {gradeSubjects.length === 0 ? (
                <p style={{ color: '#6b7280', padding: '20px', background: '#f9fafb', borderRadius: '12px', textAlign: 'center' }}>
                  No subjects available for your grade.
                </p>
              ) : (
                gradeSubjects.map(subject => {
                  const subjectQuizzes = quizTypes.filter(q => q.subject_id === subject.id);
                  return (
                    <div key={subject.id} style={{ marginBottom: '28px' }}>
                      <h3 style={{
                        margin: '0 0 16px',
                        fontSize: '18px',
                        color: '#2a5298',
                        borderBottom: '1px solid #e5e7eb',
                        paddingBottom: '8px'
                      }}>
                        {subject.name}
                      </h3>

                      {/* Upgrade request logic */}
                      {(() => {
                        const currentLevel = myLevels[subject.id] || 1;
                        const currentLevelQuizzes = subjectQuizzes.filter(q => q.level === currentLevel);
                        if (currentLevelQuizzes.length === 0) return null;

                        const attemptMap = {};
                        attempts.forEach(a => { attemptMap[a.type_id] = a; });

                        const allAttempted = currentLevelQuizzes.every(q => attemptMap[q.id]);
                        if (!allAttempted) return null;

                        let totalPercent = 0;
                        currentLevelQuizzes.forEach(q => {
                          const att = attemptMap[q.id];
                          totalPercent += (att.score / att.total_questions) * 100;
                        });
                        const avg = totalPercent / currentLevelQuizzes.length;
                        if (avg < 70) return null;

                        if (pendingUpgrades.includes(subject.id)) {
                          return (
                            <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                              ⏳ Upgrade request pending
                            </p>
                          );
                        }

                        return (
                          <button
                            onClick={async () => {
                              try {
                                const res = await api.post('/upgrades/request', { subject_id: subject.id });
                                alert(res.data.message);
                                const refreshed = await api.get('/upgrades/pending');
                                setPendingUpgrades(refreshed.data);
                              } catch (err) {
                                alert(err.response?.data?.message || 'Failed to request upgrade');
                              }
                            }}
                            style={{
                              marginTop: '8px',
                              marginBottom: '12px',
                              padding: '6px 14px',
                              background: '#f59e0b',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            🚀 Request Level Upgrade
                          </button>
                        );
                      })()}

                      {subjectQuizzes.length === 0 ? (
                        <p style={{ color: '#6b7280', fontStyle: 'italic', padding: '8px 0' }}>No quizzes yet for this subject.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                          {subjectQuizzes.map(type => {
                            const existingAttempt = attempts.find(a => String(a.type_id) === String(type.id));
                            if (existingAttempt) {
                              return (
                                <div
                                  key={type.id}
                                  style={{
                                    background: 'linear-gradient(145deg, #fff 0%, #f8faff 100%)',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(42,82,152,0.1)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                                  <h4 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1e3c72' }}>{type.name}</h4>
                                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                                    Score: {existingAttempt.score}/{existingAttempt.total_questions} ({Math.round((existingAttempt.score / existingAttempt.total_questions) * 100)}%)
                                  </p>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleReview(existingAttempt.id); }}
                                    style={{
                                      marginTop: '12px',
                                      padding: '8px 16px',
                                      background: '#e8f0fe',
                                      border: 'none',
                                      borderRadius: '20px',
                                      color: '#2a5298',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      width: '100%'
                                    }}
                                  >
                                    📋 Review
                                  </button>
                                </div>
                              );
                            }
                            return (
                              <div
                                key={type.id}
                                onClick={() => navigate(`/take-quiz/${type.id}`)}
                                style={{
                                  background: 'linear-gradient(145deg, #fff 0%, #f8faff 100%)',
                                  border: '1px solid #e0e7ff',
                                  borderRadius: '16px',
                                  padding: '20px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'translateY(-4px)';
                                  e.currentTarget.style.boxShadow = '0 12px 20px rgba(42,82,152,0.1)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                                <h4 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1e3c72' }}>{type.name}</h4>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                                  {type.total_time ? `⏱️ ${Math.floor(type.total_time / 60)} min` : '🎯 No time limit'}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {user?.status !== 'approved' && (
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '40px 24px',
              textAlign: 'center',
              color: '#6b7280',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{ color: '#1e3c72', marginBottom: '8px' }}>Quizzes will appear here</h3>
              <p>Once your account is approved, you'll see all available quizzes for your grade.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          {user?.status !== 'approved' && (
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: '#1e3c72' }}>Full Access Quizzes</h3>
              <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>
                Unlock all subjects with a one‑time payment.
              </p>
              <button
                onClick={handleTakeQuizClick}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#ff6b6b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Unlock Quizzes
              </button>
            </div>
          )}

          {/* Leaderboard */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            border: '1px solid #eef2f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🏆</span>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e3c72', fontWeight: '600' }}>Top Performers — Grade {user?.grade}</h3>
            </div>
            {leaderboard.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No data yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '8px' }}>#</th>
                    <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Student</th>
                    <th style={{ textAlign: 'center', paddingBottom: '8px' }}>Subj</th>
                    <th style={{ textAlign: 'center', paddingBottom: '8px' }}>T</th>
                    <th style={{ textAlign: 'center', paddingBottom: '8px' }}>Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 0', fontWeight: '500' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 0' }}>{entry.username}</td>
                      <td style={{ textAlign: 'center', padding: '8px 0' }}>{entry.subject_count}</td>
                      <td style={{ textAlign: 'center', padding: '8px 0' }}>{entry.T}</td>
                      <td style={{ textAlign: 'center', padding: '8px 0', fontWeight: '600', color: '#2a5298' }}>{entry.Avg}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Announcements */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px' }}>📢</span>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#1e3c72', fontWeight: '600' }}>Announcements</h2>
            </div>
            {announcements.length === 0 ? (
              <p style={{ color: '#6b7280', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                No announcements yet.
              </p>
            ) : (
              announcements.slice(0, 3).map(a => (
                <div key={a.id} style={{
                  padding: '18px',
                  marginBottom: '12px',
                  background: '#f9fafb',
                  borderRadius: '16px',
                  borderLeft: '4px solid #2a5298'
                }}>
                  <h3 style={{ margin: '0 0 8px', color: '#1e3c72', fontSize: '16px' }}>{a.title}</h3>
                  <p style={{ margin: '0 0 8px', color: '#4b5563', fontSize: '14px' }}>{a.content}</p>
                  <small style={{ color: '#9ca3af' }}>{new Date(a.created_at).toLocaleDateString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Contact & Support */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        border: '1px solid #eef2f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px' }}>📞</span>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#1e3c72', fontWeight: '600' }}>Contact & Support</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📱</span>
            <span style={{ color: '#4b5563', fontSize: '14px' }}>Phone: 0936592186 (Adane F)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📧</span>
            <span style={{ color: '#4b5563', fontSize: '14px' }}>adaneferede6@gmail.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⏰</span>
            <span style={{ color: '#4b5563', fontSize: '14px' }}>Mon - Fri, 10:00 - 12:30 local time and Sat - Sun, 2:00 - 12:00 local time</span>
          </div>
        </div>
      </div>

      {/* Payment Modal - UPDATED */}
      {showPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', maxWidth: '480px', width: '90%' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1e3c72' }}>⏳ Pending Approval</h3>
            <p style={{ margin: '0 0 16px', color: '#4b5563' }}>
              Your account is not yet approved. To access full quizzes, please pay 1000 Birr via Telebirr:
            </p>
            <p style={{ background: '#f3f4f6', padding: '12px', borderRadius: '12px', fontWeight: '600', textAlign: 'center' }}>
              Telebirr: 0936592186 (Adane F)
            </p>
            <p style={{ margin: '16px 0 8px', fontSize: '14px', color: '#6b7280' }}>
              After payment, enter your full name as on Telebirr and Telebirr transaction reference below.
            </p>
            <form onSubmit={handlePaymentSubmit}>
              <input
                type="text"
                placeholder="Your Full Name (as on Telebirr)"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                required
                style={{ marginBottom: '12px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                type="text"
                placeholder="Transaction number / ID   Eg: DCP98AMS1Z"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                required
                style={{ marginBottom: '16px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <button type="submit" style={{
                width: '100%', padding: '12px', background: '#2a5298', color: '#fff',
                border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'
              }}>
                Submit Payment Info
              </button>
            </form>
            {uploadMsg && <p style={{ marginTop: '12px', color: uploadMsg.includes('failed') ? '#dc2626' : '#059669' }}>{uploadMsg}</p>}
            <button onClick={() => setShowPayment(false)} style={{
              marginTop: '16px', background: 'transparent', border: '1px solid #d1d5db',
              padding: '10px', width: '100%', borderRadius: '12px', cursor: 'pointer', color: '#6b7280'
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewAttempt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '800px',
            width: '90%', maxHeight: '80vh', overflow: 'auto'
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

                      let background = '#f9fafb';
                      if (isStudentChoice && isCorrect) background = '#d1fae5';
                      else if (isStudentChoice && !isCorrect) background = '#fee2e2';
                      else if (isCorrectOption) background = '#d1fae5';

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

export default StudentDashboard;
