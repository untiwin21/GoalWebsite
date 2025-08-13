import React, { useState } from 'react';

const Motivation = ({ data, updateData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    url: '',
    type: 'youtube', // youtube, blog, other
    notes: ''
  });
  const [draggedItem, setDraggedItem] = useState(null);

  const addMotivationItem = () => {
    if (newItem.title.trim()) {
      const item = {
        id: Date.now(),
        title: newItem.title,
        url: newItem.url,
        type: newItem.type,
        notes: newItem.notes,
        createdAt: new Date().toISOString()
      };
      
      updateData({
        ...data,
        motivationItems: [...(data.motivationItems || []), item]
      });
      
      setNewItem({ title: '', url: '', type: 'youtube', notes: '' });
      setShowAddForm(false);
    }
  };

  const editItem = (itemId) => {
    const item = (data.motivationItems || []).find(i => i.id === itemId);
    if (item) {
      setEditingItem(itemId);
      setNewItem({
        title: item.title,
        url: item.url,
        type: item.type,
        notes: item.notes
      });
      setShowAddForm(true);
    }
  };

  const updateItem = () => {
    if (newItem.title.trim() && editingItem) {
      const updatedItems = (data.motivationItems || []).map(item => {
        if (item.id === editingItem) {
          return {
            ...item,
            title: newItem.title,
            url: newItem.url,
            type: newItem.type,
            notes: newItem.notes
          };
        }
        return item;
      });
      
      updateData({
        ...data,
        motivationItems: updatedItems
      });
      
      setNewItem({ title: '', url: '', type: 'youtube', notes: '' });
      setShowAddForm(false);
      setEditingItem(null);
    }
  };

  const removeItem = (itemId) => {
    updateData({
      ...data,
      motivationItems: (data.motivationItems || []).filter(item => item.id !== itemId)
    });
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

    const newItems = [...(data.motivationItems || [])];
    const draggedItemData = newItems[draggedItem];
    
    // 드래그된 아이템 제거
    newItems.splice(draggedItem, 1);
    
    // 새 위치에 삽입
    newItems.splice(dropIndex, 0, draggedItemData);
    
    updateData({
      ...data,
      motivationItems: newItems
    });
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    // hqdefault는 16:9 비율을 유지하면서 더 적절한 크기를 제공합니다
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const renderMediaPreview = (item) => {
    if (item.type === 'youtube' && item.url) {
      const thumbnail = getYouTubeThumbnail(item.url);
      if (thumbnail) {
        return (
          <div className="media-preview youtube-preview">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <img 
                src={thumbnail} 
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#000',
                  transition: 'transform 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              />
              <div className="play-overlay">
                <div className="play-button">▶️</div>
              </div>
            </a>
          </div>
        );
      }
    }
    
    if (item.url) {
      return (
        <div className="media-preview link-preview">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="external-link"
          >
            🔗 {item.type === 'blog' ? '블로그 글 보기' : '링크 열기'}
          </a>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Motivation</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>마음을 다잡는 콘텐츠</h3>
        <button 
          className="action-btn add-btn"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingItem(null);
            setNewItem({ title: '', url: '', type: 'youtube', notes: '' });
          }}
          title="새 동기부여 콘텐츠 추가"
        >
          +
        </button>
      </div>
      
      {showAddForm && (
        <div className="add-goal-form" style={{ marginBottom: '3rem' }}>
          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="동기부여 콘텐츠 제목을 입력하세요"
            />
          </div>
          
          <div className="form-group">
            <label>콘텐츠 유형</label>
            <select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--light-text)',
                transition: 'all var(--transition-speed) ease'
              }}
            >
              <option value="youtube">YouTube 영상</option>
              <option value="blog">블로그 글</option>
              <option value="other">기타 링크</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>URL (선택사항)</label>
            <input
              type="url"
              value={newItem.url}
              onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          
          <div className="form-group">
            <label>인상깊었던 말 / 메모</label>
            <textarea
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              placeholder="이 콘텐츠에서 인상깊었던 말이나 개인적인 메모를 작성하세요..."
              rows="6"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="submit-btn" onClick={editingItem ? updateItem : addMotivationItem}>
              {editingItem ? '수정 완료' : '추가하기'}
            </button>
            <button 
              className="submit-btn" 
              style={{ background: 'var(--accent-color)' }}
              onClick={() => {
                setShowAddForm(false);
                setEditingItem(null);
                setNewItem({ title: '', url: '', type: 'youtube', notes: '' });
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
      
      {(!data.motivationItems || data.motivationItems.length === 0) ? (
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.7)', 
          padding: '4rem',
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>아직 동기부여 콘텐츠가 없습니다</h3>
          <p>마음을 다잡을 수 있는 영상이나 글을 추가해보세요!</p>
        </div>
      ) : (
        <div className="motivation-grid">
          {data.motivationItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`motivation-item ${draggedItem === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle" title="드래그해서 순서 변경">
                ⋮⋮
              </div>
              <div className="motivation-header">
                <h3 className="motivation-title">{item.title}</h3>
                <div className="motivation-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => editItem(item.id)}
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn remove-btn"
                    onClick={() => removeItem(item.id)}
                    title="삭제"
                  >
                    -
                  </button>
                </div>
              </div>
              
              {renderMediaPreview(item)}
              
              {item.notes && (
                <div className="motivation-notes">
                  <h4 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                    💭 인상깊었던 말 / 메모
                  </h4>
                  <p>{item.notes}</p>
                </div>
              )}
              
              <div className="motivation-meta">
                <span className="motivation-type">
                  {item.type === 'youtube' ? '📺 YouTube' : 
                   item.type === 'blog' ? '📝 Blog' : '🔗 Link'}
                </span>
                <span className="motivation-date">
                  {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Motivation;
