import React, { useState } from 'react';

const ThinkBig = ({ data, updateData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newGoals = [...data.thinkBigGoals];
    const draggedGoal = newGoals[draggedItem];
    newGoals.splice(draggedItem, 1);
    newGoals.splice(dropIndex, 0, draggedGoal);

    updateData({
      ...data,
      thinkBigGoals: newGoals
    });
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const addGoal = () => {
    if (newGoal.title.trim() && newGoal.startDate && newGoal.endDate) {
      const goal = {
        id: Date.now(),
        ...newGoal,
        createdAt: new Date().toISOString()
      };
      updateData({
        ...data,
        thinkBigGoals: [...(data.thinkBigGoals || []), goal]
      });
      setNewGoal({ title: '', description: '', startDate: '', endDate: '' });
      setShowAddForm(false);
    } else {
      alert('제목, 시작일, 종료일을 모두 입력해주세요.');
    }
  };

  const editGoal = (goal) => {
    setEditingGoal(goal.id);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      startDate: goal.startDate,
      endDate: goal.endDate
    });
    setShowAddForm(true);
  };

  const updateGoal = () => {
    if (newGoal.title.trim() && editingGoal) {
      const updatedGoals = data.thinkBigGoals.map(g =>
        g.id === editingGoal ? { ...g, ...newGoal, updatedAt: new Date().toISOString() } : g
      );
      updateData({
        ...data,
        thinkBigGoals: updatedGoals
      });
      setNewGoal({ title: '', description: '', startDate: '', endDate: '' });
      setShowAddForm(false);
      setEditingGoal(null);
    }
  };

  const removeGoal = (goalId) => {
    updateData({
      ...data,
      thinkBigGoals: data.thinkBigGoals.filter(g => g.id !== goalId)
    });
  };

  const getDday = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = end.getTime() - today.getTime();
    const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dDay;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">장기 목표 (Think Big)</h1>
      <p className="page-subtitle">인생의 큰 그림을 그리고, 장기적인 비전을 설정하는 공간입니다.</p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button
          className="action-btn add-btn"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingGoal(null);
            setNewGoal({ title: '', description: '', startDate: '', endDate: '' });
          }}
          title="새 장기 목표 추가"
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
              placeholder="장기적인 목표나 비전을 입력하세요"
            />
          </div>
          <div className="form-group">
            <label>설명 (선택사항)</label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="목표에 대한 구체적인 설명을 추가하세요"
              rows="4"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>시작일</label>
              <input
                type="date"
                value={newGoal.startDate}
                onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>종료일</label>
              <input
                type="date"
                value={newGoal.endDate}
                onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={editingGoal ? updateGoal : addGoal}>
              {editingGoal ? '목표 수정' : '목표 추가'}
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setShowAddForm(false);
                setEditingGoal(null);
                setNewGoal({ title: '', description: '', startDate: '', endDate: '' });
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="think-big-list">
        {[...(data.thinkBigGoals || [])]
          .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
          .map((goal, index) => {
            const dDay = getDday(goal.endDate);
            return (
              <div
                key={goal.id}
                className={`think-big-item ${draggedItem === index ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="drag-handle" title="드래그해서 순서 변경">⋮⋮</div>
                <div className="think-big-content">
                  <div className="think-big-header">
                    <h3 className="think-big-title">{goal.title}</h3>
                    <div className="dday-count" style={{
                      background: dDay <= 7 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      color: dDay <= 7 ? '#FF6B6B' : 'var(--light-text)'
                    }}>
                      D-{dDay > 0 ? dDay : '+' + Math.abs(dDay)}
                    </div>
                  </div>
                  <p className="think-big-period">
                    {goal.startDate} ~ {goal.endDate}
                  </p>
                  {goal.description && <p className="think-big-description">{goal.description}</p>}
                </div>
                <div className="think-big-actions">
                  <button className="action-btn edit-btn" onClick={() => editGoal(goal)}>✏️</button>
                  <button className="action-btn remove-btn" onClick={() => removeGoal(goal.id)}>-</button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ThinkBig;
