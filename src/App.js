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
import GitHubStorage from './utils/githubStorage';
import { useScreenSize } from './utils/deviceDetection';

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [data, setData] = useState({
    weeklyGoals: [],
    monthlyGoals: [],
    thinkBigGoals: [],
    completedTasks: [],
    motivationItems: [],
    events: [],
    writingNotes: [],
    todayTodos: [], // 오늘 할 일 목록 추가
    todayTodosDate: null // 오늘 할 일 목록의 날짜 추가
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentSha, setCurrentSha] = useState(null);
  const githubStorage = new GitHubStorage();
  const screenSize = useScreenSize();

  // GitHub 클라우드에서 데이터 로드
  const loadData = async () => {
    try {
      console.log('🔄 GitHub에서 데이터 로드 시도...');
      console.log('환경변수 토큰:', process.env.REACT_APP_GITHUB_TOKEN ? '설정됨' : '없음');
      
      const result = await githubStorage.getFileContent();
      // 불러온 데이터에 todayTodos 관련 필드가 없으면 추가해줍니다.
      const sanitizedData = {
        ...result.content,
        todayTodos: result.content.todayTodos || [],
        todayTodosDate: result.content.todayTodosDate || null,
      };
      setData(sanitizedData);
      setCurrentSha(result.sha);
      console.log('✅ GitHub에서 데이터 로드 성공');
    } catch (error) {
      console.error('❌ GitHub 로드 실패, 로컬스토리지 사용:', error);
      
      const savedData = localStorage.getItem('goalTrackerData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // 불러온 데이터에 todayTodos 관련 필드가 없으면 추가해줍니다.
        const sanitizedData = {
            ...parsedData,
            todayTodos: parsedData.todayTodos || [],
            todayTodosDate: parsedData.todayTodosDate || null,
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

  // GitHub 클라우드에 데이터 저장
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

  // 데이터 다운로드 기능
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

  // 데이터 업로드 기능
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

  // 탭 이름 모바일 최적화
  const getTabDisplayName = (tabName) => {
    if (screenSize.isMobile) {
      const mobileNames = {
        'Home': '홈',
        'Weekly': '주간',
        'Monthly': '월간',
        'Think Big': '장기',
        'Analysis': '분석',
        'Motivation': '동기',
        'Writing Space': '글쓰기'
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
        return <Workout />;
      default:
        return <Home data={data} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        {['Home', 'Weekly', 'Monthly', 'Think Big', 'Analysis', 'Motivation', 'Writing Space', 'Workout'].map((tab) => (
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
