import React, { useState } from 'react';

const ThinkBig = ({ data, updateData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    startDate: '', 
    endDate: '', 
    subGoals: [] 
  });
  const [newSubGoal, setNewSubGoal] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSubGoal, setDraggedSubGoal] = useState(null);
  const [draggedFromGoal, setDraggedFromGoal] = useState(null);

  const addGoal = () => {
    if (newGoal.title.trim() && newGoal.startDate && newGoal.endDate) {
      const goal = {
        id: Date.now(),
        title: newGoal.title,
        startDate: newGoal.startDate,
        endDate: newGoal.endDate,
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
        thinkBigGoals: [...(data.thinkBigGoals || []), goal]
      });
      
      setNewGoal({ title: '', startDate: '', endDate: '', subGoals: [] });
      setShowAddForm(false);
    }
  };

  const editGoal = (goalId) => {
    const goal = data.thinkBigGoals.find(g => g.id === goalId);
    if (goal) {
      setEditingGoal(goalId);
      setNewGoal({
        title: goal.title,
        startDate: goal.startDate,
        endDate: goal.endDate,
        subGoals: goal.subGoals.map(sub => sub.title)
      });
      setShowAddForm(true);
    }
  };

  const updateGoal = () => {
    if (newGoal.title.trim() && newGoal.startDate && newGoal.endDate && editingGoal) {
      const updatedGoals = data.thinkBigGoals.map(goal => {
        if (goal.id === editingGoal) {
          return {
            ...goal,
            title: newGoal.title,
            startDate: newGoal.startDate,
            endDate: newGoal.endDate,
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
        thinkBigGoals: updatedGoals
      });
      
      setNewGoal({ title: '', startDate: '', endDate: '', subGoals: [] });
      setShowAddForm(false);
      setEditingGoal(null);
    }
  };

  const toggleMainGoal = (goalId) => {
    const updatedGoals = data.thinkBigGoals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    });
    
    updateData({
      ...data,
      thinkBigGoals: updatedGoals
    });
  };

  const removeGoal = (goalId) => {
    updateData({
      ...data,
      thinkBigGoals: data.thinkBigGoals.filter(goal => goal.id !== goalId)
    });
  };

  const toggleSubGoal = (goalId, subGoalId) => {
    const updatedGoals = data.thinkBigGoals.map(goal => {
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
      thinkBigGoals: updatedGoals
    });
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

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('ko-KR');
    const end = new Date(endDate).toLocaleDateString('ko-KR');
    return `${start} ~ ${end}`;
  };

  const groupGoalsByPeriod = () => {
    if (!data.thinkBigGoals) return {};
    
    const groups = {};
    
    data.thinkBigGoals.forEach(goal => {
      const startYear = new Date(goal.startDate).getFullYear();
      const endYear = new Date(goal.endDate).getFullYear();
      const startMonth = new Date(goal.startDate).getMonth() + 1;
      const endMonth = new Date(goal.endDate).getMonth() + 1;
      
      let groupKey;
      if (startYear === endYear) {
        if (startMonth === endMonth) {
          groupKey = `${startYear}년 ${startMonth}월`;
        } else {
          groupKey = `${startYear}년 ${startMonth}월 ~ ${endMonth}월`;
        }
      } else {
        groupKey = `${startYear}년 ${startMonth}월 ~ ${endYear}년 ${endMonth}월`;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(goal);
    });
    
    return groups;
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

    const newGoals = [...data.thinkBigGoals];
    const draggedGoal = newGoals[draggedItem];
    
    // 드래그된 아이템 제거
    newGoals.splice(draggedItem, 1);
    
    // 새 위치에 삽입
    newGoals.splice(dropIndex, 0, draggedGoal);
    
    updateData({
      ...data,
      thinkBigGoals: newGoals
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

    const updatedGoals = data.thinkBigGoals.map(goal => {
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
      thinkBigGoals: updatedGoals
    });
    
    setDraggedSubGoal(null);
    setDraggedFromGoal(null);
  };

  const groupedGoals = groupGoalsByPeriod();

  return (
    <div className="page-container">
      <h1 className="page-title">Think Big</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>장기 목표 (1달 이상)</h3>
        <button 
          className="action-btn add-btn"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingGoal(null);
            setNewGoal({ title: '', startDate: '', endDate: '', subGoals: [] });
          }}
          title="새 장기 목표 추가"
        >
          +
        </button>
      </div>
      
      {showAddForm && (
        <div className="add-goal-form" style={{ marginBottom: '3rem' }}>
          <div className="form-group">
            <label>목표 제목</label>
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="장기 목표를 입력하세요"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label>시작 날짜</label>
              <input
                type="date"
                value={newGoal.startDate}
                onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>종료 날짜</label>
              <input
                type="date"
                value={newGoal.endDate}
                onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
              />
            </div>
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
                  setNewGoal({ title: '', startDate: '', endDate: '', subGoals: [] });
                }}
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}
      
      {Object.keys(groupedGoals).length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.7)', 
          padding: '4rem',
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>설정된 장기 목표가 없습니다</h3>
          <p>새로운 장기 목표를 추가해보세요!</p>
        </div>
      ) : (
        Object.entries(groupedGoals).map(([period, goals]) => (
          <div key={period} style={{ marginBottom: '3rem' }}>
            <h4 style={{ 
              color: 'var(--light-text)', 
              marginBottom: '2rem', 
              padding: '1rem 0',
              borderBottom: '2px solid #9b59b6',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              📅 {period}
            </h4>
            
            {goals.map((goal, index) => {
              const daysRemaining = getDaysRemaining(goal.endDate);
              const isExpired = daysRemaining < 0;
              const globalIndex = data.thinkBigGoals.findIndex(g => g.id === goal.id);
              
              return (
                <div 
                  key={goal.id} 
                  className={`think-big-item ${draggedItem === globalIndex ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, globalIndex)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, globalIndex)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="drag-handle" title="드래그해서 순서 변경">
                    ⋮⋮
                  </div>
                  <div className="think-big-header">
                    <div>
                      <div className="think-big-title">
                        {goal.subGoals && goal.subGoals.length === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                      <div className="think-big-period">
                        {formatDateRange(goal.startDate, goal.endDate)}
                        <span style={{ 
                          marginLeft: '1rem',
                          color: isExpired ? 'var(--accent-color)' : 'var(--secondary-color)',
                          fontWeight: 'bold',
                          background: isExpired ? 'rgba(255, 107, 107, 0.2)' : 'rgba(66, 245, 221, 0.2)',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.9rem'
                        }}>
                          {isExpired ? `${Math.abs(daysRemaining)}일 지남` : `D-${daysRemaining}`}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#9b59b6',
                        background: 'rgba(155, 89, 182, 0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        border: '1px solid #9b59b6'
                      }}>
                        {getGoalProgress(goal)}%
                      </span>
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
                          <span style={{ textDecoration: sub.completed ? 'line-through' : 'none' }}>
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};

export default ThinkBig;
