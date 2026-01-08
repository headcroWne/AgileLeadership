import { SurveyResponse } from "../types";

export const analyzeFeedback = async (responses: SurveyResponse[]): Promise<string> => {
  if (!responses || responses.length === 0) return "Analiz edilecek veri yok.";

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Analyze API failed:", res.status, txt);
      return "Yapay zeka analizi sırasında bir hata oluştu (API yanıtı başarısız).";
    }

    const data = await res.json();
    // analyze endpoint’i nasıl döndürürsek döndürelim, güvenli okuyalım:
    return data?.text || data?.result || "Analiz raporu oluşturulamadı.";
  } catch (error) {
    console.error("Analyze API error:", error);
    return "Yapay zeka analizi sırasında bir hata oluştu.";
  }
};
