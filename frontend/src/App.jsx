import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJDInput, setShowJDInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (text, index) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    if (window.confirm("Clear all chat messages?")) {
      setMessages([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages([...updatedMessages, { role: 'ai', content: '' }]);
    setInput('');
    setIsTyping(true);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages,
          job_description: jobDescription
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          
          const updatedMessage = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + chunk
          };
          
          newMessages[lastIndex] = updatedMessage;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === 'ai' && !newMessages[lastIndex].content) {
          newMessages[lastIndex].content = "⚠️ Unable to connect to AI server. Please verify your connection or backend status.";
        }
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-layout">
      <header className="header">
        <div className="header-title">
          <span className="logo-sparkle">✨</span>
          <h1>AI Representative & Job Matcher</h1>
        </div>
        <div className="header-actions">
          {messages.length > 0 && (
            <button 
              className="action-btn clear-btn" 
              onClick={clearChat}
              title="Clear chat history"
            >
              Clear 🗑️
            </button>
          )}
          <button 
            className="action-btn jd-toggle-btn" 
            onClick={() => setShowJDInput(!showJDInput)}
          >
            {showJDInput ? 'Hide JD' : 'Paste Job Description 📋'}
          </button>
        </div>
      </header>

      {showJDInput && (
        <div className="jd-container">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste Job Description here (e.g. Looking for a Python Developer with React experience...)"
            rows={3}
          />
        </div>
      )}
      
      <main className="chat-history">
        {messages.length === 0 && (
          <div className="welcome-screen">
            <div className="welcome-badge">Grounded AI Agent</div>
            <h2>Hello. I'm Anish's AI.</h2>
            <p>Paste a job description above to evaluate candidate fit, or ask me about his skills and projects.</p>
            <div className="sample-prompts">
              <button onClick={() => setInput("What are Anish's top technical skills?")}>
                💡 Top technical skills?
              </button>
              <button onClick={() => setInput("Tell me about Anish's key projects.")}>
                🚀 Key projects?
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            {msg.role === 'ai' && (
              <div className="ai-avatar">AI</div>
            )}
            <div className={`message-bubble ${msg.role}`}>
              {msg.content === '' && msg.role === 'ai' ? (
                <div className="typing-indicator" aria-label="AI is thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <>
                  <div className="message-text">{msg.content}</div>
                  {msg.role === 'ai' && msg.content && (
                    <div className="message-actions">
                      <button 
                        className="copy-btn" 
                        onClick={() => handleCopy(msg.content, index)}
                        title="Copy response"
                      >
                        {copiedIndex === index ? 'Copied! ✓' : '📋 Copy'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> 
      </main>

      <div className="input-container">
        <div className="input-box">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={jobDescription ? "Ask: Is this candidate suitable for the JD?" : "Message the AI..."}
            disabled={isTyping}
          />
          <button 
            onClick={sendMessage} 
            disabled={!input.trim() || isTyping}
            className="send-button"
            aria-label="Send message"
          >
            {isTyping ? (
              <div className="spinner"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
        <div className="footer-text">
          AI generated response • Press Enter to send
        </div>
      </div>
    </div>
  );
}

export default App;