import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Weekly from './components/Weekly';
import Monthly from './components/Monthly';
import ThinkBig from './components/ThinkBig';
import Analysis from './components/Analysis';
import Motivation from './components/Motivation';
import WritingSpace from './components/Study';
import Workout from './components/Workout'; 
import Budget from './components/Budget';   
import GitHubStorage from './utils/githubStorage';
import { useScreenSize } from './utils/deviceDetection';

// --- 날짜 관련 헬퍼 함수 ---
// 주어진 날짜가 해당 연도의 몇 번째 주인지 계산 (일요일 시작 기준)
const getWeekNumber = (d) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Find the first day of the year
  const yearStart = new Date(date.getFullYear(), 0, 1);
  // Find the day of the week for the first day of the year (0=Sun, 1=Mon,...)
  const firstDayOfWeek = yearStart.getDay();
  // Calculate the number of days past the first Sunday.
  const dayOfYear = ((date - yearStart) / 86400000) + 1;
  // Calculate the week number
  return Math.ceil((dayOfYear + firstDayOfWeek) / 7);
};


function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [data, setData] = useState({
    weeklyGoals: {}, 
    monthlyGoals: [],
    thinkBigGoals: [],
    completedTasks: [],
    motivationItems: [],
    events: [],
    writingNotes: [],
    todayTodos: [],
    todayTodosDate: null,
    workoutData: [],
    budgetData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentSha, setCurrentSha] = useState(null);
  const githubStorage = new GitHubStorage();
  const screenSize = useScreenSize();

  const loadData = async () => {
    try {
      console.log('🔄 GitHub에서 데이터 로드 시도...');
      const result = await githubStorage.getFileContent();
      let loadedData = result.content;

      // --- 데이터 마이그레이션 로직 시작 ---
      if (Array.isArray(loadedData.weeklyGoals)) {
        console.log('⏳ 기존 데이터 구조 발견. 마이그레이션을 시작합니다...');
        const newWeeklyGoals = {};
        loadedData.weeklyGoals.forEach(goal => {
          const goalDate = new Date(goal.createdAt || goal.id || Date.now());
          const year = goalDate.getFullYear();
          const week = getWeekNumber(goalDate);

          if (!newWeeklyGoals[year]) newWeeklyGoals[year] = {};
          if (!newWeeklyGoals[year][week]) newWeeklyGoals[year][week] = [];
          
          if (!goal.createdAt) {
            goal.createdAt = goalDate.toISOString();
          }
          newWeeklyGoals[year][week].push(goal);
        });
        loadedData.weeklyGoals = newWeeklyGoals;
        console.log('✅ 데이터 마이그레이션 완료!');
      }
      // --- 데이터 마이그레이션 로직 끝 ---
      
      const sanitizedData = {
        weeklyGoals: {},
        monthlyGoals: [],
        thinkBigGoals: [],
        ...loadedData,
      };

      setData(sanitizedData);
      setCurrentSha(result.sha);
      console.log('✅ GitHub에서 데이터 로드 성공');
    } catch (error) {
      console.error('❌ GitHub 로드 실패, 로컬스토리지 사용:', error);
      
      const savedData = localStorage.getItem('goalTrackerData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData.weeklyGoals)) {
            const newWeeklyGoals = {};
            parsedData.weeklyGoals.forEach(goal => {
                const goalDate = new Date(goal.createdAt || goal.id || Date.now());
                const year = goalDate.getFullYear();
                const week = getWeekNumber(goalDate);
                if (!newWeeklyGoals[year]) newWeeklyGoals[year] = {};
                if (!newWeeklyGoals[year][week]) newWeeklyGoals[year][week] = [];
                if (!goal.createdAt) {
                  goal.createdAt = goalDate.toISOString();
                }
                newWeeklyGoals[year][week].push(goal);
            });
            parsedData.weeklyGoals = newWeeklyGoals;
        }

        const sanitizedData = {
            weeklyGoals: {},
            monthlyGoals: [],
            thinkBigGoals: [],
            ...parsedData
        };
        setData(sanitizedData);
        console.log('📱 로컬스토리지에서 데이터 로드');
      } else {
        console.log('📭 로컬스토리지에도 데이터 없음');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (newData) => {
    try {
      localStorage.setItem('goalTrackerData', JSON.stringify(newData));
      const newSha = await githubStorage.saveFileContent(newData, currentSha);
      setCurrentSha(newSha);
      console.log('☁️ GitHub 클라우드에 저장 완료');
    } catch (error) {
      console.error('GitHub 저장 실패, 로컬스토리지만 사용:', error);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        saveData(data);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [data, isLoading]);

  const updateData = (newData) => {
    setData(newData);
  };

  const downloadData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `goal-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const uploadData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const uploadedData = JSON.parse(e.target.result);
          setData(uploadedData);
          alert('데이터가 성공적으로 불러와졌습니다!');
        } catch (error) {
          alert('파일 형식이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const getTabDisplayName = (tabName) => {
    if (screenSize.isMobile) {
      const mobileNames = {
        'Home': '홈',
        'Weekly': '주간',
        'Monthly': '월간',
        'Think Big': '장기',
        'Analysis': '분석',
        'Motivation': '동기',
        'Writing Space': '글쓰기',
        'Workout': '운동',
        'Budget': '가계부'
      };
      return mobileNames[tabName] || tabName;
    }
    return tabName;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: screenSize.isMobile ? '1rem' : '1.2rem',
          color: 'var(--secondary-color)'
        }}>
          데이터를 불러오는 중...
        </div>
      );
    }

    switch (activeTab) {
      case 'Home':
        return <Home data={data} />;
      case 'Weekly':
        return <Weekly data={data} updateData={updateData} />;
      case 'Monthly':
        return <Monthly data={data} updateData={updateData} />;
      case 'Think Big':
        return <ThinkBig data={data} updateData={updateData} />;
      case 'Analysis':
        return <Analysis data={data} />;
      case 'Motivation':
        return <Motivation data={data} updateData={updateData} />;
      case 'Writing Space':
        return <WritingSpace data={data} updateData={updateData} />;
      case 'Workout':
        return <Workout data={data} updateData={updateData} />;
      case 'Budget':
        return <Budget data={data} updateData={updateData} />;
      default:
        return <Home data={data} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        {['Home', 'Weekly', 'Monthly', 'Think Big', 'Analysis', 'Motivation', 'Writing Space', 'Workout', 'Budget'].map((tab) => (
          <button
            key={tab}
            className={`nav-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {getTabDisplayName(tab)}
          </button>
        ))}
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className="nav-button"
            onClick={downloadData}
            title="데이터 백업 다운로드"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            💾 백업
          </button>
          
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept=".json"
              onChange={uploadData}
              style={{ display: 'none' }}
            />
            <span
              className="nav-button"
              title="데이터 백업 불러오기"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              📁 복원
            </span>
          </label>
        </div>
      </nav>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
