import express from 'express';
import dotenv from 'dotenv';
import generateHandler from './api/generate.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/generate', async (req, res) => {
    console.log('Received generation request API hit.');
    try {
        // Forward directly to the Vercel handler
        await generateHandler(req, res);
    } catch (error) {
        console.error('Error in proxy handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(port, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 Local dev server started at: http://localhost:${port}`);
    console.log(`=================================================\n`);

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_api_key_here') {
        console.warn(`⚠️  WARNING: GROQ_API_KEY is missing or invalid in your .env file!`);
        console.warn(`Please add a valid Groq API key to .env so generations succeed.\n`);
    }
});
