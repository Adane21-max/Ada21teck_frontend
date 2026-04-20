import { useState, useEffect } from 'react';
import api from '../../api/axios';

const FreeTrial = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Bulk add state
  const [bulkGrade, setBulkGrade] = useState(9);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    grade: 9,
    subject: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_answer: 'A',
    explanation: '',
    time_limit: ''
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/free-trial');
      setQuestions(res.data);
    } catch (err) {
      alert('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ---------- BULK ADD ----------
  const parseBulkText = (text) => {
    const blocks = text.trim().split(/\n\s*\n/).filter(b => b.trim() !== '');
    const parsed = [];
    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length < 6) continue;
      parsed.push({
        grade: bulkGrade,
        subject: bulkSubject,
        question: lines[0],
        optionA: lines[1],
        optionB: lines[2],
        optionC: lines[3],
        optionD: lines[4],
        correct_answer: lines[5].toUpperCase(),
        explanation: lines.length >= 7 ? lines[6] : '',
        time_limit: null
      });
    }
    return parsed;
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccess('');
    if (!bulkSubject.trim()) {
      setBulkError('Subject is required');
      return;
    }
    try {
      const parsed = parseBulkText(bulkText);
      if (parsed.length === 0) throw new Error('No valid questions found');
      for (const q of parsed) {
        await api.post('/free-trial', q);
      }
      setBulkSuccess(`✅ Added ${parsed.length} question(s)`);
      setBulkText('');
      fetchQuestions();
    } catch (err) {
      setBulkError(err.message);
    }
  };

  // ---------- EDIT ----------
  const startEdit = (q) => {
    setEditingId(q.id);
    setEditForm({
      grade: q.grade,
      subject: q.subject,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      time_limit: q.time_limit || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...editForm, time_limit: editForm.time_limit ? parseInt(editForm.time_limit) : null };
    try {
      await api.put(`/free-trial/${editingId}`, payload);
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      alert('Failed to update question');
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    if (window.confirm('Delete this question?')) {
      await api.delete(`/free-trial/${id}`);
      fetchQuestions();
    }
  };

  return (
    <div>
      <h2>Free Trial Questions</h2>

      {/* Bulk Add Card */}
      <div style={{ background: '#f8faff', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
        <h3>📦 Bulk Add Questions</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <label>
            Grade:
            <select value={bulkGrade} onChange={(e) => setBulkGrade(parseInt(e.target.value))}>
              {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>
            Subject:
            <input
              type="text"
              value={bulkSubject}
              onChange={(e) => setBulkSubject(e.target.value)}
              placeholder="e.g., Mathematics"
              required
            />
          </label>
        </div>
        <p><strong>Paste questions (separate blocks with a blank line):</strong></p>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '5px' }}>
{`Question text
Option A
Option B
Option C
Option D
Correct answer (A/B/C/D)
Explanation (optional)`}
        </pre>
        <textarea
          rows="10"
          style={{ width: '100%', fontFamily: 'monospace', padding: '10px', marginTop: '10px' }}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={`What is 2+2?\n3\n4\n5\n6\nB\nBasic addition\n\nWhat is the capital of France?\nLondon\nBerlin\nParis\nMadrid\nC`}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleBulkSubmit} style={{ padding: '10px 20px', background: '#2a5298', color: '#fff', border: 'none', borderRadius: '6px' }}>
            Upload Bulk Questions
          </button>
        </div>
        {bulkError && <p style={{ color: 'red', marginTop: '10px' }}>{bulkError}</p>}
        {bulkSuccess && <p style={{ color: 'green', marginTop: '10px' }}>{bulkSuccess}</p>}
      </div>

      {/* Edit Form (shown only when editing) */}
      {editingId && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
          <h3>✏️ Edit Question (ID: {editingId})</h3>
          <form onSubmit={handleEditSubmit}>
            <input type="number" placeholder="Grade" value={editForm.grade} onChange={(e) => setEditForm({...editForm, grade: parseInt(e.target.value)})} required />
            <input placeholder="Subject" value={editForm.subject} onChange={(e) => setEditForm({...editForm, subject: e.target.value})} required />
            <textarea placeholder="Question" value={editForm.question} onChange={(e) => setEditForm({...editForm, question: e.target.value})} required />
            <input placeholder="Option A" value={editForm.optionA} onChange={(e) => setEditForm({...editForm, optionA: e.target.value})} required />
            <input placeholder="Option B" value={editForm.optionB} onChange={(e) => setEditForm({...editForm, optionB: e.target.value})} required />
            <input placeholder="Option C" value={editForm.optionC} onChange={(e) => setEditForm({...editForm, optionC: e.target.value})} required />
            <input placeholder="Option D" value={editForm.optionD} onChange={(e) => setEditForm({...editForm, optionD: e.target.value})} required />
            <select value={editForm.correct_answer} onChange={(e) => setEditForm({...editForm, correct_answer: e.target.value})}>
              <option>A</option><option>B</option><option>C</option><option>D</option>
            </select>
            <textarea placeholder="Explanation" value={editForm.explanation} onChange={(e) => setEditForm({...editForm, explanation: e.target.value})} />
            <input type="number" placeholder="Time limit (sec)" value={editForm.time_limit} onChange={(e) => setEditForm({...editForm, time_limit: e.target.value})} />
            <button type="submit">Update Question</button>
            <button type="button" onClick={cancelEdit} style={{ marginLeft: '10px' }}>Cancel</button>
          </form>
        </div>
      )}

      {/* Questions Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Grade</th>
              <th>Subject</th>
              <th>Question</th>
              <th>Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No free trial questions yet.</td></tr>
            ) : (
              questions.map(q => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.grade}</td>
                  <td>{q.subject}</td>
                  <td>{q.question.substring(0, 30)}...</td>
                  <td>{q.correct_answer}</td>
                  <td>
                    <button onClick={() => startEdit(q)}>Edit</button>
                    <button onClick={() => handleDelete(q.id)}>Delete</button>
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

export default FreeTrial;
