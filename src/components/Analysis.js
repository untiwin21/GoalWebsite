import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Helper Functions ---

// 'YYYY-MM-DD' 형식의 날짜 문자열로부터 해당 월의 몇 번째 주인지 계산하는 함수
const getWeekOfMonthLabel = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('ko-KR', { month: 'long' });
    // 월의 첫 날을 기준으로 몇 번째 주인지 계산
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDay.getDay(); // 0: Sun, 1: Mon ...
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
    return Object.entries(data.weeklyGoals).map(([weekId, goals]) => {
        const total = goals.reduce((acc, goal) => acc + (goal.subGoals?.length || 1), 0);
        const completed = goals.reduce((acc, goal) => {
            if (goal.subGoals && goal.subGoals.length > 0) {
                return acc + goal.subGoals.filter(sub => sub.completed).length;
            }
            return acc + (goal.completed ? 1 : 0);
        }, 0);
        return {
          weekId,
          total,
          completed,
          weekLabel: getWeekOfMonthLabel(weekId),
          achievement: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      })
    .sort((a, b) => new Date(a.weekId) - new Date(b.weekId));
  };

  const getMonthlyAchievement = () => {
    if (!data.monthlyGoals) return [];
    return data.monthlyGoals.map(goal => {
      const total = goal.subGoals?.length || 1;
      const completed = goal.subGoals?.filter(sub => sub.completed).length || (goal.completed ? 1 : 0);
      return {
        month: goal.title.substring(0, 7),
        total,
        completed,
        achievement: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
  };

  const allDailyData = getDailyAchievement();
  const allWeeklyData = getWeeklyAchievement();
  const monthlyData = getMonthlyAchievement();

  const last7DaysData = allDailyData.slice(-7).map(d => ({
    ...d,
    date: d.date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
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
    const bestPerformer = data.reduce((max, item) => item.achievement > max.achievement ? item : max, data[0]);

    let bestLabel = '';
    if (type === '일일') bestLabel = new Date(bestPerformer.date).toLocaleDateString('ko-KR');
    if (type === '주간') bestLabel = bestPerformer.weekLabel;
    if (type === '월간') bestLabel = bestPerformer.month;


    return (
        <div className="analysis-text">
            <p><strong>총 평균 달성률:</strong> <span className="highlight">{averageAchievement}%</span></p>
            <p>분석 기간 동안 총 <strong>{totalTasks}개</strong>의 목표 중 <strong>{completedTasks}개</strong>를 완료했습니다.</p>
            {bestPerformer.achievement > 0 &&
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
                    <XAxis dataKey="date" />
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