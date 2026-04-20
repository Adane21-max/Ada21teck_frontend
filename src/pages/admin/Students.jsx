import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/with-quiz-types');
      setStudents(res.data);
    } catch (err) {
      alert('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/students/${id}/status`, { status: newStatus });
      fetchStudents();
    } catch (err) {
      alert('Failed to update status');
    }
  };
const handleDelete = async (id, username) => {
  if (window.confirm(`Permanently delete ${username} and all their data? This cannot be undone.`)) {
    try {
      await api.delete(`/students/${id}`);
      fetchAllStudents(); // refresh the list
    } catch (err) {
      alert('Failed to delete student');
    }
  }
};
  const getStatusBadge = (status) => {
    const colors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545'
    };
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Suspended'
    };
    return (
      <span style={{
        backgroundColor: colors[status],
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {labels[status] || status.toUpperCase()}
      </span>
    );
  };

  // Count students per grade
  const gradeCounts = {};
  for (let g = 6; g <= 12; g++) gradeCounts[g] = 0;
  students.forEach(s => { if (gradeCounts[s.grade] !== undefined) gradeCounts[s.grade]++; });

  const filteredStudents = selectedGrade
    ? students.filter(s => s.grade === selectedGrade)
    : [];

  return (
    <div>
      <h2>Students Management</h2>

      {/* Grade Summary Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '30px' }}>
        {[6,7,8,9,10,11,12].map(grade => (
          <div
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            style={{
              background: selectedGrade === grade ? '#2a5298' : '#ffffff',
              borderRadius: '16px',
              padding: '20px 28px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: '100px',
              border: selectedGrade === grade ? '2px solid #1e3c72' : '1px solid #e2e8f0',
              transition: 'all 0.1s',
              color: selectedGrade === grade ? '#fff' : '#1e3c72'
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Grade {grade}</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {gradeCounts[grade] || 0}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.8 }}>students</p>
          </div>
        ))}
        {selectedGrade && (
          <button
            onClick={() => setSelectedGrade(null)}
            style={{
              padding: '8px 20px',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '500',
              alignSelf: 'center'
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Students Table */}
      {selectedGrade ? (
        <>
          <h3 style={{ marginBottom: '16px', color: '#1e3c72' }}>
            Grade {selectedGrade} Students ({filteredStudents.length})
          </h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Quiz Types Taken</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>No students in this grade.</td></tr>
                ) : (
                  filteredStudents.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.username}</td>
                      <td>{getStatusBadge(s.status)}</td>
                      <td style={{ textAlign: 'center' }}>{s.quiz_types_taken || 0}</td>
                      <td>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(s.id, e.target.value)}
                          style={{ padding: '4px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Suspended</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Select a grade card above to view students.
        </div>
      )}
    </div>
  );
};

export default Students;
