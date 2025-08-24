import React, { useState, useEffect } from 'react';

// --- 날짜 관련 헬퍼 함수 ---

// 주어진 날짜가 해당 연도의 몇 번째 주인지 계산 (일요일 시작 기준)
const getWeekNumber = (d) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Find the first day of the year
  const yearStart = new Date(date.getFullYear(), 0, 1);
  // Find the day of the week for the first day of the year (0=Sun, 1=Mon,...)
  const firstDayOfWeek = yearStart.getDay();
  // Calculate the number of days past the first Sunday.
  const dayOfYear = ((date - yearStart) / 86400000) + 1;
  // Calculate the week number
  return Math.ceil((dayOfYear + firstDayOfWeek) / 7);
};

// 년도와 주차 정보를 가져오는 함수
const getWeekInfo = (date) => {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return { year, week };
};

const Weekly = ({ data, updateData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: '', subGoals: [] });
  const [newSubGoal, setNewSubGoal] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSubGoal, setDraggedSubGoal] = useState(null);
  const [draggedFromGoal, setDraggedFromGoal] = useState(null);
  const [editingSubGoal, setEditingSubGoal] = useState(null);
  const [editingSubGoalText, setEditingSubGoalText] = useState('');
  const [todayTodos, setTodayTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [showTodoInput, setShowTodoInput] = useState(false);
  const [draggedTodoIndex, setDraggedTodoIndex] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newEvent, setNewEvent] = useState({ title: '', time: '', description: '', status: 'pending' });
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // 기준 날짜 상태


  const getWeekDateRange = (baseDate) => {
      const d = new Date(baseDate);
      const dayOfWeek = d.getDay(); // 0 = Sunday
      const start = new Date(d);
      start.setDate(d.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
  };

  const [currentViewDate, setCurrentViewDate] = useState(new Date().toDateString());

  useEffect(() => {
    const dateKey = currentViewDate;
    const dailyTodos = data.dailyTodos || {};
    setTodayTodos(dailyTodos[dateKey] || []);
  }, [currentViewDate, data.dailyTodos]);


  const navigateWeek = (offset) => {
      setCurrentDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(newDate.getDate() + offset * 7);
          return newDate;
      });
  };

  const goToToday = () => {
      setCurrentDate(new Date());
      setCurrentViewDate(new Date().toDateString());
  };


  const addGoal = () => {
    if (newGoal.title.trim()) {
      const { year, week } = getWeekInfo(currentDate);

      const goal = {
        id: Date.now(),
        title: newGoal.title,
        subGoals: newGoal.subGoals.map((sub, index) => ({ id: Date.now() + index, title: sub, completed: false })),
        completed: false,
        createdAt: new Date().toISOString()
      };

      const newWeeklyGoals = { ...(data.weeklyGoals || {}) };
      if (!newWeeklyGoals[year]) newWeeklyGoals[year] = {};
      if (!newWeeklyGoals[year][week]) newWeeklyGoals[year][week] = [];
      newWeeklyGoals[year][week].push(goal);

      updateData({ ...data, weeklyGoals: newWeeklyGoals });
      setNewGoal({ title: '', subGoals: [] });
      setShowAddForm(false);
    }
  };

    const updateGoal = () => {
        if (newGoal.title.trim() && editingGoal) {
            const { year, week } = getWeekInfo(currentDate);
            const newWeeklyGoals = { ...data.weeklyGoals };
            const weekGoals = newWeeklyGoals[year]?.[week] || [];

            const updatedWeekGoals = weekGoals.map(goal =>
                goal.id === editingGoal ? {
                    ...goal,
                    title: newGoal.title,
                    subGoals: newGoal.subGoals.map((sub, index) => ({
                        id: goal.subGoals[index]?.id || Date.now() + index,
                        title: sub,
                        completed: goal.subGoals[index]?.completed || false
                    }))
                } : goal
            );

            if (!newWeeklyGoals[year]) newWeeklyGoals[year] = {};
            newWeeklyGoals[year][week] = updatedWeekGoals;
            updateData({ ...data, weeklyGoals: newWeeklyGoals });

            setNewGoal({ title: '', subGoals: [] });
            setShowAddForm(false);
            setEditingGoal(null);
        }
    };

    const removeGoal = (goalId) => {
        const { year, week } = getWeekInfo(currentDate);
        const newWeeklyGoals = { ...data.weeklyGoals };
        if (newWeeklyGoals[year]?.[week]) {
            newWeeklyGoals[year][week] = newWeeklyGoals[year][week].filter(g => g.id !== goalId);
            updateData({ ...data, weeklyGoals: newWeeklyGoals });
        }
    };
  const toggleMainGoal = (goalId) => {
    const { year, week } = getWeekInfo(currentDate);
    const newWeeklyGoals = { ...data.weeklyGoals };

    if (newWeeklyGoals[year]?.[week]) {
        newWeeklyGoals[year][week] = newWeeklyGoals[year][week].map(g =>
            g.id === goalId ? { ...g, completed: !g.completed } : g
        );
        updateData({ ...data, weeklyGoals: newWeeklyGoals });
    }
  };

  const toggleSubGoal = (goalId, subGoalId) => {
    const { year, week } = getWeekInfo(currentDate);
    const newWeeklyGoals = { ...data.weeklyGoals };
    if (newWeeklyGoals[year]?.[week]) {
        newWeeklyGoals[year][week] = newWeeklyGoals[year][week].map(goal => {
            if (goal.id === goalId) {
                return {
                    ...goal,
                    subGoals: goal.subGoals.map(sub =>
                        sub.id === subGoalId ? { ...sub, completed: !sub.completed } : sub
                    )
                };
            }
            return goal;
        });
        updateData({ ...data, weeklyGoals: newWeeklyGoals });
    }
  };

  const saveTodayTodos = (todos) => {
    const dateKey = currentViewDate;
    const newDailyTodos = { ...(data.dailyTodos || {}), [dateKey]: todos };
    updateData({ ...data, dailyTodos: newDailyTodos });
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo = { id: Date.now(), text: newTodo.trim(), completed: false, createdAt: new Date().toISOString() };
      saveTodayTodos([...todayTodos, todo]);
      setNewTodo('');
      setShowTodoInput(false);
    }
  };

  const editTodo = (todoId, newText) => {
    saveTodayTodos(todayTodos.map(todo =>
      todo.id === todoId ? { ...todo, text: newText } : todo
    ));
    setEditingTodo(null);
    setEditingTodoText('');
  };

  const toggleTodo = (todoId) => {
    saveTodayTodos(todayTodos.map(todo => todo.id === todoId ? { ...todo, completed: !todo.completed } : todo));
  };

  const removeTodo = (todoId) => {
    saveTodayTodos(todayTodos.filter(todo => todo.id !== todoId));
  };

  const getTodayProgress = () => {
    if (!todayTodos || todayTodos.length === 0) return 0;
    const completed = todayTodos.filter(todo => todo.completed).length;
    return Math.round((completed / todayTodos.length) * 100);
  };

  const handleTodoDragStart = (e, index) => setDraggedTodoIndex(index);
  const handleTodoDragOver = (e) => e.preventDefault();
  const handleTodoDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedTodoIndex === null || draggedTodoIndex === dropIndex) return;
    const newTodos = [...todayTodos];
    const [draggedItem] = newTodos.splice(draggedTodoIndex, 1);
    newTodos.splice(dropIndex, 0, draggedItem);
    saveTodayTodos(newTodos);
    setDraggedTodoIndex(null);
  };
  const handleTodoDragEnd = () => setDraggedTodoIndex(null);

  const editGoal = (goal) => {
    setEditingGoal(goal.id);
    setNewGoal({ title: goal.title, subGoals: goal.subGoals.map(s => s.title) });
    setShowAddForm(true);
  };

  const startEditingSubGoal = (goalId, subGoalId, currentText) => {
    setEditingSubGoal({ goalId, subGoalId });
    setEditingSubGoalText(currentText);
  };

    const saveSubGoalEdit = () => {
        if (editingSubGoal && editingSubGoalText.trim()) {
            const { year, week } = getWeekInfo(currentDate);
            const newWeeklyGoals = { ...data.weeklyGoals };

            if (newWeeklyGoals[year]?.[week]) {
                newWeeklyGoals[year][week] = newWeeklyGoals[year][week].map(goal => {
                    if (goal.id === editingSubGoal.goalId) {
                        return {
                            ...goal,
                            subGoals: goal.subGoals.map(sub =>
                                sub.id === editingSubGoal.subGoalId ? { ...sub, title: editingSubGoalText.trim() } : sub
                            )
                        };
                    }
                    return goal;
                });
                updateData({ ...data, weeklyGoals: newWeeklyGoals });
            }
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
        ...newEvent,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      updateData({ ...data, events: [...(data.events || []), event] });
      setNewEvent({ title: '', time: '', description: '', status: 'pending' });
      setShowEventForm(false);
    }
  };

  const updateEvent = () => {
    if (editingEvent && newEvent.title.trim() && selectedDate) {
      const updatedEvents = (data.events || []).map(event =>
        event.id === editingEvent.id ? {
          ...event,
          date: selectedDate,
          ...newEvent,
          updatedAt: new Date().toISOString()
        } : event
      );
      updateData({ ...data, events: updatedEvents });
      setNewEvent({ title: '', time: '', description: '', status: 'pending' });
      setEditingEvent(null);
      setShowEventForm(false);
    }
  };

  const editEvent = (event) => {
    setNewEvent({
      title: event.title,
      time: event.time || '',
      description: event.description || '',
      status: event.status || 'pending'
    });
    setSelectedDate(event.date);
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const updateEventStatus = (eventId, status) => {
    const updatedEvents = (data.events || []).map(event =>
      event.id === eventId ? { ...event, status, updatedAt: new Date().toISOString() } : event
    );
    updateData({ ...data, events: updatedEvents });
  };

  const deleteEvent = (eventId) => {
    updateData({ ...data, events: (data.events || []).filter(event => event.id !== eventId) });
  };

  const formatEventTime = (time) => time || '';

  const addSubGoal = () => {
    if (newSubGoal.trim()) {
      setNewGoal({ ...newGoal, subGoals: [...newGoal.subGoals, newSubGoal.trim()] });
      setNewSubGoal('');
    }
  };

  const removeSubGoal = (index) => {
    setNewGoal({ ...newGoal, subGoals: newGoal.subGoals.filter((_, i) => i !== index) });
  };

  const getGoalProgress = (goal) => {
    if (!goal.subGoals || goal.subGoals.length === 0) return goal.completed ? 100 : 0;
    const completed = goal.subGoals.filter(sub => sub.completed).length;
    return Math.round((completed / goal.subGoals.length) * 100);
  };

  const handleDragStart = (e, index) => setDraggedItem(index);
  const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === dropIndex) return;

        const { year, week } = getWeekInfo(currentDate);
        const newWeeklyGoals = { ...data.weeklyGoals };
        const weekGoals = newWeeklyGoals[year]?.[week] || [];

        const [draggedGoal] = weekGoals.splice(draggedItem, 1);
        weekGoals.splice(dropIndex, 0, draggedGoal);

        if (!newWeeklyGoals[year]) newWeeklyGoals[year] = {};
        newWeeklyGoals[year][week] = weekGoals;
        updateData({ ...data, weeklyGoals: newWeeklyGoals });
        setDraggedItem(null);
    };
  const handleDragEnd = () => setDraggedItem(null);

  const handleSubGoalDragStart = (e, goalId, subGoalIndex) => {
    setDraggedSubGoal(subGoalIndex);
    setDraggedFromGoal(goalId);
  };

  const handleSubGoalDragOver = (e) => {
    e.preventDefault();
  };

    const handleSubGoalDrop = (e, goalId, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedSubGoal === null || draggedFromGoal !== goalId || draggedSubGoal === dropIndex) return;

        const { year, week } = getWeekInfo(currentDate);
        const newWeeklyGoals = { ...data.weeklyGoals };

        if (newWeeklyGoals[year]?.[week]) {
            const goalIndex = newWeeklyGoals[year][week].findIndex(g => g.id === goalId);
            if (goalIndex > -1) {
                const newSubGoals = [...newWeeklyGoals[year][week][goalIndex].subGoals];
                const [draggedSub] = newSubGoals.splice(draggedSubGoal, 1);
                newSubGoals.splice(dropIndex, 0, draggedSub);
                newWeeklyGoals[year][week][goalIndex].subGoals = newSubGoals;
                updateData({ ...data, weeklyGoals: newWeeklyGoals });
            }
        }
        setDraggedSubGoal(null);
        setDraggedFromGoal(null);
    };

    const handleDateClick = (clickedDate) => {
        setCurrentDate(clickedDate);
        setCurrentViewDate(clickedDate.toDateString());
    };

  const renderMonthlyCalendar = () => {
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    dayNames.forEach(day => {
      days.push( <div key={`header-${day}`} className="calendar-day header"> {day} </div> );
    });

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isToday = date.toDateString() === today.toDateString();
      const isCurrentMonth = date.getMonth() === currentMonth;
      const { year, week } = getWeekInfo(date);
      const hasGoals = data.weeklyGoals?.[year]?.[week]?.length > 0;
      const isSelectedDate = currentViewDate === date.toDateString();

      days.push(
        <div
          key={i}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelectedDate ? 'selected-date' : ''} ${hasGoals ? 'has-goals' : ''}`}
          style={{ opacity: isCurrentMonth ? 1 : 0.3, cursor: 'pointer' }}
          onClick={() => handleDateClick(date)}
          title={hasGoals ? '이 주에 목표가 있습니다' : ''}
        >
          {date.getDate()}
          {hasGoals && <div className="goal-indicator">•</div>}
        </div>
      );
    }

    return days;
  };

  const { start, end } = getWeekDateRange(currentDate);
  const { year, week } = getWeekInfo(currentDate);
  const filteredGoals = data.weeklyGoals?.[year]?.[week] || [];
  const filteredEvents = (data.events || []).filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= start && eventDate <= end;
  });

  const getTotalProgress = () => {
    if (!filteredGoals || filteredGoals.length === 0) return 0;
    const totalTasks = filteredGoals.reduce((sum, goal) => sum + (goal.subGoals?.length || 1), 0);
    const completedTasks = filteredGoals.reduce((sum, goal) => {
      if (goal.subGoals?.length > 0) return sum + goal.subGoals.filter(s => s.completed).length;
      return sum + (goal.completed ? 1 : 0);
    }, 0);
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const weekTitle = `${start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}`;
  const currentViewDateFormatted = new Date(currentViewDate).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

    const isCurrentWeek = getWeekNumber(new Date()) === week && new Date().getFullYear() === year;


  return (
    <div className="weekly-page-wrapper">
      <div className="today-todo-container">
        <h3 className="today-todo-title">{currentViewDateFormatted} 할 일</h3>
        <div className="today-progress-bar">
          <div className="today-progress-fill" style={{ width: `${getTodayProgress()}%` }}></div>
        </div>
        <span className="today-progress-text">{getTodayProgress()}% 달성</span>
        <div className="todo-list">
        {todayTodos.map((todo, index) => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''} ${draggedTodoIndex === index ? 'dragging' : ''}`}
            draggable onDragStart={(e) => handleTodoDragStart(e, index)} onDragOver={handleTodoDragOver} onDrop={(e) => handleTodoDrop(e, index)} onDragEnd={handleTodoDragEnd}>
            <span className="todo-drag-handle" title="드래그해서 순서 변경">⋮⋮</span>
            <input type="checkbox" className="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
            {editingTodo === todo.id ? (
              <input
                type="text"
                value={editingTodoText}
                onChange={(e) => setEditingTodoText(e.target.value)}
                onBlur={() => editTodo(todo.id, editingTodoText)}
                onKeyPress={(e) => e.key === 'Enter' && editTodo(todo.id, editingTodoText)}
                autoFocus
              />
            ) : (
              <span className="todo-text" onClick={() => { setEditingTodo(todo.id); setEditingTodoText(todo.text); }}>{todo.text}</span>
            )}
            <button className="remove-todo-btn" onClick={() => removeTodo(todo.id)}>×</button>
          </div>
        ))}
      </div>
        {showTodoInput ? (
          <div className="todo-add-form">
            <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTodo()} placeholder="새로운 할 일 입력..." autoFocus />
            <div className="todo-form-buttons">
              <button onClick={addTodo} className="todo-save-btn">추가</button>
              <button onClick={() => setShowTodoInput(false)} className="todo-cancel-btn">취소</button>
            </div>
          </div>
        ) : (
          <button className="add-todo-btn" onClick={() => setShowTodoInput(true)}>+ 할 일 추가</button>
        )}
      </div>
      <div className="page-container weekly-main-content">
        <div className="week-navigation-modern">
          <button
            className="week-nav-btn prev-btn"
            onClick={() => navigateWeek(-1)}
            title="이전 주"
          >
            <span className="nav-icon">‹</span>
            <span className="nav-text">이전 주</span>
          </button>

          <div className="week-title-section">
            <h1 className="page-title">주간 목표</h1>
            <div className="week-info">
              <span className="week-date-range">{weekTitle}</span>
              <span className="week-status">
                 {isCurrentWeek ? "이번 주" : ""}
              </span>
              <button
                className="today-btn"
                onClick={goToToday}
                title="오늘 날짜로 이동"
              >
                오늘
              </button>
            </div>
          </div>

          <button
            className="week-nav-btn next-btn"
            onClick={() => navigateWeek(1)}
            title="다음 주"
          >
            <span className="nav-text">다음 주</span>
            <span className="nav-icon">›</span>
          </button>
        </div>
        <div className="weekly-container-grid">
          <div className="goals-section-left">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>{year}년 {week}주차 목표</h3>
              <button className="action-btn add-btn" onClick={() => { setShowAddForm(!showAddForm); setEditingGoal(null); setNewGoal({ title: '', subGoals: [] }); }} title="새 목표 추가">+</button>
            </div>
            {showAddForm && (
              <div className="add-goal-form">
                <div className="form-group">
                  <label>목표 제목</label>
                  <input type="text" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="새로운 주간 목표를 입력하세요" />
                </div>
                <div className="form-group">
                  <label>하위 목표</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="text" value={newSubGoal} onChange={(e) => setNewSubGoal(e.target.value)} placeholder="하위 목표를 입력하세요" onKeyPress={(e) => e.key === 'Enter' && addSubGoal()} />
                    <button type="button" className="action-btn add-btn" onClick={addSubGoal}>+</button>
                  </div>
                  {newGoal.subGoals.map((sub, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', margin: '0.5rem 0' }}>
                      <span>• {sub}</span>
                      <button className="action-btn remove-btn" onClick={() => removeSubGoal(index)} title="하위 목표 삭제">-</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="submit-btn" onClick={editingGoal ? updateGoal : addGoal}>{editingGoal ? '목표 수정' : '목표 추가'}</button>
                  {showAddForm && <button className="submit-btn" style={{ background: 'var(--accent-color)' }} onClick={() => { setShowAddForm(false); setEditingGoal(null); setNewGoal({ title: '', subGoals: [] }); }}>취소</button>}
                </div>
              </div>
            )}
            {filteredGoals.map((goal, index) => (
              <div key={goal.id} className={`goal-item ${draggedItem === index ? 'dragging' : ''}`} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd}>
                <div className="drag-handle" title="드래그해서 순서 변경">⋮⋮</div>
                <div className="goal-content">
                  <div className="goal-title">
                    {goal.subGoals?.length > 0 ? goal.title : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <input type="checkbox" className="checkbox" checked={goal.completed} onChange={() => toggleMainGoal(goal.id)} />
                        <span style={{ textDecoration: goal.completed ? 'line-through' : 'none' }}>{goal.title}</span>
                      </div>
                    )}
                  </div>
                  {goal.subGoals?.length > 0 && (
                    <div className="sub-goals">
                      {goal.subGoals.map((sub, subIndex) => (
                        <div key={sub.id} className={`sub-goal ${draggedSubGoal === subIndex && draggedFromGoal === goal.id ? 'dragging' : ''}`} draggable onDragStart={(e) => handleSubGoalDragStart(e, goal.id, subIndex)} onDragOver={handleSubGoalDragOver} onDrop={(e) => handleSubGoalDrop(e, goal.id, subIndex)} onDragEnd={handleDragEnd}>
                          <span style={{ cursor: 'move', marginRight: '8px', color: '#666', fontSize: '12px' }}>⋮⋮</span>
                          <input type="checkbox" className="checkbox" checked={sub.completed} onChange={() => toggleSubGoal(goal.id, sub.id)} />
                          {editingSubGoal?.goalId === goal.id && editingSubGoal?.subGoalId === sub.id ? (
                            <input type="text" value={editingSubGoalText} onChange={(e) => setEditingSubGoalText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' ? saveSubGoalEdit() : e.key === 'Escape' && cancelSubGoalEdit()} onBlur={saveSubGoalEdit} autoFocus style={{ background: 'var(--bg-color)', border: '1px solid var(--primary-color)', borderRadius: '4px', padding: '2px 6px', color: 'var(--text-color)', fontSize: 'inherit' }} />
                          ) : (
                            <span style={{ textDecoration: sub.completed ? 'line-through' : 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', transition: 'background-color 0.2s' }} onClick={() => startEditingSubGoal(goal.id, sub.id, sub.title)} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover-bg)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} title="클릭하여 수정">{sub.title}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="goal-progress">{getGoalProgress(goal)}%</div>
                <div className="goal-actions">
                  <button className="action-btn edit-btn" onClick={() => editGoal(goal)} title="수정">✏️</button>
                  <button className="action-btn remove-btn" onClick={() => removeGoal(goal.id)} title="삭제">-</button>
                </div>
              </div>
            ))}
            <div className="total-progress">
              <div className="progress-text">총 달성률: {getTotalProgress()}%</div>
            </div>
          </div>

          <div className="calendar-section-right">
            <div className="calendar-mini">
              <div className="calendar-header">
                {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
              </div>
              <div className="calendar-grid">
                {renderMonthlyCalendar()}
              </div>
            </div>

            <div className="events-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.3rem' }}>주간 일정</h3>
                <button className="action-btn add-btn" onClick={() => { setShowEventForm(!showEventForm); setEditingEvent(null); setNewEvent({ title: '', time: '', description: '' }); }} title="새 일정 추가">+</button>
              </div>
              {showEventForm && (
                <div className="add-goal-form" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>날짜</label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>일정 제목</label>
                    <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="일정 제목을 입력하세요" />
                  </div>
                  <div className="form-group">
                    <label>시간 (선택사항)</label>
                    <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>일정 상태</label>
                    <select
                      value={newEvent.status}
                      onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '5px',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="pending">미완료</option>
                      <option value="completed">완료</option>
                      <option value="skipped">건너뛰기</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>설명 (선택사항)</label>
                    <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="일정에 대한 설명을 입력하세요" rows="3" style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '5px', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }} />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="save-btn" onClick={editingEvent ? updateEvent : addEvent}>{editingEvent ? '수정' : '추가'}</button>
                    <button type="button" className="cancel-btn" onClick={() => { setShowEventForm(false); setEditingEvent(null); setNewEvent({ title: '', time: '', description: '' }); }}>취소</button>
                  </div>
                </div>
              )}
              <div className="events-list">
                {filteredEvents.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color)', opacity: 0.7 }}>선택한 주에 등록된 일정이 없습니다.</div>
                ) : (
                  filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).map((event) => {
                    const eventDate = new Date(event.date);
                    const dayOfWeek = eventDate.toLocaleDateString('ko-KR', { weekday: 'short' });
                    const statusEmoji = {
                      'completed': '✅',
                      'skipped': '⏭️',
                      'pending': '⏳'
                    };
                    const statusText = {
                      'completed': '완료',
                      'skipped': '건너뛰기',
                      'pending': '미완료'
                    };
                    const statusColor = {
                      'completed': '#4CAF50',
                      'skipped': '#FF9800',
                      'pending': '#2196F3'
                    };

                    return (
                      <div key={event.id} className="event-card" style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        transition: 'all 0.2s ease',
                        borderLeft: `4px solid ${statusColor[event.status || 'pending']}`
                      }}>
                        <div className="event-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div>
                            <h4 style={{ color: 'var(--primary-color)', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{event.title}</h4>
                            <div style={{ color: 'var(--secondary-color)', fontSize: '0.9rem' }}>
                              📅 {eventDate.toLocaleDateString('ko-KR')} ({dayOfWeek})
                              {event.time && ` • 🕐 ${formatEventTime(event.time)}`}
                            </div>
                            <div style={{
                              color: statusColor[event.status || 'pending'],
                              fontSize: '0.85rem',
                              marginTop: '0.25rem',
                              fontWeight: 'bold'
                            }}>
                              {statusEmoji[event.status || 'pending']} {statusText[event.status || 'pending']}
                            </div>
                          </div>
                          <div className="event-actions" style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="action-btn edit-btn" onClick={() => editEvent(event)} title="일정 수정" style={{ fontSize: '0.8rem' }}>✏️</button>
                              <button className="action-btn delete-btn" onClick={() => deleteEvent(event.id)} title="일정 삭제" style={{ fontSize: '0.8rem' }}>🗑️</button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => updateEventStatus(event.id, 'completed')}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  border: 'none',
                                  borderRadius: '4px',
                                  background: event.status === 'completed' ? '#4CAF50' : '#e0e0e0',
                                  color: event.status === 'completed' ? 'white' : '#666',
                                  cursor: 'pointer'
                                }}
                                title="완료로 표시"
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => updateEventStatus(event.id, 'skipped')}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  border: 'none',
                                  borderRadius: '4px',
                                  background: event.status === 'skipped' ? '#FF9800' : '#e0e0e0',
                                  color: event.status === 'skipped' ? 'white' : '#666',
                                  cursor: 'pointer'
                                }}
                                title="건너뛰기로 표시"
                              >
                                ⏭️
                              </button>
                              <button
                                onClick={() => updateEventStatus(event.id, 'pending')}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  border: 'none',
                                  borderRadius: '4px',
                                  background: event.status === 'pending' ? '#2196F3' : '#e0e0e0',
                                  color: event.status === 'pending' ? 'white' : '#666',
                                  cursor: 'pointer'
                                }}
                                title="미완료로 표시"
                              >
                                ⏳
                              </button>
                            </div>
                          </div>
                        </div>
                        {event.description && <div className="event-description" style={{ color: 'var(--text-color)', fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>{event.description}</div>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weekly;