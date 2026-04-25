import { useState, useEffect } from 'react';
import api from '../../api/axios';

const UpgradeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/upgrades');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch upgrade requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this upgrade?')) return;
    try {
      await api.put(`/upgrades/${id}/approve`);
      fetchRequests();
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this upgrade?')) return;
    try {
      await api.put(`/upgrades/${id}/reject`);
      fetchRequests();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545'
    };
    return (
      <span style={{
        backgroundColor: colors[status],
        color: 'white',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Upgrade Requests</h2>

      {requests.length === 0 ? (
        <p>No upgrade requests yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Subject</th>
              <th>From Level</th>
              <th>To Level</th>
              <th>Avg Score</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.username}</td>
                <td>{req.subject_name}</td>
                <td>{req.from_level}</td>
                <td>{req.to_level}</td>
                <td>{req.average_score}%</td>
                <td>{getStatusBadge(req.status)}</td>
                <td>{new Date(req.created_at).toLocaleDateString()}</td>
                <td>
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(req.id)}
                        style={{ marginRight: '6px', background: '#28a745', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {req.status !== 'pending' && (
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UpgradeRequests;
