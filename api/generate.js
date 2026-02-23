import Groq from 'groq-sdk';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            return res.status(500).json({ error: 'Missing Groq API Key. Please configure it in your .env file or Vercel settings.' });
        }

        // Initialize the Groq client instance
        const groq = new Groq({ apiKey });

        const {
            businessName, niche, targetAudience, tone, contentType, language,
            graphicsCount, reelsCount, motionCount, liveCount
        } = req.body;

        // Validate inputs
        if (!businessName || !niche || !tone || !contentType) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        let prompt = '';

        // Apply user-requested prompt structure with dynamic variable mapping
        if (contentType === '30-Day Content Calendar') {
            const formatRules = `The calendar must exactly contain a total of: ${graphicsCount || 0} Graphics, ${reelsCount || 0} Reels, ${motionCount || 0} Motion Videos, and ${liveCount || 0} Live Sessions.`;

            prompt = `You are an expert Social Media Manager. Create a 30-day content calendar for a business named ${businessName} in the ${niche} industry. Target audience: ${targetAudience || 'General Audience'}. Tone: ${tone}. ${formatRules} Output format: A clean table with columns: Day | Content Topic | Format | Visual Idea | Post Content Details. Important Column Rules: For 'Visual Idea', if it is a Graphic provide an AI image generation prompt; if it is a Reel/Motion Video provide a detailed scene/action concept. For 'Post Content Details', write the exact caption including a CTA and targeted hashtags. Answer fully in ${language || 'English'}.`;
        } else if (contentType === 'Reel Script') {
            prompt = `You are an expert video content creator. Write a highly engaging Reel script for ${businessName} (Industry: ${niche}). Tone: ${tone}. Structure: 1. Hook (0-3s), 2. Body, 3. CTA. Include camera cues. Answer fully in ${language || 'English'}.`;
        } else {
            return res.status(400).json({ error: 'Invalid content type.' });
        }

        // Call the Groq API for Llama 3.3 70B
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            model: 'llama-3.3-70b-versatile',
        });

        // Extract completion text safely
        const responseText = chatCompletion.choices[0]?.message?.content || "";

        // Return the response directly
        res.status(200).json({ text: responseText });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: error.message || 'Failed to generate content. Please try again.' });
    }
}
