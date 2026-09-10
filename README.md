# Cryptic to Clear: A tiny compiler that explains its own errors

Cryptic to Clear is an intelligent compiler platform powered by AI that runs, compiles, analyzes, and explains code errors in plain English.

## Groq Setup

1. Get a Groq API key from [Groq Console](https://console.groq.com/).
2. In `backend/.env`, set your Groq API key:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

3. Start the backend:

```bash
cd backend
npm install
npm start
```

4. Verify backend health endpoint:

```bash
curl http://127.0.0.1:5000/api/health
```

---

codementor
