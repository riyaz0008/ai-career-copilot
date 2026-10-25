import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function checkModels() {
    try {
        const pager = await ai.models.list();

        for await (const model of pager) {
            if (
                model.supportedActions?.includes("generateContent")
            ) {
                console.log(model.name);
            }
        }
    } catch (error) {
        console.error(
            "Unable to list Gemini models:",
            error.message
        );
    }
}

checkModels();