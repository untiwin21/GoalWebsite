import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Budget = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInputForm, setShowInputForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '식비',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [monthlyBudgets, setMonthlyBudgets] = useState({});

  const categories = ['식비', 'play', '자기계발', 'Life'];
  const categoryColors = {
    '식비': '#8884d8',
    'play': '#82ca9d',
    '자기계발': '#ffc658',
    'Life': '#ff7300'
  };

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = () => {
    try {
      const localData = localStorage.getItem('budgetData');
      if (localData) {
        const parsedData = JSON.parse(localData);
        setBudgetData(parsedData);
        setMonthlyBudgets(parsedData.monthlyBudgets);
      } else {
        // 기본 데이터 구조
        const defaultData = {
          expenses: [],
          monthlyBudgets: {
            '식비': 300000,
            'play': 200000,
            '자기계발': 150000,
            'Life': 250000
          },
          categories: categories
        };
        setBudgetData(defaultData);
        setMonthlyBudgets(defaultData.monthlyBudgets);
      }
      setLoading(false);
    } catch (error) {
      console.error('가계부 데이터 로드 실패:', error);
      setLoading(false);
    }
  };

  const saveBudgetData = (data) => {
    try {
      localStorage.setItem('budgetData', JSON.stringify(data));
      setBudgetData(data);
      alert('데이터가 저장되었습니다!');
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      alert('데이터 저장에 실패했습니다.');
    }
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    const updatedData = { ...budgetData };

    if (editingExpense) {
      // 수정
      const index = updatedData.expenses.findIndex(exp => exp.id === editingExpense.id);
      updatedData.expenses[index] = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        id: editingExpense.id
      };
      setEditingExpense(null);
    } else {
      // 새 항목 추가
      const expense = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        id: Date.now()
      };
      updatedData.expenses.push(expense);
    }

    saveBudgetData(updatedData);
    setNewExpense({
      category: '식비',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowInputForm(false);
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    const updatedData = { ...budgetData, monthlyBudgets };
    saveBudgetData(updatedData);
    setShowBudgetForm(false);
  };


  const deleteExpense = (id) => {
    if (window.confirm('이 지출을 삭제하시겠습니까?')) {
      const updatedData = { ...budgetData };
      updatedData.expenses = updatedData.expenses.filter(exp => exp.id !== id);
      saveBudgetData(updatedData);
    }
  };

  const startEditing = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date
    });
    setShowInputForm(true);
  };

  // 분석 데이터 계산
  const getMonthlyData = () => {
    if (!budgetData || !budgetData.expenses) return [];

    const monthlyData = {};
    budgetData.expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, 식비: 0, play: 0, 자기계발: 0, Life: 0, total: 0 };
      }
      monthlyData[month][expense.category] += expense.amount;
      monthlyData[month].total += expense.amount;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const getCurrentMonthData = () => {
    if (!budgetData || !budgetData.expenses) return [];

    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentMonthExpenses = budgetData.expenses.filter(exp =>
      exp.date.startsWith(currentMonth)
    );

    const categoryTotals = {};
    categories.forEach(cat => {
      categoryTotals[cat] = currentMonthExpenses
        .filter(exp => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  const getCategoryAnalysis = () => {
    if (!budgetData || !budgetData.expenses) return {};

    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentMonthExpenses = budgetData.expenses.filter(exp =>
      exp.date.startsWith(currentMonth)
    );

    const analysis = {};
    categories.forEach(category => {
      const spent = currentMonthExpenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);
      const budget = budgetData.monthlyBudgets[category];
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;

      analysis[category] = {
        spent,
        budget,
        remaining: budget - spent,
        percentage: percentage.toFixed(1)
      };
    });

    return analysis;
  };

  const getRecentExpenses = () => {
    if (!budgetData || !budgetData.expenses) return [];
    return budgetData.expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  if (loading) {
    return <div className="loading">데이터를 불러오는 중...</div>;
  }

  const monthlyData = getMonthlyData();
  const currentMonthData = getCurrentMonthData();
  const categoryAnalysis = getCategoryAnalysis();
  const recentExpenses = getRecentExpenses();

  return (
    <div className="budget-container">
      {/* 헤더 */}
      <div className="budget-header">
        <h1>💰 가계부</h1>
        <div>
          <button
            className="add-expense-btn"
            onClick={() => setShowInputForm(!showInputForm)}
            style={{ marginRight: '1rem' }}
          >
            {showInputForm ? '취소' : '+ 지출 추가'}
          </button>
          <button
            className="add-expense-btn"
            onClick={() => setShowBudgetForm(!showBudgetForm)}
          >
            {showBudgetForm ? '취소' : '예산 수정'}
          </button>
        </div>
      </div>
      {/* 예산 수정 폼 */}
      {showBudgetForm && (
        <section className="expense-input-section">
          <h2>예산 수정</h2>
          <form onSubmit={handleBudgetSubmit} className="expense-form">
            <div className="form-row">
              {categories.map(category => (
                <div key={category}>
                  <label>{category}</label>
                  <input
                    type="number"
                    value={monthlyBudgets[category]}
                    onChange={(e) => setMonthlyBudgets({ ...monthlyBudgets, [category]: parseFloat(e.target.value) })}
                  />
                </div>
              ))}
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                저장
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 지출 입력 폼 */}
      {showInputForm && (
        <section className="expense-input-section">
          <h2>{editingExpense ? '지출 수정' : '새 지출 추가'}</h2>
          <form onSubmit={handleExpenseSubmit} className="expense-form">
            <div className="form-row">
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="금액"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                required
              />

              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                required
              />
            </div>

            <input
              type="text"
              placeholder="지출 내용"
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              required
            />

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingExpense ? '수정' : '추가'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInputForm(false);
                  setEditingExpense(null);
                  setNewExpense({
                    category: '식비',
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                }}
                className="cancel-btn"
              >
                취소
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 이번 달 예산 현황 */}
      <section className="budget-overview">
        <h2>📊 이번 달 예산 현황</h2>
        <div className="budget-cards">
          {Object.entries(categoryAnalysis).map(([category, data]) => (
            <div key={category} className="budget-card">
              <h3>{category}</h3>
              <div className="budget-amounts">
                <span className="spent">사용: {data.spent.toLocaleString()}원</span>
                <span className="budget">예산: {data.budget.toLocaleString()}원</span>
              </div>
              <div className="budget-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(data.percentage, 100)}%`,
                      backgroundColor: data.percentage > 100 ? '#ff4444' : categoryColors[category]
                    }}
                  ></div>
                </div>
                <span className={`percentage ${data.percentage > 100 ? 'over-budget' : ''}`}>
                  {data.percentage}%
                </span>
              </div>
              <div className="remaining">
                남은 예산: {data.remaining.toLocaleString()}원
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 차트 섹션 */}
      <section className="charts-section">
        <h2>📈 지출 분석</h2>

        {/* 이번 달 카테고리별 지출 */}
        {currentMonthData.length > 0 && (
          <div className="chart-container">
            <h3>이번 달 카테고리별 지출</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentMonthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value.toLocaleString()}원`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currentMonthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 월별 지출 추이 */}
        {monthlyData.length > 0 && (
          <div className="chart-container">
            <h3>월별 지출 추이</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                <Legend />
                <Line type="monotone" dataKey="식비" stroke={categoryColors['식비']} />
                <Line type="monotone" dataKey="play" stroke={categoryColors['play']} />
                <Line type="monotone" dataKey="자기계발" stroke={categoryColors['자기계발']} />
                <Line type="monotone" dataKey="Life" stroke={categoryColors['Life']} />
                <Line type="monotone" dataKey="total" stroke="#333" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 카테고리별 월 평균 */}
        {monthlyData.length > 0 && (
          <div className="chart-container">
            <h3>카테고리별 월 평균 지출</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                {
                  name: '월 평균',
                  식비: monthlyData.reduce((sum, month) => sum + month.식비, 0) / monthlyData.length,
                  play: monthlyData.reduce((sum, month) => sum + month.play, 0) / monthlyData.length,
                  자기계발: monthlyData.reduce((sum, month) => sum + month.자기계발, 0) / monthlyData.length,
                  Life: monthlyData.reduce((sum, month) => sum + month.Life, 0) / monthlyData.length
                }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Math.round(value).toLocaleString()}원`} />
                <Bar dataKey="식비" fill={categoryColors['식비']} />
                <Bar dataKey="play" fill={categoryColors['play']} />
                <Bar dataKey="자기계발" fill={categoryColors['자기계발']} />
                <Bar dataKey="Life" fill={categoryColors['Life']} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 최근 지출 내역 */}
      <section className="recent-expenses">
        <h2>📝 최근 지출 내역</h2>
        <div className="expenses-list">
          {recentExpenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-info">
                <span className="category" style={{color: categoryColors[expense.category]}}>
                  {expense.category}
                </span>
                <span className="description">{expense.description}</span>
                <span className="date">{expense.date}</span>
              </div>
              <div className="expense-actions">
                <span className="amount">{expense.amount.toLocaleString()}원</span>
                <button onClick={() => startEditing(expense)} className="edit-btn">✏️</button>
                <button onClick={() => deleteExpense(expense.id)} className="delete-btn">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 분석 및 인사이트 */}
      <section className="insights-section">
        <h2>🔍 지출 분석 및 인사이트</h2>
        <div className="insights">
          {Object.entries(categoryAnalysis).map(([category, data]) => (
            <div key={category} className="insight-card">
              <h4>{category} 분석</h4>
              <p>
                {data.percentage > 100 ? (
                  <span className="warning">
                    ⚠️ 예산을 {(data.percentage - 100).toFixed(1)}% 초과했습니다.
                    {Math.abs(data.remaining).toLocaleString()}원 절약이 필요합니다.
                  </span>
                ) : data.percentage > 80 ? (
                  <span className="caution">
                    ⚡ 예산의 {data.percentage}%를 사용했습니다.
                    남은 예산 {data.remaining.toLocaleString()}원을 주의깊게 사용하세요.
                  </span>
                ) : (
                  <span className="good">
                    ✅ 예산 관리가 잘 되고 있습니다.
                    {data.remaining.toLocaleString()}원이 남았습니다.
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Budget;