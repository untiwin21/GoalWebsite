import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 날짜 문자열(YYYY-MM-DD)을 Date 객체로 변환하는 헬퍼 함수
const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const Analysis = ({ data }) => {

  // --- 데이터 계산 로직 ---

  const getDailyAchievement = () => {
    if (!data.dailyTodos) return [];
    return Object.entries(data.dailyTodos).map(([date, todos]) => {
      const total = todos.length;
      const completed = todos.filter(todo => todo.completed).length;
      return {
        date: new Date(date), // Date 객체로 변환하여 정렬에 사용
        achievement: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }).sort((a, b) => a.date - b.date); // 날짜순으로 정렬
  };

  const getWeekNumber = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return { year: date.getUTCFullYear(), week: weekNo };
  };

  const getWeeklyAchievement = () => {
    if (!data.weeklyGoals) return [];
    return Object.entries(data.weeklyGoals).flatMap(([year, yearData]) =>
      Object.entries(yearData).map(([week, goals]) => {
        const total = goals.reduce((acc, goal) => acc + (goal.subGoals?.length || 1), 0);
        const completed = goals.reduce((acc, goal) => {
            if (goal.subGoals && goal.subGoals.length > 0) {
                return acc + goal.subGoals.filter(sub => sub.completed).length;
            }
            return acc + (goal.completed ? 1 : 0);
        }, 0);
        return {
          year: parseInt(year),
          week: parseInt(week),
          weekLabel: `${year}-W${week}`,
          achievement: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      })
    ).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.week - b.week;
    });
  };

  const getMonthlyAchievement = () => {
    if (!data.monthlyGoals) return [];
    return data.monthlyGoals.map(goal => {
      const total = goal.subGoals?.length || 1;
      const completed = goal.subGoals?.filter(sub => sub.completed).length || (goal.completed ? 1 : 0);
      return {
        month: goal.title.substring(0, 7), // "YYYY-MM" 형식으로 표시
        achievement: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
  };

  const allDailyData = getDailyAchievement();
  const allWeeklyData = getWeeklyAchievement();
  const monthlyData = getMonthlyAchievement();

  // 최근 7일 데이터 필터링
  const last7DaysData = allDailyData.slice(-7).map(d => ({
    ...d,
    date: d.date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) // "MM. DD." 형식
  }));

  // 최근 4주 데이터 필터링
  const last4WeeksData = allWeeklyData.slice(-4);

  // --- 평균 계산 로직 ---

  const calculateAverage = (data) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.achievement, 0);
    return Math.round(sum / data.length);
  };

  const avgDaily = calculateAverage(last7DaysData);
  const avgWeekly = calculateAverage(last4WeeksData);
  const avgMonthly = calculateAverage(monthlyData);


  // --- 렌더링 ---

  return (
    <div className="page-container">
      <h1 className="page-title">목표 분석</h1>
      <p className="page-subtitle">데이터를 통해 당신의 성취를 한눈에 확인하고, 성장의 패턴을 발견하세요.</p>

      <div className="analysis-grid">
        {/* --- 일일 달성률 --- */}
        <div className="analysis-card">
            <div className="analysis-header">
                <h3 className="analysis-title">일일 달성률 (최근 7일)</h3>
                <div className="analysis-summary">
                    <span className="summary-label">평균 달성률:</span>
                    <span className="summary-value">{avgDaily}%</span>
                </div>
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
        </div>

        {/* --- 주간 달성률 --- */}
        <div className="analysis-card">
            <div className="analysis-header">
                <h3 className="analysis-title">주간 달성률 (최근 4주)</h3>
                <div className="analysis-summary">
                    <span className="summary-label">평균 달성률:</span>
                    <span className="summary-value">{avgWeekly}%</span>
                </div>
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
        </div>

        {/* --- 월간 달성률 --- */}
        <div className="analysis-card">
            <div className="analysis-header">
                <h3 className="analysis-title">월간 달성률</h3>
                 <div className="analysis-summary">
                    <span className="summary-label">평균 달성률:</span>
                    <span className="summary-value">{avgMonthly}%</span>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default Analysis;