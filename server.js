const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const kill = require('kill-port');

const app = express();
const PORT = process.env.PORT || 3022;
const DATA_FILE = path.join(__dirname, 'data', 'goals.json');

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('build'));

// data 폴더가 없으면 생성
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 초기 데이터 파일이 없으면 생성
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    weeklyGoals: [],
    monthlyGoals: [],
    thinkBigGoals: [],
    completedTasks: [],
    motivationItems: [],
    studySubjects: [],
    writingNotes: [],
    events: []
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// 데이터 읽기
app.get('/api/data', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('데이터 읽기 오류:', error);
    res.status(500).json({ error: '데이터를 읽을 수 없습니다.' });
  }
});

// 데이터 저장
app.post('/api/data', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: '데이터가 저장되었습니다.' });
  } catch (error) {
    console.error('데이터 저장 오류:', error);
    res.status(500).json({ error: '데이터를 저장할 수 없습니다.' });
  }
});

// React 앱 서빙
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 안정적인 서버 시작 함수
const startServer = async (port) => {
  try {
    // 기존 포트 사용 프로세스 강제 종료
    console.log(`포트 ${port} 정리 중...`);
    await kill(port).catch(() => {
      // 포트가 비어있으면 에러 무시
      console.log(`포트 ${port}는 이미 비어있습니다.`);
    });
    
    // 잠시 대기 (포트 해제 시간)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 서버 시작
    const server = app.listen(port, () => {
      console.log(`✅ 서버가 http://localhost:${port}에서 실행 중입니다.`);
      console.log(`📁 데이터 파일 위치: ${DATA_FILE}`);
      console.log(`🔄 포트 ${port} 고정 사용 (자동 정리 완료)`);
    });

    // 프로세스 종료 시 정리
    const cleanup = () => {
      console.log('\n서버를 종료합니다...');
      server.close(() => {
        console.log('서버가 정상적으로 종료되었습니다.');
        process.exit(0);
      });
    };

    // 종료 신호 처리
    process.on('SIGINT', cleanup);  // Ctrl+C
    process.on('SIGTERM', cleanup); // 프로세스 종료
    process.on('SIGHUP', cleanup);  // 터미널 종료

    return server;
  } catch (error) {
    console.error(`포트 ${port} 시작 실패:`, error);
    process.exit(1);
  }
};

// 서버 시작
startServer(PORT);
