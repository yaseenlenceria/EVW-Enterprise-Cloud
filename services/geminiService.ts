import { GoogleGenAI } from "@google/genai";
import { Product, DashboardStats } from "../types";

const apiKey = process.env.API_KEY || ''; // In a real app, strict env check
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  /**
   * Generates a catchy marketing description for a product.
   */
  generateProductDescription: async (product: Partial<Product>): Promise<string> => {
    if (!apiKey) return "API Key missing. Please configure.";

    try {
      const prompt = `Write a short, exciting marketing description (max 2 sentences) for a vape product.
      Name: ${product.name}
      Flavor: ${product.flavor}
      Brand: ${product.brand}
      Category: ${product.category}.
      Target audience: Vape enthusiasts in Pakistan.
      Tone: Premium, bold.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Could not generate description.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "AI service temporarily unavailable.";
    }
  },

  /**
   * Analyzes dashboard stats and gives business advice.
   */
  getBusinessInsights: async (stats: DashboardStats, topProducts: string[]): Promise<string> => {
    if (!apiKey) return "API Key missing.";

    try {
      const prompt = `Act as a senior business analyst for a wholesale vape distribution business in Pakistan called EVW.
      Analyze these daily stats:
      - Revenue: PKR ${stats.totalRevenue}
      - Net Income: PKR ${stats.netIncome}
      - Low Stock Items: ${stats.lowStockCount}
      - Top Selling Products: ${topProducts.join(', ')}

      Provide 3 brief, actionable bullet points to improve profitability or operations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "No insights available.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Could not fetch insights.";
    }
  }
};
