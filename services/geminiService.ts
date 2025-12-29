
import { GoogleGenAI } from "@google/genai";
import { SurveyResponse } from "../types";

export const analyzeFeedback = async (responses: SurveyResponse[]): Promise<string> => {
  if (responses.length === 0) return "Analiz edilecek veri yok.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const stopList = responses.map(r => r.feedback.stopDoing).filter(Boolean).join("\n- ");
  const startList = responses.map(r => r.feedback.startDoing).filter(Boolean).join("\n- ");
  const keepList = responses.map(r => r.feedback.keepDoing).filter(Boolean).join("\n- ");

  const prompt = `
    Aşağıda çevik liderlik (Agile Leadership) anketi katılımcılarından gelen geri bildirimler yer almaktadır. 
    Lütfen bu verileri analiz et ve liderlik ekibi için yönetici özeti (executive summary) oluştur.
    Özellikle "Bırakılması Gerekenler", "Başlanması Gerekenler" ve "Devam Edilmesi Gerekenler" başlıkları altında ana temaları belirle.
    Dil: Türkçe.

    STOP DOING (Bırakılması Gerekenler):
    - ${stopList}

    START DOING (Başlanması Gerekenler):
    - ${startList}

    KEEP DOING (Devam Edilmesi Gerekenler):
    - ${keepList}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Analiz raporu oluşturulamadı.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Yapay zeka analizi sırasında bir hata oluştu.";
  }
};
