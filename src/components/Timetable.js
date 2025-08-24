import React, { useState, useEffect, useRef } from 'react';

const Timetable = () => {
  // --- STATE MANAGEMENT ---
  // Load schedule from localStorage
  const [schedule, setSchedule] = useState(() => {
    try {
      const savedSchedule = localStorage.getItem('timetable_schedule');
      return savedSchedule ? JSON.parse(savedSchedule) : {};
    } catch (error) {
      console.error("Error parsing schedule from localStorage", error);
      return {};
    }
  });

  // Load categories from localStorage
  const [categories, setCategories] = useState(() => {
    try {
      const savedCategories = localStorage.getItem('timetable_categories');
      return savedCategories ? JSON.parse(savedCategories) : [
        { id: 1, name: '수업', color: '#3498db' },
        { id: 2, name: '운동', color: '#2ecc71' },
        { id: 3, name: '스터디', color: '#f1c40f' },
      ];
    } catch (error) {
      console.error("Error parsing categories from localStorage", error);
      return [];
    }
  });

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  
  // Modal & Form State
  const [editingBlock, setEditingBlock] = useState(null); // The block being edited
  const [blockTitle, setBlockTitle] = useState('');
  const [blockDescription, setBlockDescription] = useState('');
  const [blockCategoryId, setBlockCategoryId] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // The category being edited
  
  const timetableRef = useRef(null);
  const availableColors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#1abc9c', '#d35400', '#c0392b'];

  // --- USE EFFECT HOOKS ---
  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timetable_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timetable_categories', JSON.stringify(categories));
  }, [categories]);

  // --- CONSTANTS ---
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const hours = Array.from({ length: 20 }, (_, i) => i + 5); // 5 AM to 1 AM

  // --- EVENT HANDLERS ---
  const getCellInfo = (e) => {
    if (!timetableRef.current) return null;
    const rect = timetableRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = rect.width / 7;
    const cellHeight = 10; // 10px for 10 minutes

    const dayIndex = Math.floor(x / cellWidth);
    const timeIndex = Math.floor(y / cellHeight);

    if (dayIndex < 0 || dayIndex >= 7) return null;
    return { day: days[dayIndex], timeIndex };
  };

  const handleMouseDown = (e) => {
    const info = getCellInfo(e);
    if (info) {
      setIsDragging(true);
      setDragStart(info);
      setDragCurrent(info);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const info = getCellInfo(e);
      if (info && info.day === dragStart.day) {
        setDragCurrent(info);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragCurrent) {
      const startTimeIndex = Math.min(dragStart.timeIndex, dragCurrent.timeIndex);
      const endTimeIndex = Math.max(dragStart.timeIndex, dragCurrent.timeIndex);

      if (startTimeIndex !== endTimeIndex) {
        const newBlock = {
          id: Date.now(),
          day: dragStart.day,
          start: startTimeIndex,
          end: endTimeIndex + 1,
          title: '새 일정',
          description: '',
          categoryId: categories.length > 0 ? categories[0].id : null,
        };
        setSchedule(prev => ({ ...prev, [newBlock.id]: newBlock }));
        handleBlockClick(newBlock); // Open modal immediately after creation
      }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleBlockClick = (block) => {
    setEditingBlock(block);
    setBlockTitle(block.title);
    setBlockDescription(block.description || '');
    setBlockCategoryId(block.categoryId);
  };

  const handleSaveBlock = () => {
    if (editingBlock) {
      setSchedule(prev => ({
        ...prev,
        [editingBlock.id]: {
          ...editingBlock,
          title: blockTitle,
          description: blockDescription,
          categoryId: blockCategoryId,
        }
      }));
    }
    setEditingBlock(null);
  };

  const handleDeleteBlock = () => {
    if (editingBlock && window.confirm(`'${editingBlock.title}' 일정을 삭제하시겠습니까?`)) {
      setSchedule(prev => {
        const newSchedule = { ...prev };
        delete newSchedule[editingBlock.id];
        return newSchedule;
      });
    }
    setEditingBlock(null);
  };
  
  // --- CATEGORY MANAGEMENT ---
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (editingCategory.id) { // Update existing category
      setCategories(categories.map(cat => cat.id === editingCategory.id ? editingCategory : cat));
    } else { // Add new category
      setCategories([...categories, { ...editingCategory, id: Date.now() }]);
    }
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('카테고리를 삭제하면 해당 카테고리의 모든 일정이 기본값으로 변경됩니다. 계속하시겠습니까?')) {
        // Find a fallback category (or null if none exist)
        const fallbackCategoryId = categories.find(c => c.id !== categoryId)?.id || null;
        
        // Update schedule blocks using the deleted category
        const updatedSchedule = { ...schedule };
        Object.keys(updatedSchedule).forEach(blockId => {
            if (updatedSchedule[blockId].categoryId === categoryId) {
                updatedSchedule[blockId].categoryId = fallbackCategoryId;
            }
        });
        setSchedule(updatedSchedule);

        // Delete the category
        setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };


  // --- RENDER FUNCTIONS ---
  const renderBlocks = () => {
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const totalMinutes = 20 * 60; // Total minutes from 5:00 to 01:00

    return Object.values(schedule).map(block => {
      const top = (block.start * 10 / (totalMinutes / 10 * 10)) * 100 * 2;
      const height = ((block.end - block.start) * 10 / (totalMinutes / 10 * 10)) * 100 * 2;
      const left = (days.indexOf(block.day) / 7) * 100;
      const width = 100 / 7;
      
      const category = categoryMap.get(block.categoryId);
      const backgroundColor = category ? category.color : '#808080'; // Default gray

      return (
        <div
          key={block.id}
          className="schedule-block"
          style={{ top: `${top}%`, height: `${height}%`, left: `${left}%`, width: `${width}%`, backgroundColor }}
          onClick={() => handleBlockClick(block)}
        >
          {block.title}
        </div>
      );
    });
  };

  const renderDragPreview = () => {
    if (!isDragging || !dragStart || !dragCurrent) return null;
    const totalMinutes = 20 * 60;
    const startIdx = Math.min(dragStart.timeIndex, dragCurrent.timeIndex);
    const endIdx = Math.max(dragStart.timeIndex, dragCurrent.timeIndex);

    const top = (startIdx * 10 / (totalMinutes / 10 * 10)) * 100 * 2;
    const height = ((endIdx - startIdx + 1) * 10 / (totalMinutes / 10 * 10)) * 100 * 2;
    const left = (days.indexOf(dragStart.day) / 7) * 100;
    const width = 100 / 7;

    return <div className="drag-preview" style={{ top: `${top}%`, height: `${height}%`, left: `${left}%`, width: `${width}%` }} />;
  };

  return (
    <>
      <div className="timetable-container-dnd">
        <h3>시간표</h3>
        <p className="timetable-guide">빈 공간을 드래그하여 새 일정을 추가하세요. 생성된 일정은 클릭하여 수정/삭제할 수 있습니다.</p>
        <div className="day-header">
          <div className="time-column-header"></div> {/* Empty cell for alignment */}
          {days.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="timetable-grid">
          <div className="time-column">
            {hours.map(hour => <div key={hour} className="time-label">{`${hour}:00`}</div>)}
          </div>
          <div
            className="schedule-area"
            ref={timetableRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {renderBlocks()}
            {renderDragPreview()}
          </div>
        </div>
      </div>

      {/* Category Management Section */}
      <div className="category-manager">
          <div className="category-header">
            <h4>카테고리</h4>
            <button onClick={() => { setEditingCategory({ name: '', color: '#e74c3c' }); setShowCategoryManager(true); }}>+ 추가</button>
          </div>
          <div className="category-list">
              {categories.map(cat => (
                  <div key={cat.id} className="category-item" onClick={() => { setEditingCategory(cat); setShowCategoryManager(true); }}>
                      <span className="category-color-dot" style={{ backgroundColor: cat.color }}></span>
                      <span className="category-name">{cat.name}</span>
                  </div>
              ))}
          </div>
      </div>


      {/* Edit Schedule Block Modal */}
      {editingBlock && (
        <div className="modal-overlay" onClick={() => setEditingBlock(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>일정 수정</h4>
            <input type="text" value={blockTitle} onChange={(e) => setBlockTitle(e.target.value)} placeholder="일정 제목" autoFocus />
            <textarea value={blockDescription} onChange={(e) => setBlockDescription(e.target.value)} placeholder="세부 설명" rows="3" />
            <div className="category-selector">
                <label>카테고리 선택</label>
                <div className="category-options">
                    {categories.map(cat => (
                        <div key={cat.id} className={`category-option ${blockCategoryId === cat.id ? 'selected' : ''}`} onClick={() => setBlockCategoryId(cat.id)}>
                            <span className="category-color-dot" style={{ backgroundColor: cat.color }}></span>
                            {cat.name}
                        </div>
                    ))}
                    {categories.length === 0 && <p className="no-category-message">생성된 카테고리가 없습니다. 아래에서 카테고리를 추가해주세요.</p>}
                </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveBlock}>저장</button>
              <button className="delete" onClick={handleDeleteBlock}>삭제</button>
              <button className="cancel" onClick={() => setEditingBlock(null)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showCategoryManager && editingCategory && (
        <div className="modal-overlay" onClick={() => { setShowCategoryManager(false); setEditingCategory(null); }}>
          <form className="modal-content" onSubmit={handleSaveCategory} onClick={(e) => e.stopPropagation()}>
              <h4>{editingCategory.id ? '카테고리 수정' : '새 카테고리 추가'}</h4>
              <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} placeholder="카테고리 이름" required />
              <label>색상 선택</label>
              <div className="color-palette">
                  {availableColors.map(color => (
                      <div
                          key={color}
                          onClick={() => setEditingCategory({...editingCategory, color})}
                          className={`color-swatch ${editingCategory.color === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                      />
                  ))}
              </div>
              <div className="modal-actions">
                  <button type="submit">저장</button>
                  {editingCategory.id && <button type="button" className="delete" onClick={() => handleDeleteCategory(editingCategory.id)}>삭제</button>}
                  <button type="button" className="cancel" onClick={() => { setShowCategoryManager(false); setEditingCategory(null); }}>취소</button>
              </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Timetable;