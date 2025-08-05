import React from 'react';

const Home = ({ data }) => {
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getWeeklyProgress = () => {
    if (!data.weeklyGoals || data.weeklyGoals.length === 0) return 0;
    
    const totalTasks = data.weeklyGoals.reduce((sum, goal) => {
      return sum + (goal.subGoals ? goal.subGoals.length : 1);
    }, 0);
    
    const completedTasks = data.weeklyGoals.reduce((sum, goal) => {
      if (goal.subGoals) {
        return sum + goal.subGoals.filter(sub => sub.completed).length;
      }
      return sum + (goal.completed ? 1 : 0);
    }, 0);
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getMonthlyProgress = () => {
    if (!data.monthlyGoals || data.monthlyGoals.length === 0) return 0;
    
    const totalTasks = data.monthlyGoals.reduce((sum, goal) => {
      return sum + (goal.subGoals ? goal.subGoals.length : 1);
    }, 0);
    
    const completedTasks = data.monthlyGoals.reduce((sum, goal) => {
      if (goal.subGoals) {
        return sum + goal.subGoals.filter(sub => sub.completed).length;
      }
      return sum + (goal.completed ? 1 : 0);
    }, 0);
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getDDays = () => {
    if (!data.thinkBigGoals) return [];
    
    return data.thinkBigGoals.map(goal => {
      const endDate = new Date(goal.endDate);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        name: goal.title,
        daysLeft: diffDays
      };
    }).filter(item => item.daysLeft >= 0);
  };

  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0); // 사용하지 않는 변수 주석 처리
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 요일 헤더
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="calendar-day header">
          {day}
        </div>
      );
    });
    
    // 날짜들
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isToday = currentDate.toDateString() === today.toDateString();
      const isCurrentMonth = currentDate.getMonth() === month;
      
      days.push(
        <div
          key={i}
          className={`calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
        >
          {currentDate.getDate()}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">홈</h1>
      
      <div className="home-grid">
        <div>
          <div className="stat-card" style={{ marginBottom: '1rem' }}>
            <div className="stat-title">오늘 날짜</div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>
              {getCurrentDate()}
            </div>
          </div>
          
          <div className="dday-section">
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>남은 디데이</h3>
            {getDDays().length > 0 ? (
              getDDays().map((dday, index) => (
                <div key={index} className="dday-item">
                  <span className="dday-name short-text">{dday.name}</span>
                  <span className="dday-count short-text">D-{dday.daysLeft}</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#7f8c8d', textAlign: 'center' }}>
                설정된 디데이가 없습니다.
              </p>
            )}
          </div>
          
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-title">이번 주 목표 달성률</div>
              <div className="stat-value">{getWeeklyProgress()}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">이번 달 목표 달성률</div>
              <div className="stat-value">{getMonthlyProgress()}%</div>
            </div>
          </div>
        </div>
        
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
  );
};

export default Home;
