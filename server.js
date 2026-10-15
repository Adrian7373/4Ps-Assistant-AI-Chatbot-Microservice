const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173'
];
const configuredOrigins = process.env.CORS_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
const allowedOrigins = configuredOrigins?.length ? configuredOrigins : defaultOrigins;

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
}));

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `
You are a helpful, professional, and general-purpose AI assistant.
Answer the user's questions clearly, accurately, and concisely.

<core_rules>
1. Be respectful and adapt to the user's language.
2. Do not claim access to private accounts, databases, or personal information.
3. Be transparent when information is unavailable or uncertain.
4. Do not invent facts, sources, schedules, credentials, or actions.
5. For requests that could cause harm or violate privacy, provide a safe and appropriate alternative.
</core_rules>

<knowledge_base>
[GENERAL 4Ps GRADUATION INFO]
- What does it mean to graduate from 4Ps?: Graduation means a household has achieved a level of self-sufficiency or no longer meets active eligibility criteria. They no longer receive conditional cash grants but are transitioned to aftercare support.
- Who monitors the graduates?: The Cabanatuan City LGU, DSWD City Links, and barangay personnel monitor graduates to ensure they do not fall back into poverty.
- Can a graduate return to active 4Ps status?: [FILL IN LGU POLICY HERE]

[AFTERCARE & LIVELIHOOD PROGRAMS]
- What aftercare services are available?: Partner agencies provide skills training, microenterprise support, and employment facilitation (e.g., Sustainable Livelihood Program).
- How do I apply for livelihood support?: [FILL IN APPLICATION STEPS/LOCATIONS HERE]
- Schedule for upcoming SLP orientations: [FILL IN DATES, TIMES, AND VENUES HERE]
- Upcoming job fairs for 4Ps graduates: [FILL IN DATES AND VENUES HERE]

[SYSTEM USAGE & PORTALS (For Agency/LGU Users asking publicly)]
- Where do partner agencies log in?: Authorized partner agencies must log in through the designated Agency Portal to record delivered services.
- How are needs tracked?: The system tracks 10 categories of needs. A need is only marked as met when a partner agency officially records a 'Completed' service against it.
- Can graduates log in to the system?: No, the system is exclusively for LGU administrators, City Links, and partner agencies. Graduates should coordinate with their barangay staff to update their records.

[OFFICIAL ANNOUNCEMENTS]
- Next LGU monitoring schedule per barangay: October 27, 2026 Whole day for all barangays inside Cabanatuan City
- Recent system updates: Significantly Improved UI and User Experience

[CONTACT & SUPPORT]
- Where is the DSWD/LGU office located?: https://maps.app.goo.gl/Y2fxegd6TTuh6YHX6
- Official contact number/email for 4Ps transition concerns: 4psassistance@dswd.gov.ph/0918-912-2813
- Office hours: Monday to Friday, 8:00 AM to 5:00 PM
</knowledge_base>
`;

const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite',
    systemInstruction: systemInstruction
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({ reply: responseText });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ reply: "Pasensya na, the system is currently undergoing maintenance. Please try again later." });
    }
});

const PORT = process.env.PORT || process.env.CHATBOT_PORT || 4001;
app.listen(PORT, () => console.log(`AI Assistant Microservice running on port ${PORT}`));