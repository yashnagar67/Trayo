interface ApiKey {
  key: string;
  isActive: boolean;
  lastUsed: number;
  requestCount: number;
  errorCount: number;
}

class ApiKeyManager {
  private apiKeys: ApiKey[] = [];
  private currentIndex = 0;
  private maxErrorsPerKey = 3;
  private cooldownTime = 30000; // 30 seconds

  constructor() {
    // Initialize with all available API keys
    const keys = [
      import.meta.env.VITE_API_KEY, // Original key
      'AIzaSyBsEwHiP845sN2iCv4uVLBfSXYZtPQtUk0',  // Key 2
      'AIzaSyDsU5xOfodpMDqSyJaqTLaPP0Vb51Q9nGo',  // Key 3
      'AIzaSyCN0s6MuQFDXvur1HyCF4EASjoqcn3QiXw',  // Key 4
      'AIzaSyCe3hVbgrlIEM1F428nnxALKE_9IWlRMAI',  // Key 5
      'AIzaSyBJ3CfNT99t3A11beadrmvap_y9OVSa6ys',  // Key 6
      'AIzaSyC1IB3gBLr0Jc4FNZt0e4ypDeerVDzoRtc',  // Key 7
      'AIzaSyCli8VfU3Mvx3KFeL8wH0TWyVsgG4mQk8A',  // Key 8
      'AIzaSyAvYCOr810Xq0BPDh3IcZQYSeMAghcYTo8',  // Key 9
      'AIzaSyBg_0ggpud3hn5mU2tQy4CYt-NB5LLytSg',  // Key 10
      'AIzaSyBnmbEvpDCRn_voaV1v3lDDiJMA0aVIPF0',  // Key 11
      'AIzaSyC4AmYa2sma1F_ggBSclozbi2PtdDzkhRk',  // Key 12
      'AIzaSyAy0hrkrje4Ox7hgYLEqTgYsLwPgrGdOic',  // Key 13
      'AIzaSyCdlXfJ2v40ejP8PNOz4rGTrytLwixoWlw'   // Key 14
    ].filter(key => key && key.trim() !== '');

    this.apiKeys = keys.map(key => ({
      key,
      isActive: true,
      lastUsed: 0,
      requestCount: 0,
      errorCount: 0
    }));

    if (this.apiKeys.length === 0) {
      throw new Error("No valid API keys found");
    }
  }

  getNextApiKey(): string {
    const activeKeys = this.apiKeys.filter(apiKey => 
      apiKey.isActive && 
      (Date.now() - apiKey.lastUsed > 500) // 0.5 seconds between requests per key for faster processing
    );

    if (activeKeys.length === 0) {
      // If no keys are available, reset error counts and try again
      this.resetErrorCounts();
      return this.apiKeys[0].key;
    }

    // Round-robin selection with load balancing
    const selectedKey = activeKeys.reduce((prev, current) => 
      prev.requestCount < current.requestCount ? prev : current
    );

    selectedKey.lastUsed = Date.now();
    selectedKey.requestCount++;
    
    return selectedKey.key;
  }

  markError(apiKey: string) {
    const keyObj = this.apiKeys.find(k => k.key === apiKey);
    if (keyObj) {
      keyObj.errorCount++;
      if (keyObj.errorCount >= this.maxErrorsPerKey) {
        keyObj.isActive = false;
        console.warn(`API key disabled due to too many errors: ${apiKey.substring(0, 10)}...`);
        
        // Re-enable after cooldown
        setTimeout(() => {
          keyObj.isActive = true;
          keyObj.errorCount = 0;
          console.log(`API key re-enabled: ${apiKey.substring(0, 10)}...`);
        }, this.cooldownTime);
      }
    }
  }

  markSuccess(apiKey: string) {
    const keyObj = this.apiKeys.find(k => k.key === apiKey);
    if (keyObj) {
      keyObj.errorCount = Math.max(0, keyObj.errorCount - 1); // Reduce error count on success
    }
  }

  private resetErrorCounts() {
    this.apiKeys.forEach(key => {
      key.errorCount = 0;
      key.isActive = true;
    });
  }

  getStats() {
    return {
      totalKeys: this.apiKeys.length,
      activeKeys: this.apiKeys.filter(k => k.isActive).length,
      totalRequests: this.apiKeys.reduce((sum, k) => sum + k.requestCount, 0),
      totalErrors: this.apiKeys.reduce((sum, k) => sum + k.errorCount, 0)
    };
  }
}

export const apiKeyManager = new ApiKeyManager();
