import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analysis = ({ data }) => {
  const getDailyAchievement = () => {
    if (!data.dailyTodos) return [];
    return Object.entries(data.dailyTodos).map(([date, todos]) => {
      const total = todos.length;
      const completed = todos.filter(todo => todo.completed).length;
      return {
        date,
        achievement: total > 0 ? (completed / total) * 100 : 0
      };
    });
  };

  const getWeeklyAchievement = () => {
    if (!data.weeklyGoals) return [];
    return Object.entries(data.weeklyGoals).flatMap(([year, yearData]) =>
      Object.entries(yearData).map(([week, goals]) => {
        const total = goals.reduce((acc, goal) => acc + (goal.subGoals?.length || 1), 0);
        const completed = goals.reduce((acc, goal) => acc + (goal.subGoals?.filter(sub => sub.completed).length || (goal.completed ? 1 : 0)), 0);
        return {
          week: `${year}-W${week}`,
          achievement: total > 0 ? (completed / total) * 100 : 0
        };
      })
    );
  };

  const getMonthlyAchievement = () => {
    if (!data.monthlyGoals) return [];
    // This is a simplified monthly calculation. For more accuracy, you'd group by month.
    return data.monthlyGoals.map(goal => {
      const total = goal.subGoals?.length || 1;
      const completed = goal.subGoals?.filter(sub => sub.completed).length || (goal.completed ? 1 : 0);
      return {
        month: goal.title,
        achievement: total > 0 ? (completed / total) * 100 : 0
      };
    });
  };

  const dailyData = getDailyAchievement();
  const weeklyData = getWeeklyAchievement();
  const monthlyData = getMonthlyAchievement();

  return (
    <div className="page-container">
      <h1 className="page-title">목표 분석</h1>
      <p className="page-subtitle">데이터를 통해 당신의 성취를 한눈에 확인하고, 성장의 패턴을 발견하세요.</p>

      <div className="analysis-grid">
        <div className="analysis-card">
          <h3 className="analysis-title">일일 할 일 달성률</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="achievement" fill="#8884d8" name="달성률 (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="analysis-card">
          <h3 className="analysis-title">주간 할 일 달성률</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="achievement" fill="#82ca9d" name="달성률 (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="analysis-card">
          <h3 className="analysis-title">월간 할 일 달성률</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="achievement" fill="#ffc658" name="달성률 (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analysis;