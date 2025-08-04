import React, { useState, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const Study = ({ data, updateData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubject, setNewSubject] = useState({
    title: '',
    description: '',
    curriculum: []
  });
  const [newCurriculumItem, setNewCurriculumItem] = useState({
    title: '',
    content: '',
    attachments: [],
    completed: false
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [editingCurriculum, setEditingCurriculum] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // LaTeX 렌더링 함수
  const renderLatex = (text) => {
    if (!text) return '';
    
    // LaTeX 수식을 찾아서 렌더링
    const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
    
    return text.split(latexRegex).map((part, index) => {
      if (index % 3 === 1) { // 블록 수식 ($$...$$)
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(part, { displayMode: true })
              }}
            />
          );
        } catch (e) {
          return <span key={index} style={{ color: 'red' }}>LaTeX Error: {part}</span>;
        }
      } else if (index % 3 === 2) { // 인라인 수식 ($...$)
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(part, { displayMode: false })
              }}
            />
          );
        } catch (e) {
          return <span key={index} style={{ color: 'red' }}>LaTeX Error: {part}</span>;
        }
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  const addSubject = () => {
    if (newSubject.title.trim()) {
      const subject = {
        id: Date.now(),
        title: newSubject.title,
        description: newSubject.description,
        curriculum: [],
        createdAt: new Date().toISOString()
      };
      
      updateData({
        ...data,
        studySubjects: [...(data.studySubjects || []), subject]
      });
      
      setNewSubject({ title: '', description: '', curriculum: [] });
      setShowAddForm(false);
    }
  };

  const editSubject = (subjectId) => {
    const subject = (data.studySubjects || []).find(s => s.id === subjectId);
    if (subject) {
      setEditingSubject(subjectId);
      setNewSubject({
        title: subject.title,
        description: subject.description,
        curriculum: subject.curriculum
      });
      setShowAddForm(true);
    }
  };

  const updateSubject = () => {
    if (newSubject.title.trim() && editingSubject) {
      const updatedSubjects = (data.studySubjects || []).map(subject => {
        if (subject.id === editingSubject) {
          return {
            ...subject,
            title: newSubject.title,
            description: newSubject.description
          };
        }
        return subject;
      });
      
      updateData({
        ...data,
        studySubjects: updatedSubjects
      });
      
      setNewSubject({ title: '', description: '', curriculum: [] });
      setShowAddForm(false);
      setEditingSubject(null);
    }
  };

  const removeSubject = (subjectId) => {
    updateData({
      ...data,
      studySubjects: (data.studySubjects || []).filter(subject => subject.id !== subjectId)
    });
  };

  const addCurriculumItem = (subjectId) => {
    if (newCurriculumItem.title.trim()) {
      const updatedSubjects = (data.studySubjects || []).map(subject => {
        if (subject.id === subjectId) {
          const newItem = {
            id: Date.now(),
            title: newCurriculumItem.title,
            content: newCurriculumItem.content,
            attachments: [...newCurriculumItem.attachments],
            completed: false,
            createdAt: new Date().toISOString()
          };
          return {
            ...subject,
            curriculum: [...(subject.curriculum || []), newItem]
          };
        }
        return subject;
      });
      
      updateData({
        ...data,
        studySubjects: updatedSubjects
      });
      
      setNewCurriculumItem({ title: '', content: '', attachments: [], completed: false });
    }
  };

  const updateCurriculumItem = (subjectId, itemId, updatedItem) => {
    const updatedSubjects = (data.studySubjects || []).map(subject => {
      if (subject.id === subjectId) {
        const updatedCurriculum = subject.curriculum.map(item => 
          item.id === itemId ? { ...item, ...updatedItem } : item
        );
        return { ...subject, curriculum: updatedCurriculum };
      }
      return subject;
    });
    
    updateData({
      ...data,
      studySubjects: updatedSubjects
    });
  };

  const removeCurriculumItem = (subjectId, itemId) => {
    const updatedSubjects = (data.studySubjects || []).map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          curriculum: subject.curriculum.filter(item => item.id !== itemId)
        };
      }
      return subject;
    });
    
    updateData({
      ...data,
      studySubjects: updatedSubjects
    });
  };

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const handleFileUpload = (event, type = 'pdf') => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          data: e.target.result,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        
        setNewCurriculumItem(prev => ({
          ...prev,
          attachments: [...prev.attachments, attachment]
        }));
      };
      
      if (type === 'image') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsDataURL(file); // PDF도 base64로 저장
      }
    });
    
    // 파일 입력 초기화
    event.target.value = '';
  };

  const removeAttachment = (attachmentId) => {
    setNewCurriculumItem(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const openPdfViewer = (attachment) => {
    // 새 창에서 PDF 열기
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>${attachment.name}</title>
          <style>
            body { margin: 0; padding: 0; }
            iframe { width: 100vw; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${attachment.data}" type="application/pdf"></iframe>
        </body>
      </html>
    `);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newSubjects = [...(data.studySubjects || [])];
    const draggedSubject = newSubjects[draggedItem];
    
    newSubjects.splice(draggedItem, 1);
    newSubjects.splice(dropIndex, 0, draggedSubject);
    
    updateData({
      ...data,
      studySubjects: newSubjects
    });
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Study</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>학습 과목 관리</h3>
        <button 
          className="action-btn add-btn"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingSubject(null);
            setNewSubject({ title: '', description: '', curriculum: [] });
          }}
          title="새 과목 추가"
        >
          +
        </button>
      </div>
      
      {showAddForm && (
        <div className="add-goal-form" style={{ marginBottom: '3rem' }}>
          <div className="form-group">
            <label>과목명</label>
            <input
              type="text"
              value={newSubject.title}
              onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
              placeholder="과목명을 입력하세요"
            />
          </div>
          
          <div className="form-group">
            <label>과목 설명</label>
            <textarea
              value={newSubject.description}
              onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
              placeholder="과목에 대한 간단한 설명을 입력하세요..."
              rows="3"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="submit-btn" onClick={editingSubject ? updateSubject : addSubject}>
              {editingSubject ? '과목 수정' : '과목 추가'}
            </button>
            <button 
              className="submit-btn" 
              style={{ background: 'var(--accent-color)' }}
              onClick={() => {
                setShowAddForm(false);
                setEditingSubject(null);
                setNewSubject({ title: '', description: '', curriculum: [] });
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
      
      {(!data.studySubjects || data.studySubjects.length === 0) ? (
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.7)', 
          padding: '4rem',
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>등록된 과목이 없습니다</h3>
          <p>새로운 학습 과목을 추가해보세요!</p>
        </div>
      ) : (
        <div className="study-subjects">
          {data.studySubjects.map((subject, index) => (
            <div 
              key={subject.id} 
              className={`study-subject ${draggedItem === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle" title="드래그해서 순서 변경">
                ⋮⋮
              </div>
              
              <div className="subject-header">
                <div className="subject-info">
                  <h3 className="subject-title">{subject.title}</h3>
                  {subject.description && (
                    <p className="subject-description">{subject.description}</p>
                  )}
                  <div className="subject-stats">
                    <span>커리큘럼: {subject.curriculum?.length || 0}개</span>
                    <span>완료: {subject.curriculum?.filter(item => item.completed).length || 0}개</span>
                  </div>
                </div>
                
                <div className="subject-actions">
                  <button 
                    className="action-btn"
                    onClick={() => toggleSubjectExpansion(subject.id)}
                    title={expandedSubjects[subject.id] ? "접기" : "펼치기"}
                    style={{ background: 'var(--secondary-color)' }}
                  >
                    {expandedSubjects[subject.id] ? '▲' : '▼'}
                  </button>
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => editSubject(subject.id)}
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn remove-btn"
                    onClick={() => removeSubject(subject.id)}
                    title="삭제"
                  >
                    -
                  </button>
                </div>
              </div>
              
              {expandedSubjects[subject.id] && (
                <div className="curriculum-section">
                  <div className="curriculum-add-form">
                    <h4 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                      새 커리큘럼 항목 추가
                    </h4>
                    
                    <div className="form-group">
                      <input
                        type="text"
                        value={newCurriculumItem.title}
                        onChange={(e) => setNewCurriculumItem({ ...newCurriculumItem, title: e.target.value })}
                        placeholder="커리큘럼 제목"
                        style={{ marginBottom: '1rem' }}
                      />
                    </div>
                    
                    <div className="form-group">
                      <textarea
                        value={newCurriculumItem.content}
                        onChange={(e) => setNewCurriculumItem({ ...newCurriculumItem, content: e.target.value })}
                        placeholder="학습 내용을 입력하세요. LaTeX 수식은 $수식$ 또는 $$수식$$로 입력할 수 있습니다."
                        rows="4"
                        style={{ marginBottom: '1rem' }}
                      />
                    </div>
                    
                    <div className="attachment-section">
                      <div className="attachment-buttons">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, 'pdf')}
                          style={{ display: 'none' }}
                        />
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'image')}
                          style={{ display: 'none' }}
                        />
                        
                        <button
                          type="button"
                          className="attachment-btn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          📄 PDF 첨부
                        </button>
                        <button
                          type="button"
                          className="attachment-btn"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          🖼️ 이미지 첨부
                        </button>
                      </div>
                      
                      {newCurriculumItem.attachments.length > 0 && (
                        <div className="attachments-preview">
                          {newCurriculumItem.attachments.map(attachment => (
                            <div key={attachment.id} className="attachment-item">
                              <span>{attachment.name}</span>
                              <button
                                onClick={() => removeAttachment(attachment.id)}
                                className="remove-attachment"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      className="submit-btn"
                      onClick={() => addCurriculumItem(subject.id)}
                      style={{ marginTop: '1rem' }}
                    >
                      커리큘럼 항목 추가
                    </button>
                  </div>
                  
                  <div className="curriculum-list">
                    {subject.curriculum && subject.curriculum.map(item => (
                      <div key={item.id} className="curriculum-item">
                        <div className="curriculum-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={(e) => updateCurriculumItem(subject.id, item.id, { completed: e.target.checked })}
                              className="checkbox"
                            />
                            <h5 style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                              {item.title}
                            </h5>
                          </div>
                          <button
                            className="action-btn remove-btn"
                            onClick={() => removeCurriculumItem(subject.id, item.id)}
                            title="삭제"
                          >
                            -
                          </button>
                        </div>
                        
                        {item.content && (
                          <div className="curriculum-content">
                            {renderLatex(item.content)}
                          </div>
                        )}
                        
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="curriculum-attachments">
                            {item.attachments.map(attachment => (
                              <div key={attachment.id} className="attachment-display">
                                {attachment.type.startsWith('image/') ? (
                                  <img
                                    src={attachment.data}
                                    alt={attachment.name}
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: '300px',
                                      borderRadius: '8px',
                                      margin: '0.5rem 0'
                                    }}
                                  />
                                ) : attachment.type === 'application/pdf' ? (
                                  <button
                                    className="pdf-viewer-btn"
                                    onClick={() => openPdfViewer(attachment)}
                                  >
                                    📄 {attachment.name} 보기
                                  </button>
                                ) : (
                                  <a
                                    href={attachment.data}
                                    download={attachment.name}
                                    className="attachment-link"
                                  >
                                    📎 {attachment.name}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Study;
