
import type { ImageData } from '../types';
import { requestQueue } from './requestQueue';

interface TryOnResult {
  image: ImageData | null;
  warning?: string;
}

// Optimized service using request queue and multiple API keys
export const generateTryOnImage = async (
    modelImage: ImageData,
    outfitImage: ImageData
): Promise<TryOnResult> => {
    try {
        console.log('Adding request to optimized queue...');
        const result = await requestQueue.addRequest(modelImage, outfitImage);
        
        if (!result.image) {
            throw new Error("Could not generate an image from the response. Please try again.");
        }
        
        return result;
    } catch (error) {
        console.error("Error generating image with optimized service:", error);
        throw new Error("Failed to generate the virtual try-on image. Please try again.");
    }
};
