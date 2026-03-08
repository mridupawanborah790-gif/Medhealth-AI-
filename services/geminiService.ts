
import { GoogleGenAI, GenerateContentResponse, Type, Chat } from "@google/genai";
import { HealthProfile, Goal, CalculatedMetrics, NutritionAnalysis, CoachSummary, ChatMessage, WorkoutType, WeeklyPlan } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Using gemini-3-flash-preview for fast text tasks and onboarding
const DEFAULT_MODEL = 'gemini-3-flash-preview';
// Using gemini-3-pro-preview for complex reasoning and diet planning
const ADVANCED_MODEL = 'gemini-3-pro-preview';

export const generateOnboardingSummary = async (
  profile: HealthProfile,
  goal: Goal,
  metrics: CalculatedMetrics
): Promise<CoachSummary> => {
  const prompt = `
    You are MedHealth, a personal health coach.
    Generate a summary message for a new user based on their details.
    Be encouraging and clear. The user is from India.
    Keep each part of the response concise and under 20 words.
    
    User Details:
    - Name: ${profile.name}
    - Height: ${profile.height} cm
    - Current Weight: ${profile.weight} kg
    - Target Weight: ${goal.targetWeight} kg
    - BMI: ${metrics.bmi} (${metrics.bmiCategory})
    - Ideal Weight Range: ${metrics.idealWeightRange.min} - ${metrics.idealWeightRange.max} kg
    - Chosen Weekly Loss: ${goal.weeklyRate} kg
    - Estimated Time to Goal: ${metrics.etaWeeks} weeks
    - Daily Calorie Budget: ${metrics.calorieBudget} kcal
    - Daily Macros: Protein ${metrics.macros.protein}g, Fat ${metrics.macros.fat}g, Carbs ${metrics.macros.carbs}g

    Generate a JSON response with the following keys, providing a conversational string for each:
    - "bmiText": A sentence stating their BMI and category.
    - "idealWeightText": A sentence about their ideal weight range.
    - "weeklyLossText": A sentence confirming their safe weekly loss target.
    - "etaText": A sentence about their goal ETA.
    - "budgetText": A sentence stating their daily calorie and macro budget.
  `;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            bmiText: { type: Type.STRING },
            idealWeightText: { type: Type.STRING },
            weeklyLossText: { type: Type.STRING },
            etaText: { type: Type.STRING },
            budgetText: { type: Type.STRING },
        }
      }
    }
  });

  return JSON.parse(response.text) as CoachSummary;
};

export const analyzeFoodImage = async (base64Image: string): Promise<NutritionAnalysis> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = {
        text: `Analyze this image of a meal, likely Indian cuisine. Identify each food item, estimate its portion size (e.g., in 'cup' or 'piece'), and provide its nutritional information (calories, protein, fat, carbs). Return a JSON object following the specified schema. If an item is unidentifiable, omit it.

        Example item:
        { "label": "dal tadka", "confidence": 0.93, "portion_estimate": {"unit": "cup", "value": 1.0}, "macros": {"kcal": 198, "protein_g": 11, "fat_g": 6, "carb_g": 26}}
        
        Calculate the total macros for the entire meal. Add flags like "high_carb" or "low_protein" if applicable.`
    };
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: { parts: [imagePart, textPart] }, // Recommended order: image then text
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER },
                                    portion_estimate: {
                                        type: Type.OBJECT,
                                        properties: {
                                            unit: { type: Type.STRING },
                                            value: { type: Type.NUMBER },
                                        }
                                    },
                                    macros: {
                                        type: Type.OBJECT,
                                        properties: {
                                            kcal: { type: Type.NUMBER },
                                            protein_g: { type: Type.NUMBER },
                                            fat_g: { type: Type.NUMBER },
                                            carb_g: { type: Type.NUMBER },
                                        }
                                    }
                                }
                            }
                        },
                        total: {
                            type: Type.OBJECT,
                            properties: {
                                kcal: { type: Type.NUMBER },
                                protein_g: { type: Type.NUMBER },
                                fat_g: { type: Type.NUMBER },
                                carb_g: { type: Type.NUMBER },
                            }
                        },
                        flags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const result = response.text;
        if (!result) throw new Error("Empty response from AI");
        return JSON.parse(result) as NutritionAnalysis;
    } catch (error) {
        console.error("Analysis failed:", error);
        throw error;
    }
};

