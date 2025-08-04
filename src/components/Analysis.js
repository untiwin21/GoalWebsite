import React from 'react';

const Analysis = ({ data }) => {
  const calculateWeeklyStats = () => {
    if (!data.weeklyGoals || data.weeklyGoals.length === 0) {
      return { average: 0, completed: 0, total: 0 };
    }
    
    let totalProgress = 0;
    let completedGoals = 0;
    
    data.weeklyGoals.forEach(goal => {
      const progress = getGoalProgress(goal);
      totalProgress += progress;
      if (progress === 100) completedGoals++;
    });
    
    return {
      average: Math.round(totalProgress / data.weeklyGoals.length),
      completed: completedGoals,
      total: data.weeklyGoals.length
    };
  };

  const calculateMonthlyStats = () => {
    if (!data.monthlyGoals || data.monthlyGoals.length === 0) {
      return { average: 0, completed: 0, total: 0 };
    }
    
    let totalProgress = 0;
    let completedGoals = 0;
    
    data.monthlyGoals.forEach(goal => {
      const progress = getGoalProgress(goal);
      totalProgress += progress;
      if (progress === 100) completedGoals++;
    });
    
    return {
      average: Math.round(totalProgress / data.monthlyGoals.length),
      completed: completedGoals,
      total: data.monthlyGoals.length
    };
  };

  const calculateThinkBigStats = () => {
    if (!data.thinkBigGoals || data.thinkBigGoals.length === 0) {
      return { average: 0, completed: 0, total: 0, expired: 0 };
    }
    
    let totalProgress = 0;
    let completedGoals = 0;
    let expiredGoals = 0;
    const today = new Date();
    
    data.thinkBigGoals.forEach(goal => {
      const progress = getGoalProgress(goal);
      totalProgress += progress;
      if (progress === 100) completedGoals++;
      
      const endDate = new Date(goal.endDate);
      if (endDate < today && progress < 100) expiredGoals++;
    });
    
    return {
      average: Math.round(totalProgress / data.thinkBigGoals.length),
      completed: completedGoals,
      total: data.thinkBigGoals.length,
      expired: expiredGoals
    };
  };

  const getGoalProgress = (goal) => {
    if (!goal.subGoals || goal.subGoals.length === 0) {
      return goal.completed ? 100 : 0;
    }
    
    const completed = goal.subGoals.filter(sub => sub.completed).length;
    return Math.round((completed / goal.subGoals.length) * 100);
  };

  const calculateOverallStats = () => {
    const weeklyStats = calculateWeeklyStats();
    const monthlyStats = calculateMonthlyStats();
    const thinkBigStats = calculateThinkBigStats();
    
    const totalGoals = weeklyStats.total + monthlyStats.total + thinkBigStats.total;
    const totalCompleted = weeklyStats.completed + monthlyStats.completed + thinkBigStats.completed;
    
    if (totalGoals === 0) {
      return { completionRate: 0, totalGoals: 0, totalCompleted: 0 };
    }
    
    return {
      completionRate: Math.round((totalCompleted / totalGoals) * 100),
      totalGoals,
      totalCompleted
    };
  };

  const getMostProductivePeriod = () => {
    const weeklyStats = calculateWeeklyStats();
    const monthlyStats = calculateMonthlyStats();
    const thinkBigStats = calculateThinkBigStats();
    
    const periods = [
      { name: '주간 목표', average: weeklyStats.average },
      { name: '월간 목표', average: monthlyStats.average },
      { name: '장기 목표', average: thinkBigStats.average }
    ];
    
    const best = periods.reduce((prev, current) => 
      prev.average > current.average ? prev : current
    );
    
    return best.average > 0 ? best.name : '데이터 없음';
  };

  const getTaskCompletionTrend = () => {
    // 간단한 트렌드 분석 (실제로는 더 복잡한 시계열 분석이 필요)
    const weeklyStats = calculateWeeklyStats();
    const monthlyStats = calculateMonthlyStats();
    
    if (weeklyStats.average > monthlyStats.average) {
      return '단기 목표에 더 집중하는 경향';
    } else if (monthlyStats.average > weeklyStats.average) {
      return '장기 계획에 더 집중하는 경향';
    } else {
      return '균형잡힌 목표 달성 패턴';
    }
  };

  const weeklyStats = calculateWeeklyStats();
  const monthlyStats = calculateMonthlyStats();
  const thinkBigStats = calculateThinkBigStats();
  const overallStats = calculateOverallStats();

  return (
    <div className="page-container">
      <h1 className="page-title">목표 달성 분석</h1>
      
      <div className="analysis-grid">
        <div className="analysis-card">
          <div className="analysis-title">전체 목표 달성률</div>
          <div className="analysis-value">{overallStats.completionRate}%</div>
          <div className="analysis-description">
            총 {overallStats.totalGoals}개 목표 중 {overallStats.totalCompleted}개 완료
          </div>
        </div>
        
        <div className="analysis-card">
          <div className="analysis-title">주간 목표 평균 달성률</div>
          <div className="analysis-value">{weeklyStats.average}%</div>
          <div className="analysis-description">
            {weeklyStats.total}개 목표 중 {weeklyStats.completed}개 완료
          </div>
        </div>
        
        <div className="analysis-card">
          <div className="analysis-title">월간 목표 평균 달성률</div>
          <div className="analysis-value">{monthlyStats.average}%</div>
          <div className="analysis-description">
            {monthlyStats.total}개 목표 중 {monthlyStats.completed}개 완료
          </div>
        </div>
        
        <div className="analysis-card">
          <div className="analysis-title">장기 목표 평균 달성률</div>
          <div className="analysis-value">{thinkBigStats.average}%</div>
          <div className="analysis-description">
            {thinkBigStats.total}개 목표 중 {thinkBigStats.completed}개 완료
          </div>
        </div>
        
        <div className="analysis-card">
          <div className="analysis-title">가장 생산적인 영역</div>
          <div className="analysis-value" style={{ fontSize: '1.5rem' }}>
            {getMostProductivePeriod()}
          </div>
          <div className="analysis-description">
            가장 높은 달성률을 보이는 목표 유형
          </div>
        </div>
        
        <div className="analysis-card">
          <div className="analysis-title">목표 달성 패턴</div>
          <div className="analysis-value" style={{ fontSize: '1.2rem' }}>
            {getTaskCompletionTrend()}
          </div>
          <div className="analysis-description">
            당신의 목표 달성 성향 분석
          </div>
        </div>
        
        {thinkBigStats.expired > 0 && (
          <div className="analysis-card" style={{ borderLeftColor: '#e74c3c' }}>
            <div className="analysis-title">기한 초과 장기 목표</div>
            <div className="analysis-value" style={{ color: '#e74c3c' }}>
              {thinkBigStats.expired}개
            </div>
            <div className="analysis-description">
              기한이 지났지만 완료되지 않은 목표들
            </div>
          </div>
        )}
        
        <div className="analysis-card" style={{ borderLeftColor: '#f39c12' }}>
          <div className="analysis-title">목표 설정 활동</div>
          <div className="analysis-value" style={{ color: '#f39c12' }}>
            {overallStats.totalGoals}개
          </div>
          <div className="analysis-description">
            지금까지 설정한 총 목표 수
          </div>
        </div>
      </div>
      
      {overallStats.totalGoals === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#7f8c8d', 
          padding: '3rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          marginTop: '2rem'
        }}>
          <h3>분석할 데이터가 없습니다</h3>
          <p>목표를 설정하고 달성해보세요!</p>
        </div>
      )}
      
      {overallStats.totalGoals > 0 && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: '#e8f5e8', 
          borderRadius: '8px',
          borderLeft: '4px solid #27ae60'
        }}>
          <h3 style={{ color: '#27ae60', marginBottom: '1rem' }}>💡 개선 제안</h3>
          <ul style={{ color: '#2c3e50', lineHeight: '1.6' }}>
            {overallStats.completionRate < 50 && (
              <li>목표 달성률이 낮습니다. 더 작고 구체적인 목표로 나누어 보세요.</li>
            )}
            {weeklyStats.average < monthlyStats.average && (
              <li>주간 목표 달성률이 낮습니다. 주간 계획을 더 세밀하게 세워보세요.</li>
            )}
            {thinkBigStats.expired > 0 && (
              <li>기한이 지난 장기 목표가 있습니다. 목표를 재검토하고 새로운 계획을 세워보세요.</li>
            )}
            {overallStats.completionRate >= 80 && (
              <li>훌륭한 목표 달성률입니다! 더 도전적인 목표를 설정해보세요.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Analysis;
