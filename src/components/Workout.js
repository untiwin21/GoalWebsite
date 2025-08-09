import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Workout = () => {
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 워크아웃 데이터 로드
    const loadWorkoutData = async () => {
      try {
        const response = await fetch('/data/workout.json');
        const data = await response.json();
        setWorkoutData(data);
        setLoading(false);
      } catch (error) {
        console.error('워크아웃 데이터 로드 실패:', error);
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, []);

  if (loading) {
    return <div className="loading">데이터를 불러오는 중...</div>;
  }

  if (!workoutData) {
    return <div className="error">데이터를 불러올 수 없습니다.</div>;
  }

  const { bodyData, strength, cardio, recovery, todayPlan, aiAnalysis } = workoutData;

  // 3대 운동 진행률 계산
  const strengthProgress = (strength.current1RM.total / strength.current1RM.goal) * 100;

  // 차트 색상
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="workout-container">
      {/* 대시보드 섹션 */}
      <section className="dashboard-section">
        <h2>🏋️‍♂️ 운동 대시보드</h2>
        
        {/* 핵심 지표 */}
        <div className="kpi-cards">
          <div className="kpi-card">
            <h3>현재 체중</h3>
            <div className="kpi-value">{bodyData.current.weight}kg</div>
          </div>
          <div className="kpi-card">
            <h3>골격근량</h3>
            <div className="kpi-value">{bodyData.current.muscleMass}kg</div>
          </div>
          <div className="kpi-card">
            <h3>체지방률</h3>
            <div className="kpi-value">{bodyData.current.bodyFatPercentage}%</div>
          </div>
          <div className="kpi-card">
            <h3>3대 운동 총합</h3>
            <div className="kpi-value">{strength.current1RM.total}kg</div>
            <div className="kpi-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${strengthProgress}%` }}
                ></div>
              </div>
              <span>{strengthProgress.toFixed(1)}% (목표: {strength.current1RM.goal}kg)</span>
            </div>
          </div>
        </div>

        {/* 오늘의 계획 */}
        <div className="today-plan">
          <h3>📅 오늘의 훈련 계획</h3>
          <div className="plan-content">
            <p><strong>운동:</strong> {todayPlan.workout}</p>
            <p><strong>포커스:</strong> {todayPlan.focus}</p>
            <p><strong>목표 볼륨:</strong> {todayPlan.targetVolume.toLocaleString()}kg</p>
          </div>
        </div>
      </section>

      {/* 신체 데이터 섹션 */}
      <section className="body-data-section">
        <h2>📊 신체 데이터 변화</h2>
        
        <div className="chart-container">
          <h3>인바디 히스토리</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bodyData.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" name="체중(kg)" />
              <Line type="monotone" dataKey="muscleMass" stroke="#82ca9d" name="골격근량(kg)" />
              <Line type="monotone" dataKey="bodyFatPercentage" stroke="#ffc658" name="체지방률(%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>핵심 관리 지표 (VFA & WHR)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bodyData.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="vfa" stroke="#ff7300" name="내장지방(VFA)" />
              <Line type="monotone" dataKey="whr" stroke="#8dd1e1" name="복부지방률(WHR)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 수행 능력 섹션 */}
      <section className="performance-section">
        <h2>💪 수행 능력 기록</h2>
        
        {/* 3대 운동별 성장 곡선 */}
        <div className="strength-charts">
          <div className="chart-container">
            <h3>스쿼트 진행</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={strength.workingSets.squat}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" name="중량(kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>벤치프레스 진행</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={strength.workingSets.benchPress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#82ca9d" name="중량(kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>데드리프트 진행</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={strength.workingSets.deadlift}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#ffc658" name="중량(kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 총 볼륨 추이 */}
        <div className="chart-container">
          <h3>총 볼륨 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strength.volumeHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalVolume" fill="#8884d8" name="총 볼륨(kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 러닝 기록 */}
        <div className="running-section">
          <h3>🏃‍♂️ 러닝 기록</h3>
          <div className="chart-container">
            <h4>장거리 러닝 진행</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cardio.longRuns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="distance" stroke="#82ca9d" name="거리(km)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 회복 및 컨디션 섹션 */}
      <section className="recovery-section">
        <h2>😴 회복 및 컨디션</h2>
        
        <div className="chart-container">
          <h3>수면 로그</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recovery.sleepLog}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sleepHours" stroke="#8884d8" name="수면시간(시간)" />
              <Line type="monotone" dataKey="quality" stroke="#82ca9d" name="수면의질(1-5점)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>주관적 컨디션</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recovery.dailyCondition}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fatigue" stroke="#ff7300" name="피로도" />
              <Line type="monotone" dataKey="stress" stroke="#ffc658" name="스트레스" />
              <Line type="monotone" dataKey="motivation" stroke="#82ca9d" name="운동의욕" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* AI 분석 섹션 */}
      <section className="ai-analysis-section">
        <h2>🤖 AI 종합 분석</h2>
        
        <div className="analysis-content">
          <div className="weekly-diagnosis">
            <h3>주간 시스템 진단</h3>
            <p>{aiAnalysis.weeklyDiagnosis}</p>
          </div>

          <div className="action-items">
            <h3>핵심 제언 (Action Items)</h3>
            <ul>
              {aiAnalysis.actionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="next-focus">
            <h3>다음 주 포커스</h3>
            <p>{aiAnalysis.nextWeekFocus}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Workout;
