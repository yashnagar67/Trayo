interface ApiKey {
  key: string;
  isActive: boolean;
  lastUsed: number;
  requestCount: number;
  errorCount: number;
}

class ApiKeyManager {
  private apiKey = '';

  getNextApiKey(): string {
    return this.apiKey;
  }

  markError(apiKey: string) {
    // No-op for single key
  }

  markSuccess(apiKey: string) {
    // No-op for single key
  }
}

export const apiKeyManager = new ApiKeyManager();
