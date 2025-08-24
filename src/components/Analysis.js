import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Helper Functions ---
const getWeekOfMonthLabel = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString; // Invalid date format
    }
    const month = date.toLocaleString('ko-KR', { month: 'long' });
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDay.getDay();
    const weekOfMonth = Math.ceil((date.getDate() + dayOfWeek) / 7);
    return `${month} ${weekOfMonth}째주`;
};


const Analysis = ({ data }) => {

  // --- Data Calculation Logic ---

  const getDailyAchievement = () => {
    if (!data.dailyTodos) return [];
    return Object.entries(data.dailyTodos).map(([date, todos]) => {
      const total = todos.length;
      const completed = todos.filter(todo => todo.completed).length;
      return {
        date: new Date(date),
        total,
        completed,
        achievement: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }).sort((a, b) => a.date - b.date);
  };

  const getWeeklyAchievement = () => {
    if (!data.weeklyGoals) return [];

    return Object.entries(data.weeklyGoals)
        .flatMap(([year, weeks]) =>
            Object.entries(weeks).map(([weekNum, goals]) => {
                const total = goals.reduce((acc, goal) => acc + (goal.subGoals?.length || 1), 0);
                const completed = goals.reduce((acc, goal) => {
                    if (goal.subGoals && goal.subGoals.length > 0) {
                        return acc + goal.subGoals.filter(sub => sub.completed).length;
                    }
                    return acc + (goal.completed ? 1 : 0);
                }, 0);
                const firstGoalDate = goals.length > 0 ? goals[0].createdAt : `${year}-01-01`;

                return {
                    weekId: `${year}-W${weekNum}`,
                    weekLabel: getWeekOfMonthLabel(firstGoalDate),
                    total,
                    completed,
                    achievement: total > 0 ? Math.round((completed / total) * 100) : 0,
                    date: new Date(firstGoalDate)
                };
            })
        )
        .sort((a, b) => a.date - b.date);
  };


  const getMonthlyAchievement = () => {
    if (!data.monthlyGoals) return [];
    const monthlyDataMap = {};
    data.monthlyGoals.forEach(goal => {
      const month = new Date(goal.createdAt).toISOString().substring(0, 7);
      if (!monthlyDataMap[month]) {
          monthlyDataMap[month] = { total: 0, completed: 0 };
      }
      const total = goal.subGoals?.length || 1;
      const completed = goal.subGoals?.filter(sub => sub.completed).length || (goal.completed ? 1 : 0);
      monthlyDataMap[month].total += total;
      monthlyDataMap[month].completed += completed;
    });

    return Object.entries(monthlyDataMap).map(([month, {total, completed}]) => ({
        month,
        total,
        completed,
        achievement: total > 0 ? Math.round((completed / total) * 100) : 0
    }));
  };

  const allDailyData = getDailyAchievement();
  const allWeeklyData = getWeeklyAchievement();
  const monthlyData = getMonthlyAchievement();

  const last7DaysData = allDailyData.slice(-7).map(d => ({
    ...d,
    formattedDate: d.date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
  }));

  const last4WeeksData = allWeeklyData.slice(-4);

  // --- Analysis Text Generation ---

  const generateAnalysisText = (data, type) => {
    if (!data || data.length === 0) {
        return <div className="analysis-text">데이터가 부족하여 분석할 수 없습니다.</div>;
    }
    const totalCount = data.length;
    const totalAchievement = data.reduce((sum, item) => sum + item.achievement, 0);
    const averageAchievement = Math.round(totalAchievement / totalCount);
    const totalTasks = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const completedTasks = data.reduce((sum, item) => sum + (item.completed || 0), 0);

    const bestPerformer = data.reduce((max, item) => (!max || item.achievement > max.achievement) ? item : max, null);

    let bestLabel = '';
    if (bestPerformer) {
        if (type === '일일') bestLabel = bestPerformer.formattedDate;
        if (type === '주간') bestLabel = bestPerformer.weekLabel;
        if (type === '월간') bestLabel = bestPerformer.month;
    }


    return (
        <div className="analysis-text">
            <p><strong>총 평균 달성률:</strong> <span className="highlight">{averageAchievement}%</span></p>
            <p>분석 기간 동안 총 <strong>{totalTasks}개</strong>의 목표 중 <strong>{completedTasks}개</strong>를 완료했습니다.</p>
            {bestPerformer && bestPerformer.achievement > 0 &&
                <p>가장 높은 성과를 보인 {type}은 <strong>{bestLabel}</strong>으로, <span className="highlight">{bestPerformer.achievement}%</span>의 달성률을 기록했습니다.</p>
            }
        </div>
    );
  }


  return (
    <div className="page-container">
      <h1 className="page-title">목표 분석</h1>
      <p className="page-subtitle">데이터를 통해 당신의 성취를 한눈에 확인하고, 성장의 패턴을 발견하세요.</p>

      <div className="analysis-grid">
        <div className="analysis-card">
            <div className="analysis-header">
                <h3 className="analysis-title">일일 달성률 (최근 7일)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last7DaysData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="achievement" stroke="#8884d8" strokeWidth={2} name="달성률 (%)" />
                </LineChart>
            </ResponsiveContainer>
            {generateAnalysisText(last7DaysData, '일일')}
        </div>

        <div className="analysis-card">
            <div className="analysis-header">
                <h3 className="analysis-title">주간 달성률 (최근 4주)</h3>
            </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last4WeeksData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekLabel" />
              <YAxis domain={[0, 100]}/>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="achievement" stroke="#82ca9d" strokeWidth={2} name="달성률 (%)" />
            </LineChart>
          </ResponsiveContainer>
           {generateAnalysisText(last4WeeksData, '주간')}
        </div>

        <div className="analysis-card">
            <div className="analysis-header">
                <h3 className="analysis-title">월간 달성률</h3>
            </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="achievement" fill="#ffc658" name="달성률 (%)" />
            </BarChart>
          </ResponsiveContainer>
          {generateAnalysisText(monthlyData, '월간')}
        </div>
      </div>
    </div>
  );
};

export default Analysis;