// 워크아웃 데이터 관리 유틸리티
class WorkoutDataManager {
  constructor() {
    this.dataFiles = {
      workout: '/data/workout.json',
      goals: '/data/goals.json'
    };
  }

  // 워크아웃 데이터 로드
  async loadWorkoutData() {
    try {
      const response = await fetch(this.dataFiles.workout);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('워크아웃 데이터 로드 실패:', error);
      return this.getDefaultWorkoutData();
    }
  }

  // 기본 워크아웃 데이터 구조
  getDefaultWorkoutData() {
    return {
      bodyData: {
        current: {
          weight: 0,
          muscleMass: 0,
          bodyFatPercentage: 0,
          vfa: 0,
          whr: 0,
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        history: []
      },
      strength: {
        current1RM: {
          squat: 0,
          benchPress: 0,
          deadlift: 0,
          total: 0,
          goal: 0
        },
        workingSets: {
          squat: [],
          benchPress: [],
          deadlift: []
        },
        volumeHistory: []
      },
      cardio: {
        longRuns: [],
        intervals: []
      },
      recovery: {
        sleepLog: [],
        dailyCondition: []
      },
      todayPlan: {
        date: new Date().toISOString().split('T')[0],
        workout: "",
        focus: "",
        targetVolume: 0
      },
      aiAnalysis: {
        lastAnalysis: "",
        weeklyDiagnosis: "",
        actionItems: [],
        nextWeekFocus: ""
      }
    };
  }

  // 신체 데이터 추가
  addBodyData(data, newEntry) {
    const updatedData = { ...data };
    updatedData.bodyData.history.push(newEntry);
    updatedData.bodyData.current = { ...newEntry, lastUpdated: newEntry.date };
    return updatedData;
  }

  // 운동 기록 추가
  addWorkoutRecord(data, exercise, record) {
    const updatedData = { ...data };
    if (updatedData.strength.workingSets[exercise]) {
      updatedData.strength.workingSets[exercise].push(record);
    }
    return updatedData;
  }

  // 수면 기록 추가
  addSleepRecord(data, sleepData) {
    const updatedData = { ...data };
    updatedData.recovery.sleepLog.push(sleepData);
    return updatedData;
  }

  // 컨디션 기록 추가
  addConditionRecord(data, conditionData) {
    const updatedData = { ...data };
    updatedData.recovery.dailyCondition.push(conditionData);
    return updatedData;
  }

  // 러닝 기록 추가
  addRunningRecord(data, type, record) {
    const updatedData = { ...data };
    if (type === 'longRun') {
      updatedData.cardio.longRuns.push(record);
    } else if (type === 'interval') {
      updatedData.cardio.intervals.push(record);
    }
    return updatedData;
  }

  // 1RM 계산 (Epley 공식)
  calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }

  // 총 볼륨 계산
  calculateTotalVolume(workingSets) {
    return workingSets.reduce((total, set) => {
      return total + (set.weight * set.reps * set.sets);
    }, 0);
  }

  // 주간 평균 계산
  calculateWeeklyAverage(data, field) {
    if (!data || data.length === 0) return 0;
    
    const lastWeek = data.slice(-7);
    const sum = lastWeek.reduce((total, item) => total + (item[field] || 0), 0);
    return (sum / lastWeek.length).toFixed(1);
  }

  // 진행률 계산
  calculateProgress(current, goal) {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  }

  // 데이터 검증
  validateWorkoutData(data) {
    const required = ['bodyData', 'strength', 'cardio', 'recovery', 'todayPlan', 'aiAnalysis'];
    return required.every(key => data.hasOwnProperty(key));
  }

  // 로컬 스토리지에 저장
  saveToLocalStorage(data) {
    try {
      localStorage.setItem('workoutData', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
      return false;
    }
  }

  // 로컬 스토리지에서 로드
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('workoutData');
      return data ? JSON.parse(data) : this.getDefaultWorkoutData();
    } catch (error) {
      console.error('로컬 스토리지 로드 실패:', error);
      return this.getDefaultWorkoutData();
    }
  }
}

export default WorkoutDataManager;
