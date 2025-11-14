import React, { useState, useEffect, useRef } from "react";
import "./ChatPage.css";

const providers = {
  openai: ["gpt-3.5-turbo", "gpt-4"],
  claude: ["Claude-3-Haiku", "Claude-3-Sonnet"],
  gemini: ["Gemini Flash", "Gemini Pro"],
  ollama: ["llama3"],
};

function ChatPage() {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("Gemini Flash");
  const [files, setFiles] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  const messageEndRef = useRef(null);
  const sessionListRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch sessions
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Fetch messages when session selected
  useEffect(() => {
    if (!selectedSession) return;
    fetch(`http://127.0.0.1:8000/api/sessions/${selectedSession.id}/messages`)
      .then((res) => (res.status === 404 ? [] : res.json()))
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [selectedSession]);

  // Create session
  const createSession = () => {
    fetch("http://127.0.0.1:8000/api/sessions", { method: "POST" })
      .then((res) => res.json())
      .then((newSession) => {
        setSessions((prev) => [newSession, ...prev]);
        setSelectedSession(newSession);
        setMessages([]);

        // Scroll to top smoothly
        setTimeout(() => {
          sessionListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
      })
      .catch(console.error);
  };

  // Delete session
  const deleteSession = (sessionId) => {
    fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete session");
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (selectedSession?.id === sessionId) setSelectedSession(null);
      })
      .catch(console.error);
  };

  const copyMessage = (text) => navigator.clipboard.writeText(text).then(() => alert("Copied ✅"));
  const startEdit = (idx, text) => { setEditingIndex(idx); setEditText(text); };
  const saveEdit = (idx) => { setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, content: editText } : m))); setEditingIndex(null); setEditText(""); };

  // Send message via SSE
  const sendMessage = () => {
    if (!input.trim() || !selectedSession) return;

    setMessages((prev) => [...prev, { role: "user", content: input, timestamp: new Date().toISOString(), files }]);
    setLoading(true);
    setFiles([]);

    let assistantMessage = "";
    const evtSource = new EventSource(
      `http://127.0.0.1:8000/api/chat/stream?session_id=${selectedSession.id}&provider=${provider}&model=${model}&prompt=${encodeURIComponent(input)}`
    );

    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.delta === "[DONE]") { evtSource.close(); setLoading(false); return; }
        assistantMessage += data.delta;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") return [...prev.slice(0, -1), { role: "assistant", content: assistantMessage, timestamp: new Date().toISOString() }];
          return [...prev, { role: "assistant", content: assistantMessage, timestamp: new Date().toISOString() }];
        });
      } catch (err) { console.error("SSE parse failed:", e.data, err); }
    };

    evtSource.onerror = () => { evtSource.close(); setLoading(false); };
    setInput("");
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile-section"><h3>Hello, {profile?.username || "User"}</h3></div>
        <button onClick={createSession} className="new-session-btn">+ New Session</button>
        <div className="sessions-list" ref={sessionListRef}>
          {sessions.map((s) => (
            <div key={s.id} className={`session-item ${selectedSession?.id === s.id ? "selected" : ""}`}>
              <div onClick={() => setSelectedSession(s)} className="session-content">
                <b>{s.title || "Untitled"}</b>
                <small>{s.updated_at ? new Date(s.updated_at).toLocaleString() : ""}</small>
              </div>
              <div onClick={() => deleteSession(s.id)} className="delete-btn">🗑️</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                {editingIndex === idx && msg.role === "user"
                  ? <div><textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="edit-textarea" /><button onClick={() => saveEdit(idx)} className="edit-save-btn">Save</button></div>
                  : msg.content
                }
                <div className="message-actions">
                  {msg.role === "user" && <span onClick={() => startEdit(idx, msg.content)}>✏️</span>}
                  <span onClick={() => copyMessage(msg.content)}>📋</span>
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="loading-indicator">Assistant is typing...</div>}
          <div ref={messageEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="message-input" disabled={loading} placeholder="Type your message..." />
          <div className="controls-column">
            <select value={provider} onChange={(e) => { setProvider(e.target.value); setModel(providers[e.target.value][0]); }}>
              {Object.keys(providers).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {providers[provider].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">Send</button>
          <button onClick={() => setLoading(false)} disabled={!loading} className="stop-btn">Stop</button>
          <div className="char-counter">{input.length} chars</div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;