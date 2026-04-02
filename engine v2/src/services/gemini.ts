import { GoogleGenAI, GenerateContentResponse, ThinkingLevel, Type } from "@google/genai";
import { UserProfile as ProfileType, Milestone, MockTest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export type UserProfile = ProfileType;

export const getRoadmapMilestones = async (profile: UserProfile, analysisSummary?: string): Promise<Milestone[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Based on this Indian student's profile, generate a 5-step career roadmap (milestones).
    
    User Profile:
    - Education: ${profile.education}
    - Ambition: ${profile.ambition || "Not specified"}
    - Interests: ${profile.interests || "Not specified"}
    ${analysisSummary ? `Mark Sheet Analysis: ${analysisSummary}` : ""}
    
    Return a JSON array of 5 milestones. Each milestone must have:
    - id: string (unique, e.g. "m1", "m2")
    - title: string (short, catchy)
    - description: string (brief action item)
    - points: number (reward for completion, between 50 and 200)
    - order: number (1 to 5)
    
    The milestones should be specific to the Indian context (e.g., "Clear GATE Exam", "Complete Python Certification", "Apply for SSC CGL").
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            points: { type: Type.NUMBER },
            order: { type: Type.NUMBER },
          },
          required: ["id", "title", "description", "points", "order"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Error parsing milestones:", e);
    return [];
  }
};

export const analyzeMarkSheet = async (base64Image: string, mimeType: string): Promise<string> => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
    Analyze this mark sheet/educational document. 
    Extract key information:
    1. Subjects and marks/grades.
    2. Overall performance (percentage/CGPA).
    3. Strengths and weaknesses based on the marks.
    4. Any specific certifications or achievements mentioned.
    
    Provide a clear, structured summary in Markdown.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text || "Could not analyze the mark sheet.";
};

