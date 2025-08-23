import React from 'react';
import Timetable from './Timetable';

const Home = ({ data }) => {
  // --- 날짜 관련 헬퍼 함수 (App.js와 동일한 로직) ---
  const getWeekNumber = (d) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const firstDayOfWeek = yearStart.getDay();
    const dayOfYear = ((date - yearStart) / 86400000) + 1;
    return Math.ceil((dayOfYear + firstDayOfWeek) / 7);
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const year = today.getFullYear();
    const week = getWeekNumber(today);

    const currentWeekGoals = data.weeklyGoals?.[year]?.[week] || [];
    if (currentWeekGoals.length === 0) return 0;

    const totalTasks = currentWeekGoals.reduce((sum, goal) => sum + (goal.subGoals?.length || 1), 0);
    const completedTasks = currentWeekGoals.reduce((sum, goal) => {
      if (goal.subGoals?.length > 0) return sum + goal.subGoals.filter(s => s.completed).length;
      return sum + (goal.completed ? 1 : 0);
    }, 0);

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getMonthlyProgress = () => {
    const monthlyGoals = data.monthlyGoals || [];
    if (monthlyGoals.length === 0) return 0;
    const completed = monthlyGoals.filter(goal => goal.completed).length;
    return Math.round((completed / monthlyGoals.length) * 100);
  };

  const getDday = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    dayNames.forEach(day => {
      days.push(<div key={day} className="calendar-day header">{day}</div>);
    });

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isToday = currentDate.toDateString() === today.toDateString();
      const isCurrentMonth = currentDate.getMonth() === month;

      days.push(
        <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`} style={{ opacity: isCurrentMonth ? 1 : 0.3 }}>
          {currentDate.getDate()}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">대시보드</h1>

      <div className="home-grid">
        <div className="left-column">
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-title">주간 목표 달성률</div>
              <div className="stat-value">{getWeeklyProgress()}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">월간 목표 달성률</div>
              <div className="stat-value">{getMonthlyProgress()}%</div>
            </div>
          </div>

          <div className="dday-section">
            <h3 className="calendar-header">D-Day 목록</h3>
            {(data.thinkBigGoals || [])
              .filter(goal => getDday(goal.endDate) >= 0)
              .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
              .slice(0, 5)
              .map(goal => (
                <div key={goal.id} className="dday-item">
                  <span className="dday-name">{goal.title}</span>
                  <span className="dday-count">D-{getDday(goal.endDate)}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="right-column">
          <div className="calendar-container">
            <div className="calendar-header">
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </div>
            <div className="calendar-grid">
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>
      <Timetable />
    </div>
  );
};

export default Home;