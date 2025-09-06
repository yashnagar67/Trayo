
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { ImageData } from '../types';

// Use VITE_API_KEY for frontend compatibility
const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) {
    throw new Error("VITE_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey });

export const generateTryOnImage = async (
    modelImage: ImageData,
    outfitImage: ImageData
): Promise<ImageData | null> => {
    try {
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

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("Failed to generate the virtual try-on image. Please try again.");
    }
};
