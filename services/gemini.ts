
import { GoogleGenAI } from "@google/genai";
import { StylistOptions } from "../types";

export const generateFashionImage = async (
  modelImageBase64: string | null,
  clothingImageBase64: string | null,
  accessoryImageBase64: string | null,
  options: StylistOptions
): Promise<string[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  // 1. First, we use Gemini 3 Flash to synthesize a perfect visual prompt based on all inputs
  const reasoningPrompt = `
    Bạn là một chuyên gia Hyper Fashion Stylist. 
    Nhiệm vụ: Phân tích các ảnh đầu vào và tạo ra một prompt chi tiết cho mô hình tạo ảnh (Imagen).
    
    Đầu vào:
    - Ảnh người mẫu (Model)
    - Ảnh trang phục (Clothing)
    - Ảnh phụ kiện (Accessory - nếu có)
    - Mô tả thêm: ${options.description}
    - Bối cảnh: ${options.background}
    - Tư thế: ${options.pose}
    - Phong cách: ${options.photoStyle}
    - Tỉ lệ khung hình: ${options.aspectRatio}

    Yêu cầu Prompt đầu ra phải cực kỳ chi tiết, bao gồm:
    - Giữ nguyên khuôn mặt và vóc dáng người mẫu gốc.
    - Thay đổi trang phục của người mẫu thành trang phục trong ảnh 'Clothing'.
    - Nếp nhăn vải phải khớp với tư thế ${options.pose}.
    - Ánh sáng phải đồng nhất giữa người mẫu, trang phục và bối cảnh ${options.background}.
    - Chất lượng ${options.quality}, phong cách ${options.photoStyle}.
    - Trả về prompt bằng tiếng Anh để mô hình Imagen hiểu tốt nhất.
  `;

  const parts = [];
  if (modelImageBase64) parts.push({ inlineData: { data: modelImageBase64.split(',')[1], mimeType: 'image/png' } });
  if (clothingImageBase64) parts.push({ inlineData: { data: clothingImageBase64.split(',')[1], mimeType: 'image/png' } });
  if (accessoryImageBase64) parts.push({ inlineData: { data: accessoryImageBase64.split(',')[1], mimeType: 'image/png' } });
  parts.push({ text: reasoningPrompt });

  const reasoningResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
  });

  const generatedPrompt = reasoningResponse.text || "High fashion photography, virtual try-on";

  // 2. Now use Gemini 3 Pro Image Preview to generate the final image
  // Note: For virtual try-on, sending the original images as context is better.
  const imageGenerationResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
        parts: [
            ...parts.filter(p => 'inlineData' in p),
            { text: `Thực hiện Virtual Try-on: ${generatedPrompt}` }
        ]
    },
    config: {
      imageConfig: {
        aspectRatio: options.aspectRatio,
        imageSize: options.quality === '8K' ? '4K' : (options.quality === '4K' ? '2K' : '1K') as any
      }
    }
  });

  const imageUrls: string[] = [];
  for (const part of imageGenerationResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrls.push(`data:image/png;base64,${part.inlineData.data}`);
    }
  }

  return imageUrls;
};

export const checkApiKeySession = async (): Promise<boolean> => {
    // @ts-ignore
    if (typeof window.aistudio !== 'undefined') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // Assume success after opening dialog per instructions
            return true;
        }
        return true;
    }
    return true;
};
