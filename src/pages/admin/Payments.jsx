import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState({});

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
    const reason = status === 'rejected' ? rejectReason[id] : null;
    try {
      await api.put(`/payments/${id}`, { status, reason });
      setRejectReason(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      fetchPayments();
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

  return (
    <div>
      <h2>Payment Approvals</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Receipt</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No payments yet.</td></tr>
            ) : (
              payments.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.username}</td>
                  <td>{p.amount} Birr</td>
                  <td>
                    <a
                      href={`http://127.0.0.1:5000/uploads/${p.receipt_image}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2a5298', textDecoration: 'underline' }}
                    >
                      View Receipt
                    </a>
                  </td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                  <td>
                    {p.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleStatusChange(p.id, 'approved')}
                          style={{ padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(p.id, 'rejected')}
                          style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                        <input
                          type="text"
                          placeholder="Reason (optional)"
                          value={rejectReason[p.id] || ''}
                          onChange={(e) => setRejectReason({ ...rejectReason, [p.id]: e.target.value })}
                          style={{ width: '120px', padding: '4px' }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Payments;