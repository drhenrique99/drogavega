
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the GoogleGenAI client using process.env.API_KEY directly.
// Always use the named parameter `apiKey`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gets pharmaceutical advice from Gemini.
 * Uses gemini-3-pro-preview for complex reasoning tasks.
 */
export const getPharmaAdvice = async (prompt: string): Promise<string> => {
  try {
    // Correct method: ai.models.generateContent with model name and prompt.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente farmacêutico virtual experiente da Droga Vega. Sempre recomende a consulta a um médico antes de qualquer medicação. Suas respostas devem ser curtas, profissionais e éticas, seguindo a RDC 44/2009 da ANVISA.",
        temperature: 0.7,
        // Optional: set thinkingBudget for complex tasks if needed, 
        // but here we let the model decide.
      },
    });

    // Correct method: response.text is a getter, not a method.
    return response.text || "Desculpe, não consegui formular uma resposta no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, não consigo processar sua solicitação no momento. Consulte nosso farmacêutico de plantão.";
  }
};