export const getCareerGuidance = async (profile: UserProfile, analysisSummary?: string): Promise<{ text: string; sources: any[] }> => {
  const model = "gemini-3-flash-preview";
  const language = profile.language || "English";
  const prompt = `
    You are an expert career counselor specialized in the Indian economy (current state).
    Provide guidance in ${language}.
    
    User Profile:
    - Current Education: ${profile.education}
    - Current Employment: ${profile.employment || "Not specified"}
    - Interests: ${profile.interests || "Not specified"}
    - Ambition: ${profile.ambition || "Not specified"}
    
    ${analysisSummary ? `Mark Sheet Analysis Summary: ${analysisSummary}` : "No mark sheet provided."}
    
    IMPORTANT: If the user has low education (e.g., 8th or 10th pass), guide them on:
    1. Immediate next steps: Diploma, ITI, or 11th/12th (Science/Commerce/Arts).
    2. Local options: Where to study near them (mention common types of institutions in India).
    3. Fees: Provide a realistic fee structure for these options in India.
    4. Online Platforms: Can they study on platforms like Coursera, SWAYAM, or NPTEL? Is the certificate valid for jobs in India?
    5. Work-Study: How can they get a job (e.g., vocational) and study further simultaneously?
    
    General Guidance:
    1. Educational Path: What to study next (degrees, certifications, online courses).
    2. Where to Study: Top institutions in India.
    3. How to Study: Preparation strategies, entrance exams (GATE, CAT, UPSC, etc.).
    4. Job Market Analysis: Current job availability in India, salary trends, and future growth.
    5. Action Plan: Step-by-step guide for the next 1-3 years.
    
    Use Google Search to ensure the information about the Indian economy, job market, and institutions is up-to-date (2024-2026).
    Provide the response in structured Markdown.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text || "Could not generate guidance.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

export const getScholarships = async (profile: UserProfile): Promise<{ text: string; sources: any[] }> => {
  const model = "gemini-3-flash-preview";
  const language = profile.language || "English";
  const prompt = `
    Find relevant scholarships and financial aid for a student in India with the following profile in ${language}:
    - Education: ${profile.education}
    - Interests: ${profile.interests || "Not specified"}
    
    Include:
    1. Government Schemes (NSP, State-specific).
    2. Private Scholarships (Tata, Reliance, etc.).
    3. Eligibility criteria and application deadlines.
    4. Links to apply.
    
    Use Google Search for current 2024-2026 data.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });

  return {
    text: response.text || "No scholarships found.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

export const getEntranceExams = async (profile: UserProfile): Promise<{ text: string; sources: any[] }> => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    List upcoming entrance exams in India relevant to this student:
    - Current Education: ${profile.education}
    - Ambition: ${profile.ambition || "Not specified"}
    
    Include:
    1. Exam name (JEE, NEET, UPSC, GATE, CAT, SSC, etc.).
    2. Important dates (Application, Exam).
    3. Eligibility and syllabus overview.
    
    Use Google Search for 2024-2026 dates.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });

  return {
    text: response.text || "No exams found.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

export const getGovtJobs = async (profile: UserProfile, targetQualification?: string): Promise<{ text: string; sources: any[] }> => {
  const model = "gemini-3-flash-preview";
  const language = profile.language || "English";
  const searchEdu = targetQualification || profile.education;
  const prompt = `
    Find upcoming Government Job (Sarkari Naukri) exams in India in ${language}.
    The user is specifically looking for jobs with the minimum eligibility of: ${searchEdu}.
    
    User's Background (for context):
    - Actual Education: ${profile.education}
    - Ambition: ${profile.ambition || "Not specified"}
    - Interests: ${profile.interests || "Not specified"}
    
    Filter and show ONLY the posts where the required educational qualification matches "${searchEdu}".
    
    Include:
    1. Organization (SSC, UPSC, IBPS, Railways, State PSC, etc.).
    2. Post Name and Number of Vacancies (if available).
    3. Eligibility Criteria (Age, Qualification).
    4. Important Dates (Notification, Last Date to Apply, Exam Date).
    5. Official Website/Link to Apply.
    
    Categorize them as:
    - High Match (Directly matches education and ambition).
    - Potential Match (Matches education, slightly different field).
    
    Use Google Search for the most recent 2024-2026 notifications from official portals like ssc.gov.in, upsc.gov.in, etc.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });

  return {
    text: response.text || "No government jobs found.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

export const generateResume = async (profile: UserProfile, template: 'Chronological' | 'Functional' | 'Combination', analysisSummary?: string): Promise<string> => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
    Generate a professional, ATS-friendly resume for an Indian student/professional based on:
    - Template Type: ${template}
    - Education: ${profile.education}
    - Employment: ${profile.employment || "Not specified"}
    - Interests: ${profile.interests || "Not specified"}
    - Ambition: ${profile.ambition || "Not specified"}
    ${analysisSummary ? `- Academic Highlights: ${analysisSummary}` : ""}
    
    Format the resume in Markdown according to the ${template} style. 
    - Chronological: Focus on work history in reverse order.
    - Functional: Focus on skills and areas of expertise.
    - Combination: Balance both skills and work history.

    Include sections for Summary, Education, Skills, and Experience (if any).
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
  });

  return response.text || "Could not generate resume.";
};

export const getSuggestedSkills = async (profile: UserProfile): Promise<string[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Based on this student's profile and ambition, suggest 8-10 highly relevant technical and soft skills that would make their resume stand out in the Indian job market.
    
    User Profile:
    - Education: ${profile.education}
    - Ambition: ${profile.ambition || "Not specified"}
    - Interests: ${profile.interests || "Not specified"}
    
    Return a JSON array of strings (skills).
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Error parsing suggested skills:", e);
    return [];
  }
};

export const getInterviewCoachResponse = async (message: string, profile: UserProfile): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    You are an AI Interview Coach for Indian job seekers. 
    The user is aiming for: ${profile.ambition || "a professional role"}.
    Their background: ${profile.education}.
    
    User says: "${message}"
    
    Provide feedback on their answer, suggest improvements, and ask a follow-up interview question common in Indian corporate rounds (TCS, Infosys, Startups, or Govt exams).
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
  });

  return response.text || "I'm here to help you practice for your interview.";
};

export const getLocalInstitutions = async (query: string, location?: { lat: number; lng: number }): Promise<{ text: string; sources: any[] }> => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model: model,
    contents: `Find top educational institutions or coaching centers for ${query} in India.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: location ? {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        } : undefined
      }
    },
  });

  return {
    text: response.text || "Could not find local institutions.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

export const verifyDocument = async (base64Image: string, mimeType: string, expectedType: string, milestoneTitle?: string): Promise<{ status: 'verified' | 'rejected'; details: string }> => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
    Verify if this document is a valid ${expectedType} (e.g., Mark Sheet, Degree, Certificate).
    ${milestoneTitle ? `Specifically, check if it verifies the completion of: "${milestoneTitle}".` : ""}
    
    Check for:
    1. Authenticity markers (seals, signatures, logos of Indian boards like CBSE, ICSE, State Boards, or Universities).
    2. Consistency of data (names, dates, marks).
    3. Any signs of tampering or obvious forgery.
    4. Relevance: Does the document actually prove the achievement requested?
    
    Return a JSON object:
    {
      "status": "verified" or "rejected",
      "details": "A brief explanation of the verification result, mentioning specific details found in the document."
    }
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ["verified", "rejected"] },
          details: { type: Type.STRING },
        },
        required: ["status", "details"],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{"status": "rejected", "details": "Verification failed."}');
  } catch (e) {
    return { status: "rejected", details: "Error parsing verification result." };
  }
};

export const generateMockTest = async (profile: UserProfile, topic?: string): Promise<Partial<MockTest>> => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Generate a mock test for an Indian student.
    User Profile:
    - Education: ${profile.education}
    - Ambition: ${profile.ambition || "Not specified"}
    - Topic: ${topic || "General Aptitude and Career Knowledge"}
    
    The test should have 5 multiple-choice questions.
    Return a JSON object:
    {
      "title": "A catchy title for the test",
      "questions": [
        {
          "id": "q1",
          "question": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0 // Index of the correct option (0-3)
        },
        ...
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.NUMBER },
              },
              required: ["id", "question", "options", "correctAnswer"],
            },
          },
        },
        required: ["title", "questions"],
      },
    },
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return {
      title: data.title,
      questions: data.questions,
      totalQuestions: data.questions?.length || 0,
      completed: false,
    };
  } catch (e) {
    console.error("Error parsing mock test:", e);
    return { title: "Error generating test", questions: [], totalQuestions: 0, completed: false };
  }
};
