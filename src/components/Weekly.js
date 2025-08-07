import React, { useState, useEffect } from 'react';

const Weekly = ({ data, updateData }) => {
  // --- 기존 상태 변수들 ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: '', subGoals: [] });
  const [newSubGoal, setNewSubGoal] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSubGoal, setDraggedSubGoal] = useState(null);
  const [draggedFromGoal, setDraggedFromGoal] = useState(null);
  const [editingSubGoal, setEditingSubGoal] = useState(null);
  const [editingSubGoalText, setEditingSubGoalText] = useState('');

  // --- 오늘 할 일 (Today's To-Do) 상태 변수들 ---
  const [todayTodos, setTodayTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showTodoInput, setShowTodoInput] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState(new Date().toDateString());

  // --- 일정 관리 상태 변수들 ---
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    return startOfWeek.toISOString().split('T')[0];
  });
  const [newEvent, setNewEvent] = useState({ title: '', time: '', description: '' });
  const [editingEvent, setEditingEvent] = useState(null);

  // --- 오늘 할 일 초기화 및 데이터 동기화 로직 ---
  useEffect(() => {
    const today = new Date().toDateString();

    if (data.todayTodosDate !== today) {
      updateData({
        ...data,
        todayTodos: [],
        todayTodosDate: today
      });
      setTodayTodos([]);
    } else {
      setTodayTodos(data.todayTodos || []);
    }
    setLastCheckDate(today);

    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastCheckDate) {
        setTodayTodos([]);
        updateData({
          ...data,
          todayTodos: [],
          todayTodosDate: currentDate
        });
        setLastCheckDate(currentDate);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [data.todayTodos, data.todayTodosDate, lastCheckDate, updateData]);

  // --- 오늘 할 일 관련 함수들 ---
  const saveTodayTodos = (todos) => {
    const today = new Date().toDateString();
    setTodayTodos(todos);
    updateData({
      ...data,
      todayTodos: todos,
      todayTodosDate: today
    });
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      const updatedTodos = [...todayTodos, todo];
      saveTodayTodos(updatedTodos);
      setNewTodo('');
      setShowTodoInput(false);
    }
  };

  const toggleTodo = (todoId) => {
    const updatedTodos = todayTodos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodayTodos(updatedTodos);
  };

  const removeTodo = (todoId) => {
    const updatedTodos = todayTodos.filter(todo => todo.id !== todoId);
    saveTodayTodos(updatedTodos);
  };

  const getTodayProgress = () => {
    if (!todayTodos || todayTodos.length === 0) return 0;
    const completed = todayTodos.filter(todo => todo.completed).length;
    return Math.round((completed / todayTodos.length) * 100);
  };
  
  // --- 기존 함수들 (수정 없음) ---
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
        weeklyGoals: [...(data.weeklyGoals || []), goal]
      });
      
      setNewGoal({ title: '', subGoals: [] });
      setShowAddForm(false);
    }
  };

  const editGoal = (goalId) => {
    const goal = data.weeklyGoals.find(g => g.id === goalId);
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
      const updatedGoals = data.weeklyGoals.map(goal => {
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
        weeklyGoals: updatedGoals
      });
      
      setNewGoal({ title: '', subGoals: [] });
      setShowAddForm(false);
      setEditingGoal(null);
    }
  };

  const toggleMainGoal = (goalId) => {
    const updatedGoals = data.weeklyGoals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    });
    
    updateData({
      ...data,
      weeklyGoals: updatedGoals
    });
  };

  const removeGoal = (goalId) => {
    updateData({
      ...data,
      weeklyGoals: data.weeklyGoals.filter(goal => goal.id !== goalId)
    });
  };

  const toggleSubGoal = (goalId, subGoalId) => {
    const updatedGoals = data.weeklyGoals.map(goal => {
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
      weeklyGoals: updatedGoals
    });
  };

  const startEditingSubGoal = (goalId, subGoalId, currentText) => {
    setEditingSubGoal({ goalId, subGoalId });
    setEditingSubGoalText(currentText);
  };

  const saveSubGoalEdit = () => {
    if (editingSubGoal && editingSubGoalText.trim()) {
      const updatedGoals = data.weeklyGoals.map(goal => {
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
        weeklyGoals: updatedGoals
      });
    }
    
    setEditingSubGoal(null);
    setEditingSubGoalText('');
  };

  const cancelSubGoalEdit = () => {
    setEditingSubGoal(null);
    setEditingSubGoalText('');
  };

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

  const formatEventTime = (time) => {
    if (!time) return '';
    return time;
  };

  const getCurrentWeekRange = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  };

  const getCurrentWeekEvents = () => {
    const { start, end } = getCurrentWeekRange();
    return data.events?.filter(event => {
      return event.date >= start && event.date <= end;
    }) || [];
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
    if (!data.weeklyGoals || data.weeklyGoals.length === 0) return 0;
    
    const totalTasks = data.weeklyGoals.reduce((sum, goal) => {
      return sum + (goal.subGoals ? goal.subGoals.length : 1);
    }, 0);
    
    const completedTasks = data.weeklyGoals.reduce((sum, goal) => {
      if (goal.subGoals && goal.subGoals.length > 0) {
        return sum + goal.subGoals.filter(sub => sub.completed).length;
      }
      return sum + (goal.completed ? 1 : 0);
    }, 0);
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

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

    const newGoals = [...data.weeklyGoals];
    const draggedGoal = newGoals[draggedItem];
    
    newGoals.splice(draggedItem, 1);
    newGoals.splice(dropIndex, 0, draggedGoal);
    
    updateData({
      ...data,
      weeklyGoals: newGoals
    });
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedSubGoal(null);
    setDraggedFromGoal(null);
  };

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

    const updatedGoals = data.weeklyGoals.map(goal => {
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
      weeklyGoals: updatedGoals
    });
    
    setDraggedSubGoal(null);
    setDraggedFromGoal(null);
  };

  const renderWeeklyCalendar = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    
    const days = [];
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const isToday = currentDate.toDateString() === today.toDateString();
      
      days.push(
        <div key={i} className={`calendar-day ${isToday ? 'today' : 'current-week'}`}>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{dayNames[i]}</div>
          <div>{currentDate.getDate()}</div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="weekly-page-wrapper">
      <div className="today-todo-container">
        <h3 className="today-todo-title">오늘 할 일</h3>
        <div className="today-progress-bar">
          <div 
            className="today-progress-fill" 
            style={{ width: `${getTodayProgress()}%` }}
          ></div>
        </div>
        <span className="today-progress-text">{getTodayProgress()}% 달성</span>

        <div className="todo-list">
          {todayTodos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                className="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span className="todo-text">{todo.text}</span>
              <button
                className="remove-todo-btn"
                onClick={() => removeTodo(todo.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {showTodoInput ? (
          <div className="todo-add-form">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="새로운 할 일 입력..."
              autoFocus
            />
            <div className="todo-form-buttons">
              <button onClick={addTodo} className="todo-save-btn">추가</button>
              <button onClick={() => setShowTodoInput(false)} className="todo-cancel-btn">취소</button>
            </div>
          </div>
        ) : (
          <button className="add-todo-btn" onClick={() => setShowTodoInput(true)}>
            + 할 일 추가
          </button>
        )}
      </div>

      <div className="page-container weekly-main-content">
        <h1 className="page-title">주간 목표</h1>
        
        <div className="weekly-container">
          <div className="goals-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>이번 주 할 일</h3>
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
                    placeholder="새로운 주간 목표를 입력하세요"
                  />
                </div>
                
                <div className="form-group">
                  <label>하위 목표</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
            
            {data.weeklyGoals && data.weeklyGoals.map((goal, index) => (
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
                이번 주 총 달성률: {getTotalProgress()}%
              </div>
            </div>
          </div>
          
          <div>
            <div className="calendar-mini" style={{ marginBottom: '1rem' }}>
              <div className="calendar-header">이번 주</div>
              <div className="calendar-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {renderWeeklyCalendar()}
              </div>
            </div>
            
            <div className="calendar-mini">
              <div className="calendar-header">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
              </div>
              <div className="calendar-grid">
                {(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = today.getMonth();
                  
                  const firstDay = new Date(year, month, 1);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  
                  dayNames.forEach(day => {
                    days.push(
                      <div key={day} className="calendar-day header">
                        {day}
                      </div>
                    );
                  });
                  
                  for (let i = 0; i < 42; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    
                    const isToday = currentDate.toDateString() === today.toDateString();
                    const isCurrentMonth = currentDate.getMonth() === month;
                    
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    
                    const isCurrentWeek = currentDate >= startOfWeek && currentDate <= endOfWeek;
                    
                    days.push(
                      <div
                        key={i}
                        className={`calendar-day ${isToday ? 'today' : ''} ${isCurrentWeek && isCurrentMonth ? 'current-week' : ''}`}
                        style={{ opacity: isCurrentMonth ? 1 : 0.3 }}
                      >
                        {currentDate.getDate()}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>

            <div className="events-section" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.3rem' }}>이번 주 일정</h3>
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
                {(() => {
                  const currentWeekEvents = getCurrentWeekEvents();
                  return currentWeekEvents.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color)', opacity: 0.7 }}>
                      이번 주에 등록된 일정이 없습니다.
                    </div>
                  ) : (
                    currentWeekEvents
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
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weekly;
