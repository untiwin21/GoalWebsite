class GitHubStorage {
  constructor() {
    this.owner = 'untiwin21';
    this.repo = 'GoalWebsite';
    this.dataPath = 'data/goals.json';
    this.apiBase = 'https://api.github.com';
    this.token = process.env.REACT_APP_GITHUB_TOKEN;
    
    if (!this.token) {
      console.warn('GitHub token not found. Using localStorage only.');
    }
  }

  base64ToUtf8(base64) {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
      console.error('Base64 디코딩 오류:', error);
      return atob(base64);
    }
  }

  utf8ToBase64(utf8String) {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(utf8String);
      let binaryString = '';
      for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      return btoa(binaryString);
    } catch (error) {
      console.error('Base64 인코딩 오류:', error);
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
        const content = this.base64ToUtf8(data.content.replace(/\s/g, ''));
        return { content: JSON.parse(content), sha: data.sha };
      } else if (response.status === 404) {
        // 파일이 없으면 새로운 구조의 초기 데이터 생성
        const initialData = {
          weeklyGoals: {}, // 배열이 아닌 객체로 변경
          monthlyGoals: [],
          thinkBigGoals: [],
          completedTasks: [],
          motivationItems: [],
          events: [],
          writingNotes: [],
          todayTodos: [],
          todayTodosDate: null
        };
        // 초기 파일 생성 시도
        await this.saveFileContent(initialData, `Create initial data file`);
        return { content: initialData, sha: null };
      } else {
        throw new Error(`GitHub API 오류: ${response.status}`);
      }
    } catch (error) {
      console.error('GitHub에서 데이터 로드 실패:', error);
      throw error;
    }
  }

  async saveFileContent(data, sha = null, message) {
    if (!this.token) {
      throw new Error('GitHub token not found');
    }

    try {
      const content = this.utf8ToBase64(JSON.stringify(data, null, 2));
      
      const body = {
        message: message || `Update goals data - ${new Date().toISOString()}`,
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
        const errorData = await response.json();
        throw new Error(`GitHub API 저장 오류: ${response.status} - ${errorData.message}`);
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
