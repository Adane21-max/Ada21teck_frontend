import { useState, useEffect } from 'react';
import api from '../../api/axios';

const QuestionTypes = () => {
  const [types, setTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    name: '', grade: 9, subject_id: '', total_time: '', is_visible: true,
    start_date: '', end_date: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // Quick Add Modal state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddGrade, setQuickAddGrade] = useState(9);
  const [quickAddSubjectId, setQuickAddSubjectId] = useState('');
  const [quickAddNewSubject, setQuickAddNewSubject] = useState('');
  const [quickAddTypeName, setQuickAddTypeName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [quickAddError, setQuickAddError] = useState('');
  const [quickAddSuccess, setQuickAddSuccess] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);

  useEffect(() => {
    fetchTypes();
    fetchSubjects();
  }, [filterGrade, filterSubject]);

  const fetchTypes = async () => {
    const params = {};
    if (filterGrade) params.grade = filterGrade;
    if (filterSubject) params.subject_id = filterSubject;
    const res = await api.get('/question-types', { params });
    setTypes(res.data);
  };

  const fetchSubjects = async () => {
    const res = await api.get('/subjects');
    setSubjects(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      total_time: form.total_time ? parseInt(form.total_time) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null
    };
    try {
      if (editingId) {
        await api.put(`/question-types/${editingId}`, payload);
      } else {
        await api.post('/question-types', payload);
      }
      setForm({ name: '', grade: 9, subject_id: '', total_time: '', is_visible: true, start_date: '', end_date: '' });
      setEditingId(null);
      fetchTypes();
    } catch (err) {
      alert('Error saving question type');
    }
  };

  const handleEdit = (type) => {
    setForm({
      name: type.name,
      grade: type.grade,
      subject_id: type.subject_id,
      total_time: type.total_time || '',
      is_visible: type.is_visible,
      start_date: type.start_date ? type.start_date.slice(0, 16) : '',
      end_date: type.end_date ? type.end_date.slice(0, 16) : ''
    });
    setEditingId(type.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this type and all its questions?')) {
      await api.delete(`/question-types/${id}`);
      fetchTypes();
    }
  };

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      await api.put(`/question-types/${id}`, { is_visible: !currentVisibility });
      fetchTypes();
    } catch (err) {
      alert('Failed to update visibility');
    }
  };

  // Quick Add Handlers
  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      setQuickAddError('Please paste at least one question.');
      return;
    }
    if (!quickAddTypeName.trim()) {
      setQuickAddError('Please enter a Quiz Type Name.');
      return;
    }

    let subjectId = quickAddSubjectId;
    let subjectName = '';
    if (!subjectId && quickAddNewSubject.trim()) {
      try {
        const res = await api.post('/subjects', { grade: quickAddGrade, name: quickAddNewSubject.trim() });
        subjectId = res.data.id;
        subjectName = quickAddNewSubject.trim();
        fetchSubjects();
      } catch (err) {
        setQuickAddError('Failed to create subject.');
        return;
      }
    } else if (subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      subjectName = subject?.name || '';
    } else {
      setQuickAddError('Please select or enter a subject.');
      return;
    }

    setQuickAdding(true);
    setQuickAddError('');
    setQuickAddSuccess('');

    try {
      let typeId = null;
      const existingType = types.find(t => 
        t.grade === quickAddGrade && 
        t.subject_id === subjectId && 
        t.name.toLowerCase() === quickAddTypeName.trim().toLowerCase()
      );
      
      if (existingType) {
        typeId = existingType.id;
      } else {
        const typeRes = await api.post('/question-types', {
          name: quickAddTypeName.trim(),
          grade: quickAddGrade,
          subject_id: subjectId,
          total_time: null,
          is_visible: true,
          start_date: null,
          end_date: null
        });
        typeId = typeRes.data.id;
        fetchTypes();
      }

      const blocks = bulkText.split(/\n\s*\n/).filter(block => block.trim() !== '');
      const questions = [];
      for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
        if (lines.length < 6) continue;
        questions.push({
          grade: quickAddGrade,
          type_id: typeId,
          question: lines[0],
          optionA: lines[1],
          optionB: lines[2],
          optionC: lines[3],
          optionD: lines[4],
          correct_answer: lines[5].toUpperCase(),
          explanation: lines.length >= 7 ? lines[6] : '',
        });
      }

      if (questions.length === 0) throw new Error('No valid questions found.');

      await api.post('/questions/bulk', { questions });
      setQuickAddSuccess(`✅ Added ${questions.length} questions to "${quickAddTypeName}" (Grade ${quickAddGrade} - ${subjectName}).`);
      setBulkText('');
      setQuickAddTypeName('');
      setQuickAddNewSubject('');
      setQuickAddSubjectId('');
    } catch (err) {
      setQuickAddError(err.message || 'Failed to add questions');
    } finally {
      setQuickAdding(false);
    }
  };

  const textPlaceholder = `What is 2+2?
3
4
5
6
B
Basic addition

What is the capital of France?
London
Berlin
Paris
Madrid
C`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quiz Types Management</h2>
        <button
          onClick={() => setShowQuickAdd(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(145deg, #1e3c72 0%, #2a5298 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '40px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 6px 14px rgba(30,60,114,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '20px' }}>⚡</span> Quick Add Questions
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
          <option value="">All Grades</option>
          {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={() => { setFilterGrade(''); setFilterSubject(''); }}>Clear</button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input placeholder="Type Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        <select value={form.grade} onChange={(e) => setForm({...form, grade: parseInt(e.target.value)})}>
          {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select value={form.subject_id} onChange={(e) => setForm({...form, subject_id: e.target.value})} required>
          <option value="">Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="number" placeholder="Total Time (seconds)" value={form.total_time} onChange={(e) => setForm({...form, total_time: e.target.value})} />
        <input type="datetime-local" placeholder="Start Date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} />
        <input type="datetime-local" placeholder="End Date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} />
        <label>
          <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({...form, is_visible: e.target.checked})} /> Visible
        </label>
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', grade: 9, subject_id: '', total_time: '', is_visible: true, start_date: '', end_date: '' }); }}>Cancel</button>}
      </form>

      {/* Table */}
      <table border="1" cellPadding="8">
  <thead>
    <tr>
      <th>Name</th>
      <th>Grade</th>
      <th>Subject</th>
      <th>Total Time (s)</th>
      <th>Start</th>
      <th>End</th>
      <th>Visible</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {types.map(t => (
      <tr key={t.id}>
        <td>{t.name}</td>
        <td>{t.grade}</td>
        <td>{t.subject_name}</td>
        <td>{t.total_time || '-'}</td>
        <td>{t.start_date ? new Date(t.start_date).toLocaleString() : '-'}</td>
        <td>{t.end_date ? new Date(t.end_date).toLocaleString() : '-'}</td>
        <td>{t.is_visible ? '✅' : '❌'}</td>
        <td>
          <button onClick={() => handleEdit(t)}>Edit</button>
          <button onClick={() => toggleVisibility(t.id, t.is_visible)}>
            {t.is_visible ? 'Hide' : 'Show'}
          </button>
          <button onClick={() => handleDelete(t.id)}>Delete</button>
          <button onClick={() => window.location.href = `/admin/questions?type_id=${t.id}`}>
            Manage Questions
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '700px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h3>Quick Add Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <label>Grade:
                <select value={quickAddGrade} onChange={(e) => setQuickAddGrade(parseInt(e.target.value))}>
                  {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </label>
              <label>Subject:
                <select value={quickAddSubjectId} onChange={(e) => setQuickAddSubjectId(e.target.value)}>
                  <option value="">Select existing subject</option>
                  {subjects.filter(s => s.grade === quickAddGrade).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label>Or new subject:
                <input type="text" placeholder="e.g., Mathematics" value={quickAddNewSubject} onChange={(e) => setQuickAddNewSubject(e.target.value)} disabled={!!quickAddSubjectId} />
              </label>
              <label><strong>Quiz Type Name *</strong>
                <input type="text" placeholder="e.g., Model 1, Final Exam" value={quickAddTypeName} onChange={(e) => setQuickAddTypeName(e.target.value)} required style={{ width: '100%', marginTop: '5px' }} />
                <small style={{ color: '#6b7280' }}>This will create a separate quiz students can select.</small>
              </label>
            </div>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
{`Question text
Option A
Option B
Option C
Option D
Correct answer (A/B/C/D)
Explanation (optional)
(blank line between questions)`}
            </pre>
            <textarea rows="12" style={{ width: '100%', fontFamily: 'monospace', padding: '10px', marginBottom: '15px' }} value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={textPlaceholder} disabled={quickAdding} />
            {quickAddError && <p style={{ color: 'red' }}>{quickAddError}</p>}
            {quickAddSuccess && <p style={{ color: 'green' }}>{quickAddSuccess}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowQuickAdd(false)} disabled={quickAdding}>Cancel</button>
              <button onClick={handleQuickAddSubmit} disabled={quickAdding} style={{ background: '#2a5298', color: '#fff' }}>
                {quickAdding ? 'Adding...' : 'Upload Questions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionTypes;