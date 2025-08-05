import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Weekly from './components/Weekly';
import Monthly from './components/Monthly';
import ThinkBig from './components/ThinkBig';
import Analysis from './components/Analysis';
import Motivation from './components/Motivation';
import WritingSpace from './components/Study';
import GitHubStorage from './utils/githubStorage';

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [data, setData] = useState({
    weeklyGoals: [],
    monthlyGoals: [],
    thinkBigGoals: [],
    completedTasks: [],
    motivationItems: [],
    studySubjects: [],
    events: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentSha, setCurrentSha] = useState(null);
  const githubStorage = new GitHubStorage();

  // GitHub 클라우드에서 데이터 로드
  const loadData = async () => {
    try {
      console.log('🔄 GitHub에서 데이터 로드 시도...');
      console.log('환경변수 토큰:', process.env.REACT_APP_GITHUB_TOKEN ? '설정됨' : '없음');
      
      // GitHub에서 데이터 로드 시도
      const result = await githubStorage.getFileContent();
      setData(result.content);
      setCurrentSha(result.sha);
      console.log('✅ GitHub에서 데이터 로드 성공');
      console.log('로드된 데이터:', result.content);
    } catch (error) {
      console.error('❌ GitHub 로드 실패, 로컬스토리지 사용:', error);
      
      // GitHub 실패 시 로컬스토리지 사용
      const savedData = localStorage.getItem('goalTrackerData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        console.log('📱 로컬스토리지에서 데이터 로드');
        console.log('로컬 데이터:', parsedData);
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
      // 항상 로컬스토리지에 즉시 저장 (빠른 응답)
      localStorage.setItem('goalTrackerData', JSON.stringify(newData));
      
      // GitHub에 저장 시도
      const newSha = await githubStorage.saveFileContent(newData, currentSha);
      setCurrentSha(newSha);
      console.log('☁️ GitHub 클라우드에 저장 완료');
    } catch (error) {
      console.error('GitHub 저장 실패, 로컬스토리지만 사용:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 변경 시 저장 (디바운싱 적용)
  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        saveData(data);
      }, 500); // 500ms 후에 저장

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
    // 파일 입력 초기화
    event.target.value = '';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '1.2rem',
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
      case 'Writing Space':
        return <WritingSpace data={data} updateData={updateData} />;
      case 'Motivation':
        return <Motivation data={data} updateData={updateData} />;
      default:
        return <Home data={data} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        {['Home', 'Weekly', 'Monthly', 'Think Big', 'Analysis', 'Writing Space', 'Motivation'].map((tab) => (
          <button
            key={tab}
            className={`nav-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        
        {/* 데이터 백업/복원 버튼들 */}
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
