interface UsageEntry {
  count: number;
  firstUsed: number;
  lastUsed: number;
}

class UsageTracker {
  private usage = new Map<string, UsageEntry>();
  private maxAttempts = 3;
  private warningMessage = "Use another image - You've tried this combination multiple times. Try different photos for better results!";

  generateKey(modelBase64: string, outfitBase64: string): string {
    // Create a hash of the image combination
    const combined = modelBase64.substring(0, 100) + outfitBase64.substring(0, 100);
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  trackUsage(modelBase64: string, outfitBase64: string): { shouldWarn: boolean; message?: string } {
    const key = this.generateKey(modelBase64, outfitBase64);
    const now = Date.now();
    
    const entry = this.usage.get(key);
    
    if (!entry) {
      // First time using this combination
      this.usage.set(key, {
        count: 1,
        firstUsed: now,
        lastUsed: now
      });
      return { shouldWarn: false };
    }
    
    // Update existing entry
    entry.count++;
    entry.lastUsed = now;
    
    if (entry.count >= this.maxAttempts) {
      return { 
        shouldWarn: true, 
        message: this.warningMessage 
      };
    }
    
    return { shouldWarn: false };
  }

  getUsageStats(modelBase64: string, outfitBase64: string) {
    const key = this.generateKey(modelBase64, outfitBase64);
    const entry = this.usage.get(key);
    
    if (!entry) {
      return { count: 0, firstUsed: null, lastUsed: null };
    }
    
    return {
      count: entry.count,
      firstUsed: entry.firstUsed,
      lastUsed: entry.lastUsed
    };
  }

  clearUsage(modelBase64: string, outfitBase64: string) {
    const key = this.generateKey(modelBase64, outfitBase64);
    this.usage.delete(key);
  }

  clearAllUsage() {
    this.usage.clear();
  }

  getTotalCombinations() {
    return this.usage.size;
  }
}

export const usageTracker = new UsageTracker();
