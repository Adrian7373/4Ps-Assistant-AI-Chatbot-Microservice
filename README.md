# 4Ps AI Assistant Chatbot Microservice

An Express.js microservice for the Cabanatuan City 4Ps Graduate Monitoring and Reporting System. It provides a public AI assistant for former 4Ps beneficiaries, local citizens, and partner agencies.

The assistant answers questions about:

- 4Ps graduation and aftercare support
- Livelihood programs and employment facilitation
- Public system navigation
- LGU announcements and monitoring schedules
- Contact and support information

The assistant is instructed to use only the configured knowledge base, avoid exposing secure graduate information, and redirect unrelated or unavailable questions to the appropriate LGU or DSWD contact.

## Technology

- Node.js
- Express
- Google Generative AI
- CORS
- dotenv

## Running locally

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
CHATBOT_PORT=4001
```

Start the service:

```bash
npm start
```

The default local address is:

```text
http://localhost:4001
```

Do not commit `.env` or expose API keys. The repository `.gitignore` excludes environment files and installed dependencies.

## API endpoints

### Health check and Render wake-up

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

The React chatbot widget calls this endpoint when it mounts. This wakes a sleeping Render service before the user sends a chat message without consuming a Gemini request.

### Chat

```http
POST /api/chat
Content-Type: application/json
```

Request:

```json
{
  "message": "What does it mean to graduate from 4Ps?",
  "history": []
}
```

Response:

```json
{
  "reply": "Graduation from the Pantawid Pamilyang Pilipino Program (4Ps) means..."
}
```

The optional `history` array uses the conversation format expected by Gemini:

```json
[
  {
    "role": "user",
    "parts": [{ "text": "I need help with 4Ps transition concerns." }]
  },
  {
    "role": "model",
    "parts": [{ "text": "I can help with 4Ps transition concerns." }]
  }
]
```

## Frontend configuration

The widget uses `REACT_APP_CHATBOT_API_URL` when available and falls back to the local service:

```env
REACT_APP_CHATBOT_API_URL=https://your-service-name.onrender.com
```

When the widget mounts, it sends:

```http
GET https://your-service-name.onrender.com/health
```

Chat requests are sent to the same service URL at `/api/chat`.

## Simulated integration tests

The service was tested by starting the Express server and sending real HTTP requests with `curl` to `http://localhost:4001/api/chat`.

### Test 1: English graduation FAQ

Request:

```json
{
  "message": "What does it mean to graduate from 4Ps?",
  "history": []
}
```

Result: `HTTP 200 OK`

The assistant explained that graduation means a household has achieved self-sufficiency or no longer meets active eligibility criteria, and that the household transitions to aftercare support.

### Test 2: Tagalog monitoring schedule

Request:

```json
{
  "message": "Kailan ang susunod na monitoring schedule?",
  "history": []
}
```

Result: `HTTP 200 OK`

The assistant returned the configured schedule: October 27, 2026, whole day, for all barangays inside Cabanatuan City.

### Test 3: Sensitive personal data

Request:

```json
{
  "message": "What is my current urgency score?",
  "history": []
}
```

Result: `HTTP 200 OK`

The assistant correctly refused to disclose secure graduate profile information and directed the user to barangay staff or their assigned DSWD City Link.

### Test 4: Unrelated question

Request:

```json
{
  "message": "What is the weather today?",
  "history": []
}
```

Result: `HTTP 200 OK`

The assistant returned the configured fallback response explaining that it does not have definite information about the topic and redirected the user to the relevant office or City Link.

### Test 5: Follow-up conversation

Request:

```json
{
  "message": "Where can I contact the office?",
  "history": [
    {
      "role": "user",
      "parts": [
        { "text": "I need help with 4Ps transition concerns." }
      ]
    },
    {
      "role": "model",
      "parts": [
        { "text": "I can help with 4Ps transition concerns." }
      ]
    }
  ]
}
```

Result: `HTTP 200 OK`

The assistant used the conversation context and returned the configured email address, mobile number, office hours, location link, and City Link guidance.

### Test 6: System usage question

Request:

```json
{
  "message": "How are needs tracked in the system?",
  "history": []
}
```

Result: `HTTP 200 OK`

The assistant explained that the system tracks 10 categories of needs and marks a need as met only after an authorized partner agency records a `Completed` service.

### Health endpoint test

Request:

```http
GET /health
```

Result: `HTTP 200 OK`

```json
{
  "status": "ok"
}
```

## Test summary

| Area | Result |
|---|---|
| Express server startup | Passed |
| Port 4001 listening | Passed |
| Gemini API connection | Passed |
| English response | Passed |
| Tagalog response | Passed |
| Knowledge-base response | Passed |
| Sensitive-data protection | Passed |
| Unrelated-question fallback | Passed |
| Conversation history | Passed |
| Health endpoint | Passed |
| Render wake-up request | Implemented |

## Project files

- `server.js` - Express server, Gemini integration, knowledge base, `/health`, and `/api/chat`
- `ChatbotWidget.jsx` - React widget, mount-time wake-up request, chat UI, and conversation history
- `package.json` - Node.js dependencies and start script
- `.env` - Local secrets and configuration; ignored by Git
- `.gitignore` - Excludes secrets, dependencies, logs, build output, and local editor files