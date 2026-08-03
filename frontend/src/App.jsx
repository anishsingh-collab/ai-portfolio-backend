import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJDInput, setShowJDInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          job_description: jobDescription // Send the pasted JD to the backend
        }),
      });

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
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-layout">
      <header className="header">
        <h1>AI Representative & Job Matcher</h1>
        <button 
          className="jd-toggle-btn" 
          onClick={() => setShowJDInput(!showJDInput)}
        >
          {showJDInput ? 'Hide Job Description' : 'Paste Job Description 📋'}
        </button>
      </header>

      {showJDInput && (
        <div className="jd-container">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste Job Description here (e.g. Looking for a Python Developer with React experience...)"
            rows={4}
          />
        </div>
      )}
      
      <main className="chat-history">
        {messages.length === 0 && (
          <div className="welcome-screen">
            <h2>Hello. I'm Anish's AI.</h2>
            <p>Paste a job description above or ask me about his skills and projects.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            {msg.role === 'ai' && (
              <div className="ai-avatar">AI</div>
            )}
            <div className={`message-bubble ${msg.role}`}>
              {msg.content}
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
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={jobDescription ? "Ask: Is this candidate suitable?" : "Message the AI..."}
            disabled={isTyping}
          />
          <button 
            onClick={sendMessage} 
            disabled={!input.trim() || isTyping}
            className="send-button"
            aria-label="Send message"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div className="footer-text">
          AI generated. May occasionally produce inaccurate information.
        </div>
      </div>
    </div>
  );
}

export default App;