import React, { useState } from 'react';

const ThinkBig = ({ data, updateData }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        subGoals: []
    });
    const [newSubGoal, setNewSubGoal] = useState('');

    const sortedGoals = [...(data.thinkBigGoals || [])].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    const calculateProgress = (goal) => {
        if (!goal.subGoals || goal.subGoals.length === 0) {
            return 0;
        }
        
        const completedSubGoals = goal.subGoals.filter(sub => sub.completed).length;
        return (completedSubGoals / goal.subGoals.length) * 100;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingGoal) {
            const updatedGoals = data.thinkBigGoals.map(goal =>
                goal.id === editingGoal.id ? { ...newGoal, id: editingGoal.id } : goal
            );
            updateData({
                ...data,
                thinkBigGoals: updatedGoals
            });
            setEditingGoal(null);
        } else {
            const goalToAdd = {
                ...newGoal,
                id: Date.now(),
                createdAt: new Date().toISOString()
            };

            updateData({
                ...data,
                thinkBigGoals: [...(data.thinkBigGoals || []), goalToAdd]
            });
        }

        setNewGoal({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            subGoals: []
        });
        setShowAddForm(false);
    };

    const deleteGoal = (goalId) => {
        if (window.confirm('정말로 이 목표를 삭제하시겠습니까?')) {
            updateData({
                ...data,
                thinkBigGoals: data.thinkBigGoals.filter(goal => goal.id !== goalId)
            });
        }
    };

    const startEditing = (goal) => {
        setEditingGoal(goal);
        setNewGoal({
            title: goal.title,
            description: goal.description,
            startDate: goal.startDate,
            endDate: goal.endDate,
            subGoals: goal.subGoals || []
        });
        setShowAddForm(true);
    };

    const addSubGoal = () => {
        if (newSubGoal.trim()) {
            setNewGoal({
                ...newGoal,
                subGoals: [...(newGoal.subGoals || []), {
                    id: Date.now(),
                    text: newSubGoal.trim(),
                    completed: false
                }]
            });
            setNewSubGoal('');
        }
    };

    const removeSubGoal = (subGoalId) => {
        setNewGoal({
            ...newGoal,
            subGoals: newGoal.subGoals.filter(sub => sub.id !== subGoalId)
        });
    };

    const toggleSubGoal = (goalId, subGoalId) => {
        const updatedGoals = data.thinkBigGoals.map(goal => {
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

        updateData({
            ...data,
            thinkBigGoals: updatedGoals
        });
    };

    const calculateDDay = (endDate) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(0,0,0,0);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `D-${diffDays}`;
        } else if (diffDays === 0) {
            return 'D-Day';
        } else {
            return `D+${Math.abs(diffDays)}`;
        }
    };

    return (
        <div className="think-big-container">
            <div className="think-big-header">
                <h1>🎯 Think Big Goals</h1>
                <button
                    className="add-goal-btn"
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingGoal(null);
                        setNewGoal({ title: '', description: '', startDate: '', endDate: '', subGoals: [] });
                    }}
                >
                    {showAddForm && !editingGoal ? '취소' : '+ 새 목표 추가'}
                </button>
            </div>

            {showAddForm && (
                <div className="goal-form-container">
                    <form onSubmit={handleSubmit} className="goal-form">
                        <h3>{editingGoal ? '목표 수정' : '새 목표 추가'}</h3>

                        <input
                            type="text"
                            placeholder="목표 제목"
                            value={newGoal.title}
                            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                            required
                        />

                        <textarea
                            placeholder="목표 설명"
                            value={newGoal.description}
                            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                            rows={3}
                        />

                        <div className="date-inputs">
                            <div>
                                <label>시작일</label>
                                <input
                                    type="date"
                                    value={newGoal.startDate}
                                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label>목표일</label>
                                <input
                                    type="date"
                                    value={newGoal.endDate}
                                    onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="sub-goals-section">
                            <h4>하위 목표</h4>
                            <div className="sub-goal-input">
                                <input
                                    type="text"
                                    placeholder="하위 목표 입력 후 Enter"
                                    value={newSubGoal}
                                    onChange={(e) => setNewSubGoal(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addSubGoal();
                                        }
                                    }}
                                />
                                <button type="button" onClick={addSubGoal}>추가</button>
                            </div>

                            <div className="sub-goals-list">
                                {(newGoal.subGoals || []).map(subGoal => (
                                    <div key={subGoal.id} className="sub-goal-item">
                                        <span>{subGoal.text}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSubGoal(subGoal.id)}
                                            className="remove-sub-goal"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-btn">
                                {editingGoal ? '수정하기' : '목표 추가하기'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingGoal(null);
                                }}
                                className="cancel-btn"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="goals-list">
                {sortedGoals.map((goal) => {
                    const progress = calculateProgress(goal);
                    const dDay = calculateDDay(goal.endDate);

                    return (
                        <div key={goal.id} className="goal-card">
                            <div className="goal-header">
                                <div className="goal-title-section">
                                    <h3>{goal.title}</h3>
                                    <span className={`d-day ${dDay.includes('+') ? 'overdue' : ''}`}>
                                        {dDay}
                                    </span>
                                </div>
                                <div className="goal-actions">
                                    <button onClick={() => startEditing(goal)} className="edit-btn">
                                        ✏️
                                    </button>
                                    <button onClick={() => deleteGoal(goal.id)} className="delete-btn">
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <p className="goal-description">{goal.description}</p>

                            <div className="goal-dates">
                                <span>📅 {goal.startDate} ~ {goal.endDate}</span>
                            </div>

                            <div className="progress-section">
                                <div className="progress-header">
                                    <span>진행률</span>
                                    <span className="progress-percentage">{progress.toFixed(1)}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {goal.subGoals && goal.subGoals.length > 0 && (
                                <div className="sub-goals-display">
                                    <h4>하위 목표</h4>
                                    {goal.subGoals.map(subGoal => (
                                        <div key={subGoal.id}>
                                            <label className="sub-goal-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={subGoal.completed}
                                                    onChange={() => toggleSubGoal(goal.id, subGoal.id)}
                                                />
                                                <span className={subGoal.completed ? 'completed' : ''}>
                                                    {subGoal.text}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {sortedGoals.length === 0 && !showAddForm && (
                <div className="empty-state">
                    <p>아직 설정된 큰 목표가 없습니다.</p>
                    <p>새로운 목표를 추가해보세요! 🚀</p>
                </div>
            )}
        </div>
    );
};

export default ThinkBig;