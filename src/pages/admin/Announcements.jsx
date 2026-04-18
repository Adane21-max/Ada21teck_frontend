import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', expires_at: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchAnnouncements = async () => {
    const res = await api.get('/announcements');
    setAnnouncements(res.data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, form);
      } else {
        await api.post('/announcements', form);
      }
      setForm({ title: '', content: '', expires_at: '' });
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      alert('Error saving announcement');
    }
  };

  const handleEdit = (a) => {
    setForm({
      title: a.title,
      content: a.content,
      expires_at: a.expires_at || ''
    });
    setEditingId(a.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    }
  };

  return (
    <div>
      <h2>Announcements</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          placeholder="Expires (optional)"
          value={form.expires_at}
          onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
        />
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', content: '', expires_at: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Title</th>
            <th>Content</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.content}</td>
              <td>
                {a.expires_at
                  ? new Date(a.expires_at).toLocaleString()
                  : 'Never'}
              </td>
              <td>
                <button onClick={() => handleEdit(a)}>Edit</button>
                <button onClick={() => handleDelete(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Announcements;