import React, { useState } from 'react';

const WritingSpace = ({ data, updateData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);

  const addNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note = {
        id: Date.now(),
        title: newNote.title,
        content: newNote.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      updateData({
        ...data,
        writingNotes: [...(data.writingNotes || []), note]
      });
      
      setNewNote({ title: '', content: '' });
      setShowAddForm(false);
    }
  };

  const updateNote = () => {
    if (editingNote && newNote.title.trim() && newNote.content.trim()) {
      const updatedNotes = data.writingNotes?.map(note =>
        note.id === editingNote.id
          ? { ...note, title: newNote.title, content: newNote.content, updatedAt: new Date().toISOString() }
          : note
      ) || [];

      updateData({ ...data, writingNotes: updatedNotes });
      
      setNewNote({ title: '', content: '' });
      setEditingNote(null);
      setShowAddForm(false);
    }
  };

  const editNote = (note) => {
    setNewNote({ title: note.title, content: note.content });
    setEditingNote(note);
    setShowAddForm(true);
  };

  const deleteNote = (noteId) => {
    updateData({
      ...data,
      writingNotes: data.writingNotes?.filter(note => note.id !== noteId) || []
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Writing Space</h1>
      <p className="page-subtitle">생각을 정리하고 아이디어를 기록하는 공간</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>생각 정리 노트</h3>
        <button 
          className="action-btn add-btn"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingNote(null);
            setNewNote({ title: '', content: '' });
          }}
          title="새 노트 추가"
        >
          +
        </button>
      </div>

      {showAddForm && (
        <div className="add-goal-form" style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="노트 제목을 입력하세요"
            />
          </div>
          
          <div className="form-group">
            <label>내용</label>
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              placeholder="생각이나 아이디어를 자유롭게 작성하세요..."
              rows="8"
              style={{
                width: '100%',
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '150px'
              }}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="save-btn"
              onClick={editingNote ? updateNote : addNote}
            >
              {editingNote ? '수정' : '저장'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                setShowAddForm(false);
                setEditingNote(null);
                setNewNote({ title: '', content: '' });
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="notes-grid">
        {data.writingNotes?.length === 0 || !data.writingNotes ? (
          <div className="empty-state">
            <p style={{ color: 'var(--text-color)', opacity: 0.7, textAlign: 'center', fontSize: '1.1rem' }}>
              아직 작성된 노트가 없습니다.<br />
              새로운 생각이나 아이디어를 기록해보세요!
            </p>
          </div>
        ) : (
          data.writingNotes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => editNote(note)}
                    title="노트 수정"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => deleteNote(note.id)}
                    title="노트 삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="note-content">
                {note.content.split('\n').map((line, index) => (
                  <p key={index} style={{ margin: '0.5rem 0' }}>
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
              
              <div className="note-footer">
                <span className="note-date">
                  작성: {formatDate(note.createdAt)}
                  {note.updatedAt !== note.createdAt && (
                    <span> • 수정: {formatDate(note.updatedAt)}</span>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WritingSpace;
