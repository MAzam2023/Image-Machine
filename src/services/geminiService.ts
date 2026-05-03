import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateImage(objectName: string, aspectRatio: string = "1:1"): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A detailed, high-quality, photorealistic image of ${objectName}.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      }
    }
  });

  const candidate = response.candidates?.[0];
  if (!candidate?.content?.parts) {
    throw new Error('Failed to generate image');
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const mimeType = part.inlineData.mimeType || 'image/jpeg';
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image was returned from the model.');
}

export async function generateDescription(objectName: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a factual, simple 2-line description of: ${objectName}. Do not use complex jargon. Keep it brief and to the point.`,
    config: {
      systemInstruction: "You are a helpful assistant that gives 2-line factual descriptions in simple language.",
    }
  });

  return response.text?.trim() || 'No description available.';
}
