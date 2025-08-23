import React, { useState } from 'react';

const Monthly = ({ data, updateData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: '', subGoals: [] });
  const [newSubGoal, setNewSubGoal] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSubGoal, setDraggedSubGoal] = useState(null);
  const [draggedFromGoal, setDraggedFromGoal] = useState(null);
  const [editingSubGoal, setEditingSubGoal] = useState(null);
  const [editingSubGoalText, setEditingSubGoalText] = useState('');
  
  // 일정 관리 상태
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEvent, setNewEvent] = useState({ title: '', time: '', description: '' });
  const [editingEvent, setEditingEvent] = useState(null);

  const addGoal = () => {
    if (newGoal.title.trim()) {
      const goal = {
        id: Date.now(),
        title: newGoal.title,
        subGoals: newGoal.subGoals.map((sub, index) => ({
          id: Date.now() + index,
          title: sub,
          completed: false
        })),
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      updateData({
        ...data,
        monthlyGoals: [...(data.monthlyGoals || []), goal]
      });
      
      setNewGoal({ title: '', subGoals: [] });
      setShowAddForm(false);
    }
  };

  const editGoal = (goalId) => {
    const goal = data.monthlyGoals.find(g => g.id === goalId);
    if (goal) {
      setEditingGoal(goalId);
      setNewGoal({
        title: goal.title,
        subGoals: goal.subGoals.map(sub => sub.title)
      });
      setShowAddForm(true);
    }
  };

  const updateGoal = () => {
    if (newGoal.title.trim() && editingGoal) {
      const updatedGoals = data.monthlyGoals.map(goal => {
        if (goal.id === editingGoal) {
          return {
            ...goal,
            title: newGoal.title,
            subGoals: newGoal.subGoals.map((sub, index) => ({
              id: goal.subGoals[index]?.id || Date.now() + index,
              title: sub,
              completed: goal.subGoals[index]?.completed || false
            }))
          };
        }
        return goal;
      });
      
      updateData({
        ...data,
        monthlyGoals: updatedGoals
      });
      
      setNewGoal({ title: '', subGoals: [] });
      setShowAddForm(false);
      setEditingGoal(null);
    }
  };

  const toggleMainGoal = (goalId) => {
    const updatedGoals = data.monthlyGoals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    });
    
    updateData({
      ...data,
      monthlyGoals: updatedGoals
    });
  };

  const removeGoal = (goalId) => {
    updateData({
      ...data,
      monthlyGoals: data.monthlyGoals.filter(goal => goal.id !== goalId)
    });
  };

  const toggleSubGoal = (goalId, subGoalId) => {
    const updatedGoals = data.monthlyGoals.map(goal => {
      if (goal.id === goalId) {
        const updatedSubGoals = goal.subGoals.map(sub => 
          sub.id === subGoalId ? { ...sub, completed: !sub.completed } : sub
        );
        return { ...goal, subGoals: updatedSubGoals };
      }
      return goal;
    });
    
    updateData({
      ...data,
      monthlyGoals: updatedGoals
    });
  };

  const startEditingSubGoal = (goalId, subGoalId, currentText) => {
    setEditingSubGoal({ goalId, subGoalId });
    setEditingSubGoalText(currentText);
  };

  const saveSubGoalEdit = () => {
    if (editingSubGoal && editingSubGoalText.trim()) {
      const updatedGoals = data.monthlyGoals.map(goal => {
        if (goal.id === editingSubGoal.goalId) {
          const updatedSubGoals = goal.subGoals.map(sub => 
            sub.id === editingSubGoal.subGoalId 
              ? { ...sub, title: editingSubGoalText.trim() } 
              : sub
          );
          return { ...goal, subGoals: updatedSubGoals };
        }
        return goal;
      });
      
      updateData({
        ...data,
        monthlyGoals: updatedGoals
      });
    }
    
    setEditingSubGoal(null);
    setEditingSubGoalText('');
  };

  const cancelSubGoalEdit = () => {
    setEditingSubGoal(null);
    setEditingSubGoalText('');
  };

  // 일정 관리 함수들 (Weekly와 동일)
  const addEvent = () => {
    if (newEvent.title.trim() && selectedDate) {
      const event = {
        id: Date.now(),
        date: selectedDate,
        title: newEvent.title.trim(),
        time: newEvent.time,
        description: newEvent.description.trim(),
        createdAt: new Date().toISOString()
      };
      
      updateData({
        ...data,
        events: [...(data.events || []), event]
      });
      
      setNewEvent({ title: '', time: '', description: '' });
      setShowEventForm(false);
    }
  };

  const updateEvent = () => {
    if (editingEvent && newEvent.title.trim() && selectedDate) {
      const updatedEvents = data.events?.map(event =>
        event.id === editingEvent.id
          ? {
              ...event,
              date: selectedDate,
              title: newEvent.title.trim(),
              time: newEvent.time,
              description: newEvent.description.trim(),
              updatedAt: new Date().toISOString()
            }
          : event
      ) || [];

      updateData({ ...data, events: updatedEvents });
      
      setNewEvent({ title: '', time: '', description: '' });
      setEditingEvent(null);
      setShowEventForm(false);
    }
  };

  const editEvent = (event) => {
    setNewEvent({
      title: event.title,
      time: event.time || '',
      description: event.description || ''
    });
    setSelectedDate(event.date);
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const deleteEvent = (eventId) => {
    updateData({
      ...data,
      events: data.events?.filter(event => event.id !== eventId) || []
    });
  };

  // const getEventsForDate = (date) => {
  //   return data.events?.filter(event => event.date === date) || [];
  // };

  const formatEventTime = (time) => {
    if (!time) return '';
    return time;
  };

  const addSubGoal = () => {
    if (newSubGoal.trim()) {
      setNewGoal({
        ...newGoal,
        subGoals: [...newGoal.subGoals, newSubGoal.trim()]
      });
      setNewSubGoal('');
    }
  };

  const removeSubGoal = (index) => {
    setNewGoal({
      ...newGoal,
      subGoals: newGoal.subGoals.filter((_, i) => i !== index)
    });
  };

  const getGoalProgress = (goal) => {
    if (!goal.subGoals || goal.subGoals.length === 0) {
      return goal.completed ? 100 : 0;
    }
    
    const completed = goal.subGoals.filter(sub => sub.completed).length;
    return Math.round((completed / goal.subGoals.length) * 100);
  };

  const getTotalProgress = () => {
    if (!data.monthlyGoals || data.monthlyGoals.length === 0) return 0;
    
    const totalProgress = data.monthlyGoals.reduce((sum, goal) => {
      return sum + getGoalProgress(goal);
    }, 0);
    
    return Math.round(totalProgress / data.monthlyGoals.length);
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

    const newGoals = [...data.monthlyGoals];
    const draggedGoal = newGoals[draggedItem];
    
    // 드래그된 아이템 제거
    newGoals.splice(draggedItem, 1);
    
    // 새 위치에 삽입
    newGoals.splice(dropIndex, 0, draggedGoal);
    
    updateData({
      ...data,
      monthlyGoals: newGoals
    });
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedSubGoal(null);
    setDraggedFromGoal(null);
  };

  // 하위 목표 드래그 앤 드롭 핸들러
  const handleSubGoalDragStart = (e, goalId, subGoalIndex) => {
    setDraggedSubGoal(subGoalIndex);
    setDraggedFromGoal(goalId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSubGoalDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSubGoalDrop = (e, goalId, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedSubGoal === null || draggedFromGoal !== goalId || draggedSubGoal === dropIndex) {
      setDraggedSubGoal(null);
      setDraggedFromGoal(null);
      return;
    }

    const updatedGoals = data.monthlyGoals.map(goal => {
      if (goal.id === goalId) {
        const newSubGoals = [...goal.subGoals];
        const draggedSubGoalItem = newSubGoals[draggedSubGoal];
        
        newSubGoals.splice(draggedSubGoal, 1);
        const adjustedDropIndex = draggedSubGoal < dropIndex ? dropIndex - 1 : dropIndex;
        newSubGoals.splice(adjustedDropIndex, 0, draggedSubGoalItem);
        
        return { ...goal, subGoals: newSubGoals };
      }
      return goal;
    });
    
    updateData({
      ...data,
      monthlyGoals: updatedGoals
    });
    
    setDraggedSubGoal(null);
    setDraggedFromGoal(null);
  };

  const renderMonthlyCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0); // 사용하지 않는 변수 주석 처리
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 요일 헤더
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="calendar-day header">
          {day}
        </div>
      );
    });
    
    // 날짜들
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isToday = currentDate.toDateString() === today.toDateString();
      const isCurrentMonth = currentDate.getMonth() === month;
      
      days.push(
        <div
          key={i}
          className={`calendar-day ${isToday ? 'today' : ''}`}
          style={{ opacity: isCurrentMonth ? 1 : 0.3 }}
        >
          {currentDate.getDate()}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">월간 목표</h1>
      
      <div className="weekly-container">
        <div className="goals-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>이번 달 목표</h3>
            <button 
              className="action-btn add-btn"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingGoal(null);
                setNewGoal({ title: '', subGoals: [] });
              }}
              title="새 목표 추가"
            >
              +
            </button>
          </div>
          
          {showAddForm && (
            <div className="add-goal-form">
              <div className="form-group">
                <label>목표 제목</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="새로운 월간 목표를 입력하세요"
                />
              </div>
              
              <div className="form-group">
                <label>하위 목표</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={newSubGoal}
                    onChange={(e) => setNewSubGoal(e.target.value)}
                    placeholder="하위 목표를 입력하세요"
                    onKeyPress={(e) => e.key === 'Enter' && addSubGoal()}
                  />
                  <button 
                    type="button" 
                    className="action-btn add-btn"
                    onClick={addSubGoal}
                    title="하위 목표 추가"
                  >
                    +
                  </button>
                </div>
                
                {newGoal.subGoals.map((sub, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    margin: '0.5rem 0'
                  }}>
                    <span>• {sub}</span>
                    <button 
                      className="action-btn remove-btn"
                      onClick={() => removeSubGoal(index)}
                      title="하위 목표 삭제"
                    >
                      -
                    </button>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="submit-btn" onClick={editingGoal ? updateGoal : addGoal}>
                  {editingGoal ? '목표 수정' : '목표 추가'}
                </button>
                {showAddForm && (
                  <button 
                    className="submit-btn" 
                    style={{ background: 'var(--accent-color)' }}
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingGoal(null);
                      setNewGoal({ title: '', subGoals: [] });
                    }}
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          )}
          
          {data.monthlyGoals && data.monthlyGoals.map((goal, index) => (
            <div 
              key={goal.id} 
              className={`goal-item ${draggedItem === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle" title="드래그해서 순서 변경">
                ⋮⋮
              </div>
              <div className="goal-content">
                <div className="goal-title">
                  {goal.subGoals && goal.subGoals.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleMainGoal(goal.id)}
                      />
                      <span style={{ textDecoration: goal.completed ? 'line-through' : 'none' }}>
                        {goal.title}
                      </span>
                    </div>
                  ) : (
                    goal.title
                  )}
                </div>
                {goal.subGoals && goal.subGoals.length > 0 && (
                  <div className="sub-goals">
                    {goal.subGoals.map((sub, subIndex) => (
                      <div 
                        key={sub.id} 
                        className={`sub-goal ${draggedSubGoal === subIndex && draggedFromGoal === goal.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleSubGoalDragStart(e, goal.id, subIndex)}
                        onDragOver={handleSubGoalDragOver}
                        onDrop={(e) => handleSubGoalDrop(e, goal.id, subIndex)}
                        onDragEnd={handleDragEnd}
                        style={{
                          cursor: 'move',
                          opacity: draggedSubGoal === subIndex && draggedFromGoal === goal.id ? 0.5 : 1,
                          border: draggedSubGoal === subIndex && draggedFromGoal === goal.id ? '2px dashed #007bff' : 'none',
                          padding: '5px',
                          margin: '2px 0',
                          borderRadius: '4px',
                          backgroundColor: draggedSubGoal === subIndex && draggedFromGoal === goal.id ? '#f8f9fa' : 'transparent'
                        }}
                      >
                        <span style={{ 
                          cursor: 'move', 
                          marginRight: '8px',
                          color: '#666',
                          fontSize: '12px'
                        }}>
                          ⋮⋮
                        </span>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={sub.completed}
                          onChange={() => toggleSubGoal(goal.id, sub.id)}
                        />
                        {editingSubGoal && 
                         editingSubGoal.goalId === goal.id && 
                         editingSubGoal.subGoalId === sub.id ? (
                          <input
                            type="text"
                            value={editingSubGoalText}
                            onChange={(e) => setEditingSubGoalText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                saveSubGoalEdit();
                              } else if (e.key === 'Escape') {
                                cancelSubGoalEdit();
                              }
                            }}
                            onBlur={saveSubGoalEdit}
                            autoFocus
                            style={{
                              background: 'var(--bg-color)',
                              border: '1px solid var(--primary-color)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              color: 'var(--text-color)',
                              fontSize: 'inherit'
                            }}
                          />
                        ) : (
                          <span 
                            style={{ 
                              textDecoration: sub.completed ? 'line-through' : 'none',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              transition: 'background-color 0.2s'
                            }}
                            onClick={() => startEditingSubGoal(goal.id, sub.id, sub.title)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                            }}
                            title="클릭하여 수정"
                          >
                            {sub.title}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="goal-progress">{getGoalProgress(goal)}%</div>
              <div className="goal-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => editGoal(goal.id)}
                  title="수정"
                >
                  ✏️
                </button>
                <button 
                  className="action-btn remove-btn"
                  onClick={() => removeGoal(goal.id)}
                  title="삭제"
                >
                  -
                </button>
              </div>
            </div>
          ))}
          
          <div className="total-progress">
            <div className="progress-text">
              이번 달 총 달성률: {getTotalProgress()}%
            </div>
          </div>
        </div>
        
        <div>
          <div className="calendar-mini">
            <div className="calendar-header">
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </div>
            <div className="calendar-grid">
              {renderMonthlyCalendar()}
            </div>
          </div>

          {/* 일정 관리 섹션 */}
          <div className="events-section" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.3rem' }}>일정 관리</h3>
              <button 
                className="action-btn add-btn"
                onClick={() => {
                  setShowEventForm(!showEventForm);
                  setEditingEvent(null);
                  setNewEvent({ title: '', time: '', description: '' });
                }}
                title="새 일정 추가"
              >
                +
              </button>
            </div>

            {showEventForm && (
              <div className="add-goal-form" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>일정 제목</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="일정 제목을 입력하세요"
                  />
                </div>
                
                <div className="form-group">
                  <label>시간 (선택사항)</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>설명 (선택사항)</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="일정에 대한 설명을 입력하세요"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      background: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="save-btn"
                    onClick={editingEvent ? updateEvent : addEvent}
                  >
                    {editingEvent ? '수정' : '추가'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
                      setNewEvent({ title: '', time: '', description: '' });
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            <div className="events-list">
              {data.events?.length === 0 || !data.events ? (
                <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color)', opacity: 0.7 }}>
                  아직 등록된 일정이 없습니다.
                </div>
              ) : (
                data.events
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((event) => (
                    <div key={event.id} className="event-card" style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      transition: 'all 0.2s ease'
                    }}>
                      <div className="event-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <h4 style={{ color: 'var(--primary-color)', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                            {event.title}
                          </h4>
                          <div style={{ color: 'var(--secondary-color)', fontSize: '0.9rem' }}>
                            📅 {new Date(event.date).toLocaleDateString('ko-KR')}
                            {event.time && ` • 🕐 ${formatEventTime(event.time)}`}
                          </div>
                        </div>
                        <div className="event-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => editEvent(event)}
                            title="일정 수정"
                            style={{ fontSize: '0.8rem' }}
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteEvent(event.id)}
                            title="일정 삭제"
                            style={{ fontSize: '0.8rem' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {event.description && (
                        <div className="event-description" style={{
                          color: 'var(--text-color)',
                          fontSize: '0.9rem',
                          opacity: 0.8,
                          marginTop: '0.5rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid var(--border-color)'
                        }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monthly;