export async function* generateDietPlanStream(
    profile: HealthProfile,
    goal: Goal,
    metrics: CalculatedMetrics,
    userQuery: string
): AsyncGenerator<string> {
    const prompt = `
        You are MedHealth Coach, a supportive, evidence-based health companion for Indian users.
        Your task is to generate a personalized diet plan based on the user's profile and their specific request.

        **User Profile:**
        - Name: ${profile.name}
        - Age: ${profile.age}, Sex: ${profile.gender}
        - Height: ${profile.height} cm, Current Weight: ${profile.weight} kg
        - Activity Level: ${profile.activityLevel}
        - Primary Goal: ${goal.type}
        - Target Weight: ${goal.targetWeight} kg
        - Calculated Daily Calorie Budget: ~${Math.round(metrics.calorieBudget)} kcal
        - Calculated Daily Macros: Protein ${metrics.macros.protein}g, Fat ${metrics.macros.fat}g, Carbs ${metrics.macros.carbs}g

        **User's Request:** "${userQuery}"

        **Instructions:**
        1.  **Analyze the Request:** Understand the user's goal from their query.
        2.  **Create a Diet Plan:** Generate a comprehensive yet easy-to-follow diet plan.
        3.  **Cultural Relevance:** The plan MUST be suitable for a standard Indian diet. Suggest common, easily available foods.
        4.  **Structure:** Format your response using simple Markdown. Use headings like "Foods to Eat," "Foods to Avoid," and "Sample Daily Plan."
        5.  **Sample Plan:** Provide a sample one-day meal plan (Breakfast, Lunch, Dinner, and optional Snacks) that aligns with the calorie and macro budget.
        6.  **Key Habits:** Include 2-3 crucial habits to adopt, like hydration, portion control, or mindful eating.
        7.  **Safety First:** Conclude with a clear, mandatory disclaimer: "This is an AI-generated plan and is for educational purposes only. It is not a substitute for professional medical advice. Please consult with a doctor or registered dietitian before making significant changes to your diet, especially if you have any pre-existing health conditions."

        Generate the plan now.
    `;

    const responseStream = await ai.models.generateContentStream({
        model: ADVANCED_MODEL,
        contents: prompt,
    });

    for await (const chunk of responseStream) {
        yield chunk.text;
    }
}

export async function* startChatStream(
    profile: HealthProfile,
    history: ChatMessage[]
): AsyncGenerator<string> {
    const chat: Chat = ai.chats.create({
      model: ADVANCED_MODEL,
      config: {
        systemInstruction: `You are MON, the AI Health Companion for MedHealth. Your primary role is to be an empathetic, supportive, and deeply encouraging confidant. You are a safe, non-judgmental space for users to talk about their health journey—the triumphs, the struggles, and everything in between.

- **Lead with Empathy:** Always validate the user's feelings before offering advice. Use phrases like, "It's completely understandable to feel that way," "That sounds incredibly challenging, and it's okay to struggle," or "That's a huge accomplishment! You should be so proud of that effort." Your first response should be human and supportive.

- **Explicitly Invite Sharing:** Your main goal is to make the user feel heard. Actively and gently encourage them to share their progress and challenges. Ask open-ended questions like:
    - "I'd love to hear about your week. What was a win for you, big or small?"
    - "How are you feeling about your progress, not just on the scale, but in general?"
    - "Are there any hurdles you're facing right now? Sometimes just talking about them can help."

- **Personalize with Care:** Use the provided user profile to make your conversation relevant, but do not just recite their data back to them. Refer to their goals in a motivational way.

- **Safety is Paramount:** Never provide medical advice, diagnoses, or specific treatment plans. If a user mentions a serious medical issue, severe symptoms, or anything that requires a professional, your one and only goal is to gently and firmly guide them to consult a doctor or registered dietitian.

- **Be a Positive Force:** Keep your messages clear, positive, and easy to understand. Celebrate every small step forward.

**User's Health Profile (for context):**
- Name: ${profile.name}
- Age: ${profile.age}, Sex: ${profile.gender}
- Height: ${profile.height} cm, Weight: ${profile.weight} kg
- Activity Level: ${profile.activityLevel}`
      },
       history: history.slice(0, -1).map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }],
       }))
    });

    const lastMessage = history[history.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
        return;
    }
    
    const responseStream = await chat.sendMessageStream({ message: lastMessage.text });

    for await (const chunk of responseStream) {
        yield chunk.text;
    }
}

