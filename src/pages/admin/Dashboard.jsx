import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    subjects: 0,
    questions: 0,
    questionTypes: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          studentsRes,
          subjectsRes,
          questionsRes,
          typesRes,
          paymentsRes,
        ] = await Promise.all([
          api.get('/students'),
          api.get('/subjects'),
          api.get('/questions'),
          api.get('/question-types'),
          api.get('/payments'),
        ]);

        const pending = Array.isArray(paymentsRes.data)
          ? paymentsRes.data.filter(p => p.status === 'pending').length
          : 0;

        setStats({
          students: studentsRes.data.length,
          subjects: subjectsRes.data.length,
          questions: questionsRes.data.length,
          questionTypes: typesRes.data.length,
          pendingPayments: pending,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardStyle = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    minWidth: '160px',
    flex: '1 1 160px',
    border: '1px solid #eaeaea',
  };

  const iconStyle = {
    fontSize: '32px',
    marginBottom: '12px',
  };

  const valueStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '8px 0 4px',
    color: '#1e1e2f',
  };

  const labelStyle = {
    color: '#666',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Dashboard</h2>
        <p>Loading stats...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Welcome back, <strong>{user?.username || 'Admin'}</strong>
      </p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <div style={iconStyle}>👥</div>
          <div style={labelStyle}>Total Students</div>
          <div style={valueStyle}>{stats.students}</div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>📚</div>
          <div style={labelStyle}>Subjects</div>
          <div style={valueStyle}>{stats.subjects}</div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>📋</div>
          <div style={labelStyle}>Quiz Types</div>
          <div style={valueStyle}>{stats.questionTypes}</div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>❓</div>
          <div style={labelStyle}>Total Questions</div>
          <div style={valueStyle}>{stats.questions}</div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>💳</div>
          <div style={labelStyle}>Pending Payments</div>
          <div style={{ ...valueStyle, color: stats.pendingPayments > 0 ? '#dc3545' : '#1e1e2f' }}>
            {stats.pendingPayments}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;