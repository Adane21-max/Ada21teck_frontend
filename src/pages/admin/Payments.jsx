import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (err) {
      alert('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/payments/${id}`, { status });
      fetchPayments(); // refresh
    } catch (err) {
      alert('Failed to update payment');
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
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading payments...</div>;
  }

  return (
    <div>
      <h2>Payments Management</h2>

      {payments.length === 0 ? (
        <p>No payment records yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Grade</th>
              <th>Payer Name</th>
              <th>Transaction Ref</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.username}</td>
                <td>{p.grade}</td>
                <td>{p.payer_name}</td>
                <td>{p.transaction_ref}</td>
                <td>{getStatusBadge(p.status)}</td>
                <td>{new Date(p.created_at).toLocaleString()}</td>
                <td>
                  {p.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(p.id, 'approved')}
                        style={{ marginRight: '5px', background: '#28a745', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(p.id, 'rejected')}
                        style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {p.status !== 'pending' && (
                    <span style={{ color: '#6b7280' }}>Processed</span>
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

export default Payments;