export const generateWeeklyWorkoutPlan = async (
    profile: HealthProfile,
    goal: Goal,
    preference: WorkoutType
): Promise<WeeklyPlan> => {
    const prompt = `
        You are MedHealth Coach, a personal trainer AI for Indian users.
        Your task is to generate a detailed, personalized 7-day workout plan based on the user's profile, goal, and preferred workout style.

        **User Profile:**
        - Age: ${profile.age}, Sex: ${profile.gender}
        - Activity Level: ${profile.activityLevel}
        - Primary Goal: ${goal.type}

        **User's Preference:** "${preference}"

        **Instructions:**
        1.  **Create a 7-day plan** starting from Monday.
        2.  **Balance:** Include a mix of workout days and at least two rest or active recovery days.
        3.  **Activity Type:** For each day, set 'activity' to 'gym', 'yoga', or 'rest'. The plan should be primarily based on the user's preference but can include complementary activities.
        4.  **Focus:** Provide a clear 'focus' (e.g., "Full Body Strength", "Vinyasa Flow"). For rest days, use "Rest & Recover" or "Active Recovery".
        5.  **Trainer Notes:** Provide a short, encouraging 'trainerNotes' (under 20 words).
        6.  **Detailed Activities:**
            - If 'activity' is 'gym', provide a list of 3-5 exercises in an 'exercises' array. Each exercise object must have 'name', 'sets' (e.g., "3"), and 'reps' (e.g., "8-12"). 'poses' array must be empty.
            - If 'activity' is 'yoga', provide a list of 3-5 poses in a 'poses' array. Each pose object must have 'name' and 'duration' (e.g., "30 seconds" or "5 breaths"). 'exercises' array must be empty.
            - If 'activity' is 'rest', both 'exercises' and 'poses' arrays must be empty.
        7.  **JSON Output:** Return the plan as a JSON array of 7 objects following the schema.

        Generate the 7-day plan now.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.STRING },
                        activity: { type: Type.STRING },
                        focus: { type: Type.STRING },
                        trainerNotes: { type: Type.STRING },
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    sets: { type: Type.STRING },
                                    reps: { type: Type.STRING },
                                }
                            }
                        },
                        poses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return JSON.parse(response.text) as WeeklyPlan;
};

export const getExerciseTips = async (
    profile: HealthProfile,
    exerciseName: string
): Promise<string> => {
    const prompt = `
        You are MedHealth Coach, an expert personal trainer.
        A user is asking for tips on how to perform an exercise.

        **User Profile:**
        - Age: ${profile.age}, Sex: ${profile.gender}
        - Activity Level: ${profile.activityLevel}

        **Exercise:** "${exerciseName}"

        **Instructions:**
        Provide 3-4 concise, actionable tips for this exercise.
        Focus on:
        1.  **Proper Form:** The most critical part of the movement.
        2.  **Breathing:** When to inhale and exhale.
        3.  **Common Mistake:** One common error to avoid.
        
        Format your response as a single string with each tip on a new line, starting with a bullet point (•).
        Keep the language simple and encouraging. Do not add any introductory or concluding sentences.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
    });

    return response.text;
};

export const translateText = async (
    text: string,
    targetLanguage: string
): Promise<string> => {
    const prompt = `Translate the following text into ${targetLanguage}.
    Provide ONLY the translated text. Do not add any introductory phrases, explanations, or markdown formatting that wasn't in the original text.
    
    TEXT TO TRANSLATE:
    ---
    ${text}
    ---
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
    });

    return response.text;
};
