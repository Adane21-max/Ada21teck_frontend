import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ grade: 9, name: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      // Sort by grade (ascending 6 → 12), then by name alphabetically
      const sorted = [...res.data].sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        return a.name.localeCompare(b.name);
      });
      setSubjects(sorted);
    } catch (err) {
      alert('Failed to fetch subjects');
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, form);
      } else {
        await api.post('/subjects', form);
      }
      setForm({ grade: 9, name: '' });
      setEditingId(null);
      fetchSubjects();
    } catch (err) {
      alert('Error saving subject');
    }
  };

  const handleEdit = (subject) => {
    setForm({ grade: subject.grade, name: subject.name });
    setEditingId(subject.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subject?')) {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    }
  };

  return (
    <div>
      <h2>Subjects Management</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select value={form.grade} onChange={(e) => setForm({...form, grade: parseInt(e.target.value)})}>
          {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <input
          placeholder="Subject Name"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          required
        />
        <button type="submit">{editingId ? 'Update' : 'Add'} Subject</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ grade: 9, name: '' }); }}>
            Cancel
          </button>
        )}
      </form>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th><th>Grade</th><th>Name</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.grade}</td>
              <td>{s.name}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Subjects;