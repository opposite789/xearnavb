
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SummaryData, QuizData, Language, SummaryTone } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas
const summarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A concise title for the summary" },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING, description: "Section heading" },
          points: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Key points as bullet strings" 
          }
        },
        required: ["heading", "points"]
      }
    }
  },
  required: ["title", "sections"]
};

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          text: { type: Type.STRING, description: "The question text" },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "4 distinct options" 
          },
          correctOptionIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
          explanation: { type: Type.STRING, description: "Brief explanation of why the answer is correct" }
        },
        required: ["id", "text", "options", "correctOptionIndex", "explanation"]
      }
    }
  },
  required: ["questions"]
};

export const generateSummary = async (base64Data: string, mimeType: string, language: Language, tone: SummaryTone): Promise<SummaryData> => {
  try {
    const langName = language === 'ar' ? 'Arabic' : 'English';
    
    const toneInstruction = tone === 'formal' 
      ? "Ensure the tone is professional, academic, and structured like a textbook."
      : "Ensure the tone is friendly, casual, and easy to understand, as if explaining to a friend, while keeping all key information.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this document and provide a comprehensive, structured summary in ${langName}. Break it down into logical sections with key bullet points. ${toneInstruction}`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: summarySchema,
        temperature: 0.3,
      }
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text) as SummaryData;
  } catch (error) {
    console.error("Summary generation failed:", error);
    throw error;
  }
};

export const generateQuiz = async (
  base64Data: string, 
  mimeType: string, 
  language: Language,
  count: number = 30,
  excludeQuestions: string[] = []
): Promise<QuizData> => {
  try {
    const langName = language === 'ar' ? 'Arabic' : 'English';
    // Note: Requesting exactly 30 complex JSON objects might hit output token limits depending on verbosity.
    // We break it down into a strong instruction.
    const prompt = `Generate a challenging multiple-choice quiz based on the document in ${langName}. 
    Create exactly ${count} unique questions.
    Each question must have 4 options and one clear correct answer.
    ${excludeQuestions.length > 0 ? `Do NOT repeat these questions: ${excludeQuestions.join('; ').substring(0, 1000)}...` : ''}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.4, // Slightly higher creativity for questions
      }
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text) as QuizData;
  } catch (error) {
    console.error("Quiz generation failed:", error);
    throw error;
  }
};

export const generateCustomContent = async (
  topic: string,
  contentType: string,
  language: Language
): Promise<string> => {
  try {
    // Enforce Standard English if 'en' is selected, regardless of app UI language
    const langInstruction = language === 'ar' ? 'Arabic' : 'Standard English';
    
    const prompt = `
      Act as a world-class professional writer and subject matter expert.
      
      Task: Write a ${contentType} about the following topic: "${topic}".
      Target Language: ${langInstruction}.
      
      Requirements:
      1. Use professional formatting (headings, bullet points where appropriate).
      2. Tone should be sophisticated, authoritative, and engaging.
      3. If it is a Research Paper, include an abstract and hypothetical references.
      4. If it is a Conversation, format it as a dialogue.
      5. Ensure the content is extensive, well-structured, and uses high-quality vocabulary.
      6. Do not include Markdown code blocks (like \`\`\`), just return the formatted text directly.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Custom content generation failed:", error);
    throw error;
  }
};
