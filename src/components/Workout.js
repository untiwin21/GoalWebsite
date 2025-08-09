import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Workout = () => {
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInputForm, setShowInputForm] = useState(false);
  const [workoutInput, setWorkoutInput] = useState('');
  const [inbodyInput, setInbodyInput] = useState({
    weight: '',
    muscleMass: '',
    bodyFat: '',
    vfa: '',
    whr: '',
    bmr: '',
    bodyDevelopment: ''
  });
  const [aiAnalysisInput, setAiAnalysisInput] = useState('');
  const [runningInput, setRunningInput] = useState({
    type: 'longRun', // 'longRun' or 'interval'
    distance: '',
    time: '',
    pace: '',
    description: ''
  });

  useEffect(() => {
    // 워크아웃 데이터 로드
    const loadWorkoutData = async () => {
      try {
        // 먼저 로컬스토리지에서 확인
        const localData = localStorage.getItem('workoutData');
        if (localData) {
          const parsedData = JSON.parse(localData);
          setWorkoutData(parsedData);
          setLoading(false);
          return;
        }

        // 로컬스토리지에 없으면 public 폴더에서 데이터 로드
        const response = await fetch(`${process.env.PUBLIC_URL}/data/workout.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWorkoutData(data);
        setLoading(false);
      } catch (error) {
        console.error('워크아웃 데이터 로드 실패:', error);
        // 기본 데이터로 폴백
        const defaultData = {
          bodyData: {
            current: { weight: 0, muscleMass: 0, bodyFatPercentage: 0, vfa: 0, whr: 0 },
            history: []
          },
          strength: {
            current1RM: { squat: 0, benchPress: 0, deadlift: 0, total: 0, goal: 450 },
            workingSets: { squat: [], benchPress: [], deadlift: [] },
            volumeHistory: []
          },
          cardio: { longRuns: [], intervals: [] },
          recovery: { sleepLog: [], dailyCondition: [] },
          todayPlan: { date: new Date().toISOString().split('T')[0], workout: "", focus: "", targetVolume: 0 },
          aiAnalysis: { lastAnalysis: "", weeklyDiagnosis: "", actionItems: [], nextWeekFocus: "" }
        };
        setWorkoutData(defaultData);
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, []);

  // 현재 인바디 데이터를 입력 필드에 로드
  const loadCurrentInbodyData = () => {
    if (workoutData && workoutData.bodyData.current.weight > 0) {
      setInbodyInput({
        weight: workoutData.bodyData.current.weight.toString(),
        muscleMass: workoutData.bodyData.current.muscleMass.toString(),
        bodyFat: workoutData.bodyData.current.bodyFatPercentage.toString(),
        vfa: workoutData.bodyData.current.vfa.toString(),
        whr: workoutData.bodyData.current.whr.toString(),
        bmr: '',
        bodyDevelopment: ''
      });
    }
  };

  // 입력 필드 초기화
  const clearInbodyInput = () => {
    setInbodyInput({
      weight: '', muscleMass: '', bodyFat: '', vfa: '', whr: '', bmr: '', bodyDevelopment: ''
    });
  };

  // 데이터 백업 다운로드
  const downloadBackup = () => {
    const dataStr = JSON.stringify(workoutData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 데이터 백업 복원
  const handleBackupRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        setWorkoutData(backupData);
        localStorage.setItem('workoutData', JSON.stringify(backupData));
        alert('백업 데이터가 성공적으로 복원되었습니다!');
      } catch (error) {
        alert('백업 파일을 읽는데 실패했습니다.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // 파일 입력 초기화
  };

  // 운동 데이터 파싱 함수
  const parseWorkoutData = (input) => {
    const lines = input.split('\n').filter(line => line.trim());
    const exercises = [];
    let currentExercise = null;
    let totalVolume = 0;
    let totalReps = 0;
    let totalSets = 0;

    for (const line of lines) {
      if (line.includes('kg X') && line.includes('렙')) {
        // 세트 데이터 파싱
        const match = line.match(/(\d+)kg X (\d+)렙/);
        if (match && currentExercise) {
          const weight = parseInt(match[1]);
          const reps = parseInt(match[2]);
          currentExercise.sets.push({ weight, reps });
          totalVolume += weight * reps;
          totalReps += reps;
          totalSets += 1;
        }
      } else if (line.trim() && !line.includes('세트') && !line.includes('볼륨') && !line.includes('분')) {
        // 새로운 운동 시작
        if (currentExercise) {
          exercises.push(currentExercise);
        }
        currentExercise = {
          name: line.trim(),
          sets: []
        };
      }
    }

    if (currentExercise) {
      exercises.push(currentExercise);
    }

    return { exercises, totalVolume, totalReps, totalSets };
  };

  // 데이터 저장 함수
  const saveWorkoutData = async (newData) => {
    try {
      // 실제로는 서버나 GitHub API를 통해 저장해야 하지만, 
      // 현재는 로컬 스토리지에 저장
      localStorage.setItem('workoutData', JSON.stringify(newData));
      setWorkoutData(newData);
      alert('데이터가 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      alert('데이터 저장에 실패했습니다.');
    }
  };

  // 운동 기록 추가
  const handleWorkoutSubmit = () => {
    if (!workoutInput.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const parsedData = parseWorkoutData(workoutInput);
    
    const updatedData = { ...workoutData };
    
    // 각 운동별로 데이터 추가
    parsedData.exercises.forEach(exercise => {
      const exerciseName = exercise.name.toLowerCase();
      let category = 'other';
      
      if (exerciseName.includes('데드리프트') || exerciseName.includes('deadlift')) {
        category = 'deadlift';
      } else if (exerciseName.includes('벤치') || exerciseName.includes('bench') || exerciseName.includes('바벨 플랫 벤치 프레스')) {
        category = 'benchPress';
      } else if (exerciseName.includes('스쿼트') || exerciseName.includes('squat')) {
        category = 'squat';
      }
      
      if (category !== 'other' && exercise.sets.length > 0) {
        const avgWeight = exercise.sets.reduce((sum, set) => sum + set.weight, 0) / exercise.sets.length;
        const avgReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0) / exercise.sets.length;
        
        updatedData.strength.workingSets[category].push({
          date: today,
          weight: Math.round(avgWeight),
          reps: Math.round(avgReps),
          sets: exercise.sets.length
        });
      }
    });

    // 볼륨 히스토리 추가
    updatedData.strength.volumeHistory.push({
      date: today,
      totalVolume: parsedData.totalVolume
    });

    saveWorkoutData(updatedData);
    setWorkoutInput('');
  };

  // 인바디 데이터 추가/수정
  const handleInbodySubmit = () => {
    if (!inbodyInput.weight) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedData = { ...workoutData };
    
    const newBodyData = {
      date: today,
      weight: parseFloat(inbodyInput.weight),
      muscleMass: parseFloat(inbodyInput.muscleMass),
      bodyFatPercentage: parseFloat(inbodyInput.bodyFat),
      vfa: parseFloat(inbodyInput.vfa),
      whr: parseFloat(inbodyInput.whr)
    };

    // 같은 날짜의 기존 데이터가 있는지 확인
    const existingIndex = updatedData.bodyData.history.findIndex(item => item.date === today);
    
    if (existingIndex !== -1) {
      // 기존 데이터 수정
      updatedData.bodyData.history[existingIndex] = newBodyData;
      alert('오늘의 인바디 데이터가 수정되었습니다.');
    } else {
      // 새 데이터 추가
      updatedData.bodyData.history.push(newBodyData);
      alert('인바디 데이터가 저장되었습니다.');
    }
    
    updatedData.bodyData.current = { ...newBodyData, lastUpdated: today };
    saveWorkoutData(updatedData);
  };

  // 오늘의 인바디 데이터 확인
  const getTodayInbodyData = () => {
    if (!workoutData || !workoutData.bodyData.history) return null;
    const today = new Date().toISOString().split('T')[0];
    return workoutData.bodyData.history.find(item => item.date === today);
  };

  // 오늘의 인바디 데이터를 입력 필드에 로드
  const loadTodayInbodyData = () => {
    const todayData = getTodayInbodyData();
    if (todayData) {
      setInbodyInput({
        weight: todayData.weight.toString(),
        muscleMass: todayData.muscleMass.toString(),
        bodyFat: todayData.bodyFatPercentage.toString(),
        vfa: todayData.vfa.toString(),
        whr: todayData.whr.toString(),
        bmr: '',
        bodyDevelopment: ''
      });
    } else {
      alert('오늘 입력된 인바디 데이터가 없습니다.');
    }
  };

  // AI 분석 추가
  const handleAiAnalysisSubmit = () => {
    if (!aiAnalysisInput.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedData = { ...workoutData };
    
    // AI 분석에서 핵심 내용 추출
    const lines = aiAnalysisInput.split('\n').filter(line => line.trim());
    const actionItems = [];
    const diagnosis = [];

    lines.forEach(line => {
      if (line.includes('추천:') || line.includes('제언:') || line.includes('조정 방안:')) {
        actionItems.push(line.replace(/추천:|제언:|조정 방안:/, '').trim());
      } else if (line.includes('분석:') || line.includes('해석:')) {
        diagnosis.push(line.replace(/분석:|해석:/, '').trim());
      }
    });

    updatedData.aiAnalysis = {
      lastAnalysis: today,
      weeklyDiagnosis: diagnosis.join(' '),
      actionItems: actionItems.length > 0 ? actionItems : ['수면의 질 개선', '스트레스 관리', '운동 강도 조절'],
      nextWeekFocus: "수면과 회복에 집중하여 내장지방 감소"
    };

    saveWorkoutData(updatedData);
    setAiAnalysisInput('');
  };

  // 러닝 기록 추가
  const handleRunningSubmit = () => {
    if (!runningInput.distance && !runningInput.time) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedData = { ...workoutData };
    
    const runningRecord = {
      date: today,
      distance: parseFloat(runningInput.distance) || 0,
      time: runningInput.time,
      pace: runningInput.pace,
      description: runningInput.description
    };

    if (runningInput.type === 'longRun') {
      updatedData.cardio.longRuns.push(runningRecord);
    } else {
      updatedData.cardio.intervals.push({
        ...runningRecord,
        type: runningInput.description
      });
    }

    saveWorkoutData(updatedData);
    setRunningInput({
      type: 'longRun',
      distance: '',
      time: '',
      pace: '',
      description: ''
    });
  };

  if (loading) {
    return <div className="loading">데이터를 불러오는 중...</div>;
  }

  if (!workoutData) {
    return <div className="error">데이터를 불러올 수 없습니다.</div>;
  }

  const { bodyData, strength, cardio, recovery, todayPlan, aiAnalysis } = workoutData;

  // 3대 운동 진행률 계산
  const strengthProgress = (strength.current1RM.total / strength.current1RM.goal) * 100;

  return (
    <div className="workout-container">
      {/* 데이터 입력 버튼 */}
      <div className="input-controls">
        <button 
          className="input-toggle-btn"
          onClick={() => setShowInputForm(!showInputForm)}
        >
          {showInputForm ? '📊 대시보드 보기' : '✏️ 데이터 입력'}
        </button>
        
        {/* 백업/복원 버튼들 */}
        <div className="backup-controls">
          <button onClick={downloadBackup} className="backup-btn">
            💾 백업 다운로드
          </button>
          <label className="restore-btn">
            📂 백업 복원
            <input
              type="file"
              accept=".json"
              onChange={handleBackupRestore}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* 데이터 입력 폼 */}
      {showInputForm && (
        <section className="data-input-section">
          <h2>📝 운동 데이터 입력</h2>
          
          {/* 데이터 상태 표시 */}
          <div className="data-status">
            <p>
              <span className="status-indicator">💾 데이터 저장 상태:</span> 
              {workoutData && (workoutData.bodyData.history.length > 0 || 
                workoutData.strength.volumeHistory.length > 0 || 
                workoutData.cardio.longRuns.length > 0) 
                ? ' 저장된 데이터가 있습니다 (로컬 저장소에 보관됨)'
                : ' 아직 저장된 데이터가 없습니다'
              }
            </p>
          </div>
          
          {/* 운동 기록 입력 */}
          <div className="input-form">
            <h3>운동 기록</h3>
            <textarea
              value={workoutInput}
              onChange={(e) => setWorkoutInput(e.target.value)}
              placeholder="예시:
데드리프트
1. 90kg X 5렙
2. 90kg X 5렙
3. 90kg X 5렙

바벨 플랫 벤치 프레스
1. 70kg X 5렙
2. 70kg X 5렙
3. 70kg X 5렙"
              rows={10}
              className="workout-textarea"
            />
            <button onClick={handleWorkoutSubmit} className="submit-btn">
              운동 기록 저장
            </button>
          </div>

          {/* 인바디 입력 */}
          <div className="input-form">
            <div className="form-header">
              <h3>인바디 결과</h3>
              <div className="inbody-controls">
                <button 
                  type="button" 
                  onClick={loadTodayInbodyData} 
                  className="load-current-btn"
                >
                  오늘 데이터 불러오기
                </button>
                <button 
                  type="button" 
                  onClick={loadCurrentInbodyData} 
                  className="load-current-btn"
                >
                  최신 데이터 불러오기
                </button>
                <button 
                  type="button" 
                  onClick={clearInbodyInput} 
                  className="clear-btn"
                >
                  초기화
                </button>
              </div>
            </div>
            
            {/* 오늘 데이터 상태 표시 */}
            <div className="today-status">
              {getTodayInbodyData() ? (
                <p className="has-data">✅ 오늘 인바디 데이터가 이미 입력되어 있습니다. 수정 가능합니다.</p>
              ) : (
                <p className="no-data">📝 오늘 인바디 데이터를 입력해주세요.</p>
              )}
            </div>
            
            <div className="inbody-inputs">
              <input
                type="number"
                placeholder="체중 (kg)"
                value={inbodyInput.weight}
                onChange={(e) => setInbodyInput({...inbodyInput, weight: e.target.value})}
              />
              <input
                type="number"
                placeholder="골격근량 (kg)"
                value={inbodyInput.muscleMass}
                onChange={(e) => setInbodyInput({...inbodyInput, muscleMass: e.target.value})}
              />
              <input
                type="number"
                placeholder="체지방률 (%)"
                value={inbodyInput.bodyFat}
                onChange={(e) => setInbodyInput({...inbodyInput, bodyFat: e.target.value})}
              />
              <input
                type="number"
                placeholder="VFA"
                value={inbodyInput.vfa}
                onChange={(e) => setInbodyInput({...inbodyInput, vfa: e.target.value})}
              />
              <input
                type="number"
                placeholder="WHR"
                step="0.01"
                value={inbodyInput.whr}
                onChange={(e) => setInbodyInput({...inbodyInput, whr: e.target.value})}
              />
            </div>
            <button onClick={handleInbodySubmit} className="submit-btn">
              {getTodayInbodyData() ? '오늘 인바디 데이터 수정' : '인바디 결과 저장'}
            </button>
          </div>

          {/* 러닝 기록 입력 */}
          <div className="input-form">
            <h3>러닝 기록</h3>
            <div className="running-type-selector">
              <label>
                <input
                  type="radio"
                  value="longRun"
                  checked={runningInput.type === 'longRun'}
                  onChange={(e) => setRunningInput({...runningInput, type: e.target.value})}
                />
                장거리 러닝
              </label>
              <label>
                <input
                  type="radio"
                  value="interval"
                  checked={runningInput.type === 'interval'}
                  onChange={(e) => setRunningInput({...runningInput, type: e.target.value})}
                />
                인터벌 훈련
              </label>
            </div>
            
            <div className="running-inputs">
              <input
                type="number"
                placeholder="거리 (km)"
                step="0.1"
                value={runningInput.distance}
                onChange={(e) => setRunningInput({...runningInput, distance: e.target.value})}
              />
              <input
                type="text"
                placeholder="시간 (예: 42:30)"
                value={runningInput.time}
                onChange={(e) => setRunningInput({...runningInput, time: e.target.value})}
              />
              <input
                type="text"
                placeholder="페이스 (예: 5:00)"
                value={runningInput.pace}
                onChange={(e) => setRunningInput({...runningInput, pace: e.target.value})}
              />
              <input
                type="text"
                placeholder={runningInput.type === 'interval' ? "훈련 타입 (예: 400m x 6)" : "메모"}
                value={runningInput.description}
                onChange={(e) => setRunningInput({...runningInput, description: e.target.value})}
              />
            </div>
            <button onClick={handleRunningSubmit} className="submit-btn">
              러닝 기록 저장
            </button>
          </div>

          {/* AI 분석 입력 */}
          <div className="input-form">
            <h3>AI 분석 결과</h3>
            <textarea
              value={aiAnalysisInput}
              onChange={(e) => setAiAnalysisInput(e.target.value)}
              placeholder="AI 분석 결과를 붙여넣으세요..."
              rows={8}
              className="ai-textarea"
            />
            <button onClick={handleAiAnalysisSubmit} className="submit-btn">
              AI 분석 저장
            </button>
          </div>
        </section>
      )}

      {/* 기존 대시보드 내용 */}
      {!showInputForm && (
        <>
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
            
            {bodyData.history.length > 0 && (
              <>
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
              </>
            )}
          </section>

          {/* 수행 능력 섹션 */}
          <section className="performance-section">
            <h2>💪 수행 능력 기록</h2>
            
            {/* 3대 운동별 성장 곡선 */}
            <div className="strength-charts">
              {strength.workingSets.squat.length > 0 && (
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
              )}

              {strength.workingSets.benchPress.length > 0 && (
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
              )}

              {strength.workingSets.deadlift.length > 0 && (
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
              )}
            </div>

            {/* 총 볼륨 추이 */}
            {strength.volumeHistory.length > 0 && (
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
            )}

            {/* 러닝 기록 */}
            <div className="running-section">
              <h3>🏃‍♂️ 러닝 기록</h3>
              
              {cardio.longRuns.length > 0 && (
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
              )}

              {cardio.intervals.length > 0 && (
                <div className="chart-container">
                  <h4>인터벌 훈련 기록</h4>
                  <div className="interval-records">
                    {cardio.intervals.map((record, index) => (
                      <div key={index} className="interval-record">
                        <span className="date">{record.date}</span>
                        <span className="type">{record.type || record.description}</span>
                        <span className="pace">평균 페이스: {record.pace}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 회복 및 컨디션 섹션 */}
          <section className="recovery-section">
            <h2>😴 회복 및 컨디션</h2>
            
            {recovery.sleepLog.length > 0 && (
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
            )}

            {recovery.dailyCondition.length > 0 && (
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
            )}
          </section>

          {/* AI 분석 섹션 */}
          <section className="ai-analysis-section">
            <h2>🤖 AI 종합 분석</h2>
            
            <div className="analysis-content">
              <div className="weekly-diagnosis">
                <h3>주간 시스템 진단</h3>
                <p>{aiAnalysis.weeklyDiagnosis || '아직 분석 결과가 없습니다.'}</p>
              </div>

              <div className="action-items">
                <h3>핵심 제언 (Action Items)</h3>
                <ul>
                  {aiAnalysis.actionItems && aiAnalysis.actionItems.length > 0 ? 
                    aiAnalysis.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    )) : 
                    <li>아직 제언 사항이 없습니다.</li>
                  }
                </ul>
              </div>

              <div className="next-focus">
                <h3>다음 주 포커스</h3>
                <p>{aiAnalysis.nextWeekFocus || '아직 포커스가 설정되지 않았습니다.'}</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Workout;
