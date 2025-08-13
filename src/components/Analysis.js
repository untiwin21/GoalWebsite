import React from 'react';

const Analysis = ({ data }) => {
  const getTotalWeeklyGoals = () => {
    if (!data.weeklyGoals) return 0;
    return Object.values(data.weeklyGoals).reduce((total, yearData) => {
      return total + Object.values(yearData).reduce((yearTotal, weekData) => {
        return yearTotal + weekData.length;
      }, 0);
    }, 0);
  };

  const getCompletedWeeklyGoals = () => {
    if (!data.weeklyGoals) return 0;
    return Object.values(data.weeklyGoals).reduce((total, yearData) => {
      return total + Object.values(yearData).reduce((yearTotal, weekData) => {
        return yearTotal + weekData.filter(goal => goal.completed).length;
      }, 0);
    }, 0);
  };

  const getTotalMonthlyGoals = () => data.monthlyGoals?.length || 0;
  const getCompletedMonthlyGoals = () => data.monthlyGoals?.filter(g => g.completed).length || 0;

  const getTotalThinkBigGoals = () => data.thinkBigGoals?.length || 0;
  const getCompletedThinkBigGoals = () => {
    const today = new Date().toISOString().split('T')[0];
    return data.thinkBigGoals?.filter(g => g.endDate < today).length || 0;
  };

  const analysisData = [
    { title: '총 주간 목표 수', value: getTotalWeeklyGoals(), description: '지금까지 설정한 모든 주간 목표의 총합입니다.' },
    { title: '완료된 주간 목표', value: getCompletedWeeklyGoals(), description: '달성 완료한 주간 목표의 수입니다.' },
    { title: '총 월간 목표 수', value: getTotalMonthlyGoals(), description: '설정한 월간 목표의 총 개수입니다.' },
    { title: '완료된 월간 목표', value: getCompletedMonthlyGoals(), description: '성공적으로 마친 월간 목표들입니다.' },
    { title: '총 장기 목표 수', value: getTotalThinkBigGoals(), description: '수립한 장기 비전과 목표의 수입니다.' },
    { title: '완료된 장기 목표', value: getCompletedThinkBigGoals(), description: '데드라인이 지나 완료 처리된 장기 목표입니다.' },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">목표 분석</h1>
      <p className="page-subtitle">데이터를 통해 당신의 성취를 한눈에 확인하고, 성장의 패턴을 발견하세요.</p>
      
      <div className="analysis-grid">
        {analysisData.map((item, index) => (
          <div className="analysis-card" key={index}>
            <h3 className="analysis-title">{item.title}</h3>
            <p className="analysis-value">{item.value}</p>
            <p className="analysis-description">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analysis;
