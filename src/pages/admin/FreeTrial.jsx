import { useState, useEffect } from 'react';
import api from '../../api/axios';

const FreeTrial = () => {
  const [questions, setQuestions] = useState([]);
  const [viewMode, setViewMode] = useState('summary');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({
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
  const [editingId, setEditingId] = useState(null);
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [textBulkInput, setTextBulkInput] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkGrade, setBulkGrade] = useState(9);
  const [bulkSubject, setBulkSubject] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/free-trial');
      setQuestions(res.data);
    } catch (err) {
      alert('Failed to fetch free trial questions');
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const grouped = {};
  questions.forEach(q => {
    const key = `${q.grade}|${q.subject}`;
    if (!grouped[key]) grouped[key] = { grade: q.grade, subject: q.subject, count: 0 };
    grouped[key].count++;
  });
  const groups = Object.values(grouped).sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.subject.localeCompare(b.subject);
  });

  const filteredQuestions = selectedGroup
    ? questions.filter(q => q.grade === selectedGroup.grade && q.subject === selectedGroup.subject)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allowedFields = [
      'grade', 'subject', 'question',
      'optionA', 'optionB', 'optionC', 'optionD',
      'correct_answer', 'explanation', 'time_limit'
    ];
    
    const payload = {};
    allowedFields.forEach(field => {
      if (form[field] !== undefined) {
        payload[field] = field === 'time_limit' && form[field]
          ? parseInt(form[field])
          : form[field];
      }
    });

    try {
      if (editingId) {
        await api.put(`/free-trial/${editingId}`, payload);
      } else {
        await api.post('/free-trial', payload);
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      alert('Error saving question: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setForm({
      grade: selectedGroup?.grade || 9,
      subject: selectedGroup?.subject || '',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correct_answer: 'A',
      explanation: '',
      time_limit: ''
    });
    setEditingId(null);
    setShowSingleForm(false);
  };

  const handleEdit = (q) => {
    setForm({
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
    setEditingId(q.id);
    setShowSingleForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this question?')) {
      await api.delete(`/free-trial/${id}`);
      fetchQuestions();
    }
  };

  const parseTextBulk = (text) => {
    const blocks = text.trim().split(/\n\s*\n/);
    const questions = [];
    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim());
      const nonEmpty = lines.filter(l => l !== '');
      if (nonEmpty.length < 6) continue;
      const questionText = nonEmpty[0];
      const optionA = nonEmpty[1];
      const optionB = nonEmpty[2];
      const optionC = nonEmpty[3];
      const optionD = nonEmpty[4];
      const correctAnswer = nonEmpty[5].toUpperCase();
      let explanation = '';
      if (nonEmpty.length >= 7) explanation = nonEmpty[6];
      if (!['A','B','C','D'].includes(correctAnswer)) {
        throw new Error(`Invalid answer '${correctAnswer}' in: ${questionText.substring(0,30)}`);
      }
      questions.push({
        grade: bulkGrade,
        subject: bulkSubject,
        question: questionText,
        optionA, optionB, optionC, optionD,
        correct_answer: correctAnswer,
        explanation,
        time_limit: null
      });
    }
    return questions;
  };

  const handleTextBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccess('');
    if (!bulkSubject.trim()) {
      setBulkError('Subject is required');
      return;
    }
    try {
      const parsed = parseTextBulk(textBulkInput);
      if (parsed.length === 0) throw new Error('No valid questions found');
      for (const q of parsed) {
        await api.post('/free-trial', q);
      }
      setBulkSuccess(`Added ${parsed.length} questions`);
      setTextBulkInput('');
      fetchQuestions();
    } catch (err) {
      setBulkError(err.message || 'Invalid format or server error');
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

  // ========== SUMMARY VIEW ==========
  if (viewMode === 'summary') {
    return (
      <div>
        <h2>Free Trial Questions</h2>
        <p>Manage sample questions by grade and subject.</p>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Grade</th><th>Subject</th><th>Questions</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No free trial questions yet.</td></tr>
            ) : (
              groups.map(g => (
                <tr key={`${g.grade}-${g.subject}`}>
                  <td>{g.grade}</td>
                  <td>{g.subject}</td>
                  <td>{g.count}</td>
                  <td>
                    <button onClick={() => {
                      setSelectedGroup({ grade: g.grade, subject: g.subject });
                      setViewMode('detail');
                      setBulkGrade(g.grade);
                      setBulkSubject(g.subject);
                      setForm(f => ({ ...f, grade: g.grade, subject: g.subject }));
                    }}>Manage Questions</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // ========== DETAIL VIEW ==========
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <button onClick={() => { setViewMode('summary'); setSelectedGroup(null); }} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          ← Back to Summary
        </button>
        <h2>Free Trial: Grade {selectedGroup.grade} - {selectedGroup.subject}</h2>
      </div>

      {/* Simple Bulk Add */}
      <div style={{ marginBottom: '30px', background: '#f8faff', padding: '20px', borderRadius: '12px' }}>
        <h3>📦 Bulk Add Questions</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <label>Grade:
            <select value={bulkGrade} onChange={(e) => setBulkGrade(parseInt(e.target.value))}>
              {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>Subject:
            <input type="text" value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} placeholder="e.g., Mathematics" required />
          </label>
        </div>
        <p><strong>Paste questions (separate blocks with a blank line):</strong></p>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
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
          value={textBulkInput}
          onChange={(e) => setTextBulkInput(e.target.value)}
          placeholder={textPlaceholder}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleTextBulkSubmit} style={{ padding: '10px 20px', background: '#2a5298', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Upload Bulk Questions
          </button>
        </div>
        {bulkError && <p style={{ color: 'red', marginTop: '10px' }}>{bulkError}</p>}
        {bulkSuccess && <p style={{ color: 'green', marginTop: '10px' }}>{bulkSuccess}</p>}
      </div>

      {/* Single Add / Edit Form */}
      <div style={{ marginBottom: '20px' }}>
        {!showSingleForm ? (
          <button onClick={() => setShowSingleForm(true)} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ➕ Add Single Question
          </button>
        ) : (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3>{editingId ? 'Edit Question' : 'Add Single Question'}</h3>
            <form onSubmit={handleSubmit}>
              <input type="number" placeholder="Grade" value={form.grade} onChange={(e) => setForm({...form, grade: parseInt(e.target.value)})} required />
              <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} required />
              <textarea placeholder="Question" value={form.question} onChange={(e) => setForm({...form, question: e.target.value})} required />
              <input placeholder="Option A" value={form.optionA} onChange={(e) => setForm({...form, optionA: e.target.value})} required />
              <input placeholder="Option B" value={form.optionB} onChange={(e) => setForm({...form, optionB: e.target.value})} required />
              <input placeholder="Option C" value={form.optionC} onChange={(e) => setForm({...form, optionC: e.target.value})} required />
              <input placeholder="Option D" value={form.optionD} onChange={(e) => setForm({...form, optionD: e.target.value})} required />
              <select value={form.correct_answer} onChange={(e) => setForm({...form, correct_answer: e.target.value})}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
              <textarea placeholder="Explanation" value={form.explanation} onChange={(e) => setForm({...form, explanation: e.target.value})} />
              <input type="number" placeholder="Time limit (sec)" value={form.time_limit} onChange={(e) => setForm({...form, time_limit: e.target.value})} />
              <button type="submit">{editingId ? 'Update' : 'Add'} Question</button>
              <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>Cancel</button>
            </form>
          </div>
        )}
      </div>

      {/* Questions Table */}
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr><th>ID</th><th>Question</th><th>Answer</th><th>Timer(s)</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filteredQuestions.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No questions for this subject.</td></tr>
          ) : (
            filteredQuestions.map(q => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.question.substring(0, 40)}...</td>
                <td>{q.correct_answer}</td>
                <td>{q.time_limit || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(q)}>Edit</button>
                  <button onClick={() => handleDelete(q.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FreeTrial;