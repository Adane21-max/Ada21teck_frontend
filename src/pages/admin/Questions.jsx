import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const Questions = () => {
  const [searchParams] = useSearchParams();
  const typeIdFromUrl = searchParams.get('type_id');

  const [questions, setQuestions] = useState([]);
  const [typeInfo, setTypeInfo] = useState(null);
  const [form, setForm] = useState({
    grade: 9, level: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '',
    correct_answer: 'A', explanation: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const [textBulkInput, setTextBulkInput] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  useEffect(() => {
    if (typeIdFromUrl) {
      fetchTypeInfo();
      fetchQuestions();
    }
  }, [typeIdFromUrl]);

  const fetchTypeInfo = async () => {
    try {
      const res = await api.get(`/question-types/${typeIdFromUrl}`);
      setTypeInfo(res.data);
    } catch (err) {
      console.error('Failed to fetch type info');
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/questions?type_id=${typeIdFromUrl}`);
      setQuestions(res.data);
    } catch (err) {
      alert('Failed to fetch questions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeIdFromUrl) {
      alert('No question type selected');
      return;
    }
    const payload = {
      ...form,
      type_id: typeIdFromUrl,
    };
    try {
      if (editingId) {
        await api.put(`/questions/${editingId}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      alert('Error saving question');
    }
  };

  const resetForm = () => {
    setForm({ grade: 9, level: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct_answer: 'A', explanation: '' });
    setEditingId(null);
  };

  const handleEdit = (q) => {
    setForm({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correct_answer: q.correct_answer,
      explanation: q.explanation || ''
    });
    setEditingId(q.id);
    setActiveTab('single');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this question?')) {
      await api.delete(`/questions/${id}`);
      fetchQuestions();
    }
  };

  // Improved bulk parser – handles multiple blank lines and trims each line
  const parseTextBulk = (text) => {
    // Split by one or more blank lines
    const blocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');
    const questions = [];
    
    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
      
      if (lines.length < 6) {
        console.warn('Skipping incomplete question block:', lines);
        continue;
      }
      
      const questionText = lines[0];
      const optionA = lines[1];
      const optionB = lines[2];
      const optionC = lines[3];
      const optionD = lines[4];
      const correctAnswer = lines[5].toUpperCase();
      let explanation = '';
      if (lines.length >= 7) explanation = lines[6];
      
      if (!['A','B','C','D'].includes(correctAnswer)) {
        throw new Error(`Invalid answer '${correctAnswer}' in: ${questionText.substring(0,30)}`);
      }
      
      questions.push({
        grade: typeInfo?.grade || 9,
        type_id: typeIdFromUrl,
        question: questionText,
        optionA, optionB, optionC, optionD,
        correct_answer: correctAnswer,
        explanation,
      });
    }
    
    console.log(`Parsed ${questions.length} question(s) from bulk input`);
    return questions;
  };

  const handleTextBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccess('');
    
    if (!typeIdFromUrl) {
      setBulkError('No question type selected');
      return;
    }
    
    try {
      const parsed = parseTextBulk(textBulkInput);
      
      if (parsed.length === 0) {
        throw new Error('No valid questions found. Each question must have at least 6 lines.');
      }
      
      const res = await api.post('/questions/bulk', { questions: parsed });
      setBulkSuccess(res.data.message);
      setTextBulkInput('');
      fetchQuestions();
    } catch (err) {
      console.error('Bulk upload error:', err);
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

  if (!typeIdFromUrl) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>No Question Type Selected</h2>
        <p>Please go to <a href="/admin/question-types">Quiz Types</a> and click "Manage Questions" on a type.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Questions: {typeInfo?.name || 'Loading...'}</h2>
      <p>Grade: {typeInfo?.grade} | Subject: {typeInfo?.subject_name}</p>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('single')} style={{ marginRight: '10px', fontWeight: activeTab === 'single' ? 'bold' : 'normal' }}>
          ➕ Single Add
        </button>
        <button onClick={() => setActiveTab('text')} style={{ fontWeight: activeTab === 'text' ? 'bold' : 'normal' }}>
          📝 Simple Bulk Add
        </button>
      </div>

      {activeTab === 'single' && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <textarea placeholder="Question" value={form.question} onChange={(e) => setForm({...form, question: e.target.value})} required />
          <input placeholder="Option A" value={form.optionA} onChange={(e) => setForm({...form, optionA: e.target.value})} required />
          <input placeholder="Option B" value={form.optionB} onChange={(e) => setForm({...form, optionB: e.target.value})} required />
          <input placeholder="Option C" value={form.optionC} onChange={(e) => setForm({...form, optionC: e.target.value})} required />
          <input placeholder="Option D" value={form.optionD} onChange={(e) => setForm({...form, optionD: e.target.value})} required />
          <select value={form.correct_answer} onChange={(e) => setForm({...form, correct_answer: e.target.value})}>
            <option>A</option><option>B</option><option>C</option><option>D</option>
          </select>
          <textarea placeholder="Explanation" value={form.explanation} onChange={(e) => setForm({...form, explanation: e.target.value})} />
          <button type="submit">{editingId ? 'Update' : 'Add'} Question</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </form>
      )}

      {activeTab === 'text' && (
        <div style={{ marginBottom: '20px' }}>
          <pre style={{ background: '#f5f5f5', padding: '10px' }}>
{`Question text
Option A
Option B
Option C
Option D
Correct answer (A/B/C/D)
Explanation (optional)`}
          </pre>
          <textarea
            rows="12"
            style={{ width: '100%', fontFamily: 'monospace' }}
            value={textBulkInput}
            onChange={(e) => setTextBulkInput(e.target.value)}
            placeholder={textPlaceholder}
          />
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleTextBulkSubmit}>Upload Bulk</button>
          </div>
          {bulkError && <p style={{ color: 'red' }}>{bulkError}</p>}
          {bulkSuccess && <p style={{ color: 'green' }}>{bulkSuccess}</p>}
        </div>
      )}

      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr><th>ID</th><th>Question</th><th>Answer</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>{q.question.substring(0, 40)}...</td>
              <td>{q.correct_answer}</td>
              <td>
                <button onClick={() => handleEdit(q)}>Edit</button>
                <button onClick={() => handleDelete(q.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Questions;