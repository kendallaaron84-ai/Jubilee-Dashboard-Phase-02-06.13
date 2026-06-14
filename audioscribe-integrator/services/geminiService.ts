import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateRiskAnalysis = async (context: string) => {
  const ai = getAiClient();
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a Senior Solutions Architect specializing in Google Cloud and WordPress.
    Analyze the following project context for integrating Google Cloud Storage and Google Speech-to-Text into a WordPress plugin for audiobooks.
    
    Context:
    ${context}

    Provide a JSON response with a list of specific risks and mitigations.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                mitigation: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                category: { type: Type.STRING, enum: ["Performance", "Security", "Cost", "Integration"] }
              },
              required: ["title", "description", "mitigation", "severity", "category"]
            }
          },
          summary: { type: Type.STRING }
        }
      }
    }
  });

  return response.text ? JSON.parse(response.text) : { risks: [], summary: "No analysis generated." };
};

export const generatePluginCode = async (requirements: string) => {
  const ai = getAiClient();
  const model = "gemini-3-pro-preview"; // Using Pro for better coding capabilities

  const prompt = `
    Generate a high-quality, secure WordPress plugin boilerplate (PHP) for integrating Google Cloud Storage and Google Speech-to-Text.
    
    Requirements:
    ${requirements}
    
    Focus on:
    1. Securely handling Service Account credentials (not hardcoded).
    2. Uploading large files to GCS (Signed URLs pattern recommended).
    3. Triggering Speech-to-Text (LongRunningRecognize).
    4. Handling the asynchronous response (Webhook or Cron polling).

    Output the response as a Markdown formatted string with code blocks.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
};

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  const ai = getAiClient();
  // Using gemini-2.5-flash-latest for robust multimodal support
  const model = "gemini-2.5-flash-latest";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType
          }
        },
        {
          text: "Transcribe this audio file exactly as spoken. If there are multiple speakers, label them (e.g., Speaker 1:). Format nicely."
        }
      ]
    }
  });

  return response.text;
};
