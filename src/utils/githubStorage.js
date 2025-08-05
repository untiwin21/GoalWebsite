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
        const content = atob(data.content.replace(/\s/g, ''));
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
      const content = btoa(JSON.stringify(data, null, 2));
      
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
