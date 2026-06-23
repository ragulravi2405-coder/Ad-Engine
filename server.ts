import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Endpoint for AI branding copy and design instructions
app.post("/api/generate-branding", async (req, res) => {
  try {
    const { companyName, productDetails, promoOffer, targetAudience, adType } = req.body;

    if (!companyName || !productDetails) {
      return res.status(400).json({ error: "Company name and product details are required." });
    }

    const prompt = `
      You are Ad Engine, an elite AI Brand strategist and visual copywriter.
      Generate a complete marketing and branding campaign for:
      - Company Name: ${companyName}
      - Product/Service: ${productDetails}
      - Promotional Offer: ${promoOffer || "N/A"}
      - Target Audience: ${targetAudience || "General Public"}
      - Primary Advertisement Type requested: ${adType || "Promotional Poster"}

      Deliver a highly professional, creative brand bundle. Return ONLY a JSON object with this exact structure:
      {
        "slogan": "A single extremely catchy brand slogan",
        "headline": "A punchy, attention-grabbing ad headline for the visual poster",
        "subheading": "A secondary explaining subheading",
        "promoCallout": "Short bold promo action text (e.g. 'ACT NOW - 50% OFF')",
        "bulletPoints": ["Highly persuasive benefit point 1", "Highly persuasive benefit point 2", "Highly persuasive benefit point 3"],
        "posterTheme": {
          "primaryColor": "A gorgeous soft pastel hex code (e.g., #FFD1DC or #E8D3FF)",
          "secondaryColor": "A complementary dark/pastel pastel accent hex code",
          "backgroundColor": "A very soft baby pastel gradient start hex code",
          "textColor": "Deep professional text color hex (dark charcoal/slate like #2D3748)",
          "backgroundImagePrompt": "Artistic pastel fantasy illustration prompt to generate a beautiful decorative abstract backdrop for this product on a 1:1 format."
        },
        "socialCaption": "A complete, ready-to-paste social media post caption (with a hook, value description, and modern hashtags)",
        "reelScript": {
          "title": "Hook title for the short-form video / Reel",
          "scenes": [
            { "sceneNumber": 1, "visualDescription": "Visual design/scene action cue (e.g., camera zooms close on smiling face...)", "audioSpeech": "The precise narration spoken aloud in this segment" },
            { "sceneNumber": 2, "visualDescription": "Visual design/scene action cue", "audioSpeech": "The precise narration spoken aloud in this segment" },
            { "sceneNumber": 3, "visualDescription": "Visual design/scene action cue outlining the grand final promo", "audioSpeech": "Final call to action narration" }
          ]
        },
        "voiceScript": "The full continuous narration script for a voice-over, optimized for natural speaking pacing."
      }

      Return only clean JSON without any markdown formatting wrappers like \`\`\`json. Keep it professional, creative, targeting a fantasy-pastel modern aesthetic.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    // Clean up potentially wrapped markdown
    let cleanJson = text.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      return res.json(parsedData);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", text);
      return res.status(500).json({
        error: "Failed to generate structured JSON branding campaign.",
        rawText: text,
      });
    }
  } catch (error: any) {
    console.error("Branding generation error:", error);
    return res.status(500).json({ error: error.message || "Branding asset generation failed." });
  }
});

// Endpoint to generate backgrounds using Gemini Image Generation (gemini-2.5-flash-image)
app.post("/api/generate-backdrop", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required to generate background." });
    }

    const fullPrompt = `Beautiful, ultra-gorgeous aesthetic minimalist pastel fantasy background illustration. ${prompt}. Soft baby colors, ethereal vibes, high quality, clean backdrop, copy space, advertisement template background.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      return res.status(500).json({ error: "No image inlineData was returned by the model." });
    }

    return res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
  } catch (error: any) {
    console.error("Backdrop generation error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI backdrop." });
  }
});

// Endpoint to generate premium voice-overs using gemini-3.1-flash-tts-preview
app.post("/api/generate-tts", async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required to generate TTS voice-over." });
    }

    const ttsVoice = voiceName || "Kore"; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: ttsVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: "No audio data was returned by the TTS model." });
    }

    return res.json({ audioUrl: `data:audio/wav;base64,${base64Audio}` });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    return res.status(500).json({ error: error.message || "Speech synthesis failed." });
  }
});

// Vite middleware & Static Files handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Ad Engine] Running on port ${PORT}`);
  });
}

startServer();
