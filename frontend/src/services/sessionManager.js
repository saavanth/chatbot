import API from "./api";

const LOCAL_KEY = "anon_sessions";

// Check login
export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

// ----------------------
// Sessions
// ----------------------
export async function getSessions() {
  if (!isLoggedIn()) {
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return local;
  }
  const res = await API.get("/sessions");
  return res.data;
}

export async function createSession() {
  if (!isLoggedIn()) {
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    const newSession = {
      id: Date.now().toString(),
      title: "New Chat",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };
    local.unshift(newSession);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
    return newSession;
  }
  const res = await API.post("/sessions");
  return res.data;
}

export async function deleteSession(sessionId) {
  if (!isLoggedIn()) {
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    const updated = local.filter((s) => s.id !== sessionId);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    return { status: "deleted", session_id: sessionId };
  }
  const res = await API.delete(`/sessions/${sessionId}`);
  return res.data;
}

// ----------------------
// Messages
// ----------------------
export async function getMessages(sessionId) {
  if (!isLoggedIn()) {
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    const session = local.find((s) => s.id === sessionId);
    return session ? session.messages : [];
  }
  const res = await API.get(`/sessions/${sessionId}/messages`);
  return res.data;
}

export async function saveMessage(sessionId, message) {
  if (!isLoggedIn()) {
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    const session = local.find((s) => s.id === sessionId);
    if (session) {
      session.messages.push(message);
      session.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
    }
    return message;
  }
  // For authenticated, your backend chat API will handle saving automatically
  return message;
}