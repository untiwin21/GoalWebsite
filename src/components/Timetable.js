import React, { useState, useEffect, useRef } from 'react';

// --- Helper Components ---

// Modal for adding/editing a schedule block
const ScheduleBlockModal = ({ block, categories, onSave, onDelete, onCancel }) => {
    const [title, setTitle] = useState(block.title);
    const [description, setDescription] = useState(block.description || '');
    const [categoryId, setCategoryId] = useState(block.categoryId);

    const handleSave = () => {
        onSave({ ...block, title, description, categoryId });
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h4>일정 수정</h4>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정 제목" autoFocus />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="세부 설명" rows="3" />
                <div className="category-selector">
                    <label>카테고리 선택</label>
                    <div className="category-options">
                        {categories.map(cat => (
                            <div key={cat.id} className={`category-option ${categoryId === cat.id ? 'selected' : ''}`} onClick={() => setCategoryId(cat.id)}>
                                <span className="category-color-dot" style={{ backgroundColor: cat.color }}></span>
                                {cat.name}
                            </div>
                        ))}
                        {categories.length === 0 && <p className="no-category-message">생성된 카테고리가 없습니다. 아래에서 카테고리를 추가해주세요.</p>}
                    </div>
                </div>
                <div className="modal-actions">
                    <button onClick={handleSave}>저장</button>
                    <button className="delete" onClick={() => onDelete(block)}>삭제</button>
                    <button className="cancel" onClick={onCancel}>취소</button>
                </div>
            </div>
        </div>
    );
};

// Modal for adding/editing a category
const CategoryManagerModal = ({ category, onSave, onDelete, onCancel }) => {
    const [editingCategory, setEditingCategory] = useState(category);
    const availableColors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#1abc9c', '#d35400', '#c0392b'];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editingCategory);
    };
    
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <form className="modal-content" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                <h4>{category.id ? '카테고리 수정' : '새 카테고리 추가'}</h4>
                <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="카테고리 이름"
                    required
                />
                <label>색상 선택</label>
                <div className="color-palette">
                    {availableColors.map(color => (
                        <div
                            key={color}
                            onClick={() => setEditingCategory({ ...editingCategory, color: color })}
                            className={`color-swatch ${editingCategory.color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <div className="modal-actions">
                    <button type="submit">저장</button>
                    {category.id && <button type="button" className="delete" onClick={() => onDelete(category.id)}>삭제</button>}
                    <button type="button" className="cancel" onClick={onCancel}>취소</button>
                </div>
            </form>
        </div>
    );
};


const Timetable = () => {
  // --- STATE MANAGEMENT ---
  const [schedule, setSchedule] = useState(() => {
    try {
      const savedSchedule = localStorage.getItem('timetable_schedule');
      return savedSchedule ? JSON.parse(savedSchedule) : {};
    } catch (error) {
      return {};
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const savedCategories = localStorage.getItem('timetable_categories');
      return savedCategories ? JSON.parse(savedCategories) : [
        { id: 1, name: '수업', color: '#3498db' },
        { id: 2, name: '운동', color: '#2ecc71' },
        { id: 3, name: '스터디', color: '#f1c40f' },
      ];
    } catch (error) {
      return [];
    }
  });

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  
  // Modal & Form State
  const [editingBlock, setEditingBlock] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const timetableRef = useRef(null);

  // --- USE EFFECT HOOKS ---
  useEffect(() => {
    localStorage.setItem('timetable_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('timetable_categories', JSON.stringify(categories));
  }, [categories]);

  // --- CONSTANTS ---
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const hours = Array.from({ length: 20 }, (_, i) => i + 5);

  // --- EVENT HANDLERS (Drag and Drop) ---
  const getCellInfo = (e) => {
    if (!timetableRef.current) return null;
    const rect = timetableRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellWidth = rect.width / 7;
    const cellHeight = 10;
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
        setEditingBlock(newBlock);
      }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  // --- EVENT HANDLERS (CRUD) ---
  const handleSaveBlock = (updatedBlock) => {
    setSchedule(prev => ({ ...prev, [updatedBlock.id]: updatedBlock }));
    setEditingBlock(null);
  };

  const handleDeleteBlock = (blockToDelete) => {
    if (window.confirm(`'${blockToDelete.title}' 일정을 삭제하시겠습니까?`)) {
      setSchedule(prev => {
        const newSchedule = { ...prev };
        delete newSchedule[blockToDelete.id];
        return newSchedule;
      });
    }
    setEditingBlock(null);
  };
  
  const handleSaveCategory = (categoryToSave) => {
    if (categoryToSave.id) {
      setCategories(categories.map(cat => cat.id === categoryToSave.id ? categoryToSave : cat));
    } else {
      setCategories([...categories, { ...categoryToSave, id: Date.now() }]);
    }
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('카테고리를 삭제하면 해당 카테고리의 모든 일정이 기본값으로 변경됩니다. 계속하시겠습니까?')) {
        const fallbackCategoryId = categories.find(c => c.id !== categoryId)?.id || null;
        
        const updatedSchedule = { ...schedule };
        Object.keys(updatedSchedule).forEach(blockId => {
            if (updatedSchedule[blockId].categoryId === categoryId) {
                updatedSchedule[blockId].categoryId = fallbackCategoryId;
            }
        });
        setSchedule(updatedSchedule);
        setCategories(categories.filter(cat => cat.id !== categoryId));
    }
    setEditingCategory(null);
  };

  // --- RENDER FUNCTIONS ---
  const renderBlocks = () => {
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const totalMinutes = 20 * 60;

    return Object.values(schedule).map(block => {
      const top = (block.start * 10 / (totalMinutes / 10 * 10)) * 100 * 2;
      const height = ((block.end - block.start) * 10 / (totalMinutes / 10 * 10)) * 100 * 2;
      const left = (days.indexOf(block.day) / 7) * 100;
      const width = 100 / 7;
      
      const category = categoryMap.get(block.categoryId);
      const backgroundColor = category ? category.color : '#808080';

      return (
        <div
          key={block.id}
          className="schedule-block"
          style={{ top: `${top}%`, height: `${height}%`, left: `${left}%`, width: `${width}%`, backgroundColor }}
          onClick={() => setEditingBlock(block)}
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
        <p className="timetable-guide">빈 공간을 드래그하여 새 일정을 추가하세요.</p>
        <div className="day-header">
          <div className="time-column-header"></div>
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
      
      <div className="category-manager">
        <div className="category-add-button" onClick={() => setEditingCategory({ name: '', color: '#e74c3c' })}>
            <span className="plus-icon">+</span>
            <span>추가</span>
        </div>
        <div className="category-list">
            {categories.map(cat => (
                <div key={cat.id} className="category-item" onClick={() => setEditingCategory(cat)}>
                    <span className="category-color-dot" style={{ backgroundColor: cat.color }}></span>
                    <span className="category-name">{cat.name}</span>
                </div>
            ))}
        </div>
      </div>

      {editingBlock && (
        <ScheduleBlockModal
            block={editingBlock}
            categories={categories}
            onSave={handleSaveBlock}
            onDelete={handleDeleteBlock}
            onCancel={() => setEditingBlock(null)}
        />
      )}

      {editingCategory && (
        <CategoryManagerModal
            category={editingCategory}
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
            onCancel={() => setEditingCategory(null)}
        />
      )}
    </>
  );
};

export default Timetable;