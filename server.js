const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3013;
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
    studySubjects: []
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

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
  console.log(`데이터 파일 위치: ${DATA_FILE}`);
});
