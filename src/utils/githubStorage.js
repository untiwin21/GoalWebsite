class GitHubStorage {
  constructor() {
    this.owner = 'untiwin21';
    this.repo = 'GoalWebsite';
    this.dataPath = 'data/goals.json';
    this.apiBase = 'https://api.github.com';
    // 브라우저 환경에서 환경변수 가져오기
    this.token = process.env.REACT_APP_GITHUB_TOKEN;
    
    if (!this.token) {
      console.warn('GitHub token not found. Using localStorage only.');
    }
  }

  // 유니코드 안전한 base64 디코딩
  base64ToUtf8(base64) {
    try {
      // base64를 바이너리 문자열로 변환
      const binaryString = atob(base64);
      // 바이너리 문자열을 Uint8Array로 변환
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // UTF-8로 디코딩
      return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
      console.error('Base64 디코딩 오류:', error);
      // 폴백: 기본 atob 사용
      return atob(base64);
    }
  }

  // 유니코드 안전한 base64 인코딩
  utf8ToBase64(utf8String) {
    try {
      // UTF-8 문자열을 Uint8Array로 변환
      const encoder = new TextEncoder();
      const bytes = encoder.encode(utf8String);
      // Uint8Array를 바이너리 문자열로 변환
      let binaryString = '';
      for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      // base64로 인코딩
      return btoa(binaryString);
    } catch (error) {
      console.error('Base64 인코딩 오류:', error);
      // 폴백: 기본 btoa 사용
      return btoa(utf8String);
    }
  }

  async getFileContent() {
    if (!this.token) {
      throw new Error('GitHub token not found');
    }

    try {
      const response = await fetch(`${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${this.dataPath}`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // 유니코드 안전한 디코딩 사용
        const content = this.base64ToUtf8(data.content.replace(/\s/g, ''));
        return { content: JSON.parse(content), sha: data.sha };
      } else if (response.status === 404) {
        // 파일이 없으면 초기 데이터 생성
        const initialData = {
          weeklyGoals: [],
          monthlyGoals: [],
          thinkBigGoals: [],
          completedTasks: [],
          motivationItems: [],
          studySubjects: [],
          events: []
        };
        await this.saveFileContent(initialData);
        return { content: initialData, sha: null };
      } else {
        throw new Error(`GitHub API 오류: ${response.status}`);
      }
    } catch (error) {
      console.error('GitHub에서 데이터 로드 실패:', error);
      throw error;
    }
  }

  async saveFileContent(data, sha = null) {
    if (!this.token) {
      throw new Error('GitHub token not found');
    }

    try {
      // 유니코드 안전한 인코딩 사용
      const content = this.utf8ToBase64(JSON.stringify(data, null, 2));
      
      const body = {
        message: `Update goals data - ${new Date().toISOString()}`,
        content: content
      };

      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(`${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${this.dataPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`GitHub API 저장 오류: ${response.status}`);
      }

      const result = await response.json();
      return result.content.sha;
    } catch (error) {
      console.error('GitHub에 데이터 저장 실패:', error);
      throw error;
    }
  }
}

export default GitHubStorage;
