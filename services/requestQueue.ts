import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { ImageData } from '../types';
import { apiKeyManager } from './apiKeyManager';
import { usageTracker } from './usageTracker';

interface QueuedRequest {
  id: string;
  modelImage: ImageData;
  outfitImage: ImageData;
  resolve: (result: ImageData | null) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

interface TryOnResult {
  image: ImageData | null;
  warning?: string;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = new Set<string>();
  private maxConcurrent = 7; // Process up to 7 requests simultaneously with 14 API keys
  private requestTimeout = 60000; // 60 seconds timeout

  async addRequest(
    modelImage: ImageData,
    outfitImage: ImageData
  ): Promise<TryOnResult> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const request: QueuedRequest = {
        id: requestId,
        modelImage,
        outfitImage,
        resolve: (result) => {
          // Check usage and add warning if needed
          const usage = usageTracker.trackUsage(modelImage.base64, outfitImage.base64);
          resolve({
            image: result,
            warning: usage.shouldWarn ? usage.message : undefined
          });
        },
        reject,
        timestamp: Date.now()
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.processing.add(request.id);
    
    try {
      const result = await this.processRequest(request);
      request.resolve(result);
    } catch (error) {
      request.reject(error as Error);
    } finally {
      this.processing.delete(request.id);
      // Process next request in queue
      setTimeout(() => this.processQueue(), 100);
    }
  }

  private async processRequest(request: QueuedRequest): Promise<ImageData | null> {
    // Generate with timeout - no caching, always generate new image
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout);
    });

    const generatePromise = this.generateWithRetry(request.modelImage, request.outfitImage);
    
    const result = await Promise.race([generatePromise, timeoutPromise]);
    
    return result;
  }

  private async generateWithRetry(
    modelImage: ImageData,
    outfitImage: ImageData,
    maxRetries = 2
  ): Promise<ImageData | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const apiKey = apiKeyManager.getNextApiKey();
      
      try {
        const result = await this.generateImage(modelImage, outfitImage, apiKey);
        apiKeyManager.markSuccess(apiKey);
        return result;
      } catch (error) {
        lastError = error as Error;
        apiKeyManager.markError(apiKey);
        console.warn(`Attempt ${attempt + 1} failed with API key ${apiKey.substring(0, 10)}...`);
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  private async generateImage(
    modelImage: ImageData,
    outfitImage: ImageData,
    apiKey: string
  ): Promise<ImageData | null> {
    const ai = new GoogleGenAI({ apiKey });

    const modelImagePart = {
      inlineData: {
        data: modelImage.base64,
        mimeType: modelImage.mimeType,
      },
    };

    const outfitImagePart = {
      inlineData: {
        data: outfitImage.base64,
        mimeType: outfitImage.mimeType,
      },
    };

    const textPart = {
      text: `Take the person from the first image and have them wear the clothing item from the second image. The final image should be realistic, maintaining the person's pose and the background of the first image.`,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [modelImagePart, outfitImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType;
        const base64Data = part.inlineData.data;
        return {
          base64: base64Data,
          mimeType: mimeType,
          dataUrl: `data:${mimeType};base64,${base64Data}`,
        };
      }
    }
    return null;
  }

  getQueueStats() {
    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      maxConcurrent: this.maxConcurrent
    };
  }

  clearQueue() {
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

export const requestQueue = new RequestQueue();
