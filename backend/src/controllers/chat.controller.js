const openaiService = require("../services/openai.service");

const VALID_ROLES = new Set(["user", "assistant"]);
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_SOURCE_LENGTH = 20000;
 
/**
 * Detects if a query is clearly about entertainment, movies, celebrities, sports,
 * or other non-academic/non-coding topics, while allowing coding-related queries that
 * happen to mention these terms (e.g. "write a movie booking system in python").
 */
function isOffTopicQuery(query) {
  if (!query || typeof query !== "string") return false;

  const hasCodingIntent =
    /\b(code|coding|program|programming|function|algorithm|script|class|method|sql|query|database|schema|debug|error|bug|syntax|java|python|cpp|c\+\+|html|css|javascript|typescript|react|api|backend|frontend|complexity|big o|data structure|array|linked list|tree|graph|leetcode|stack|queue|loop|recursion|object|variable|pointer)\b/i.test(
      query
    );

  if (hasCodingIntent) return false;

  const offTopicPatterns = [
    /\b(tfi|tollywood|bollywood|hollywood|kollywood|mollywood)\b/i,
    /\b(movie|movies|film|films|cinema|box office|trailer|teaser|blockbuster)\b/i,
    /\b(actor|actress|celebrity|celebrities|hero|heroine|star cast|director|film maker)\b/i,
    /\b(song|songs|album|lyrics|singer|music video)\b/i,
    /\b(cricket|football|ipl|fifa|world cup|match score|messi|ronaldo|kohli|dhoni)\b/i,
    /\b(politics|politician|election|minister|chief minister|prime minister|bjp|congress)\b/i,
  ];

  return offTopicPatterns.some((pattern) => pattern.test(query));
}

/**
 * POST /api/chat
 * Body: { language: string, sourceCode: string, messages: {role, content}[] }
 *
 * Powers the permanent AI Chat panel. The frontend keeps the conversation
 * in its own state and sends the whole (trimmed) history each call — this
 * endpoint stays stateless and reusable, same as /api/execute and
 * /api/explain.
 */
async function chat(req, res, next) {
  try {
    const { language, sourceCode, messages } = req.body || {};

    if (
      !language ||
      typeof sourceCode !== "string" ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Request must include 'language', 'sourceCode', and a non-empty 'messages' array.",
      });
    }

    const cleanMessages = messages
      .filter(
        (m) =>
          m &&
          VALID_ROLES.has(m.role) &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, MAX_MESSAGE_LENGTH),
      }));

    if (cleanMessages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid messages were provided.",
      });
    }

    const lastUserMsg = cleanMessages.filter((m) => m.role === "user").slice(-1)[0];
    if (lastUserMsg && isOffTopicQuery(lastUserMsg.content)) {
      return res.status(200).json({
        success: true,
        reply:
          "I am specialized solely as a coding and academic study assistant. I cannot answer questions about movies, entertainment, or non-technical topics.\n\nPlease feel free to ask any question about programming, computer science, algorithms, or the code in your editor!",
      });
    }

    const reply = await openaiService.chatReply({
      language,
      sourceCode: sourceCode.slice(0, MAX_SOURCE_LENGTH),
      messages: cleanMessages,
    });

    return res.status(200).json({ success: true, reply });
  } catch (err) {
    return next(err);
  }
}

module.exports = { chat };
