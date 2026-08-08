import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Copy, Check, Sparkles, MessageSquare, ClipboardPaste, ArrowDown } from 'lucide-react';
import gsap from 'gsap';

export default function AiChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJDInput, setShowJDInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Initial reveal animation
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: containerRef.current, start: "top 80%" } }
      );
    });
    return () => ctx.revert();
  }, []);

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
      let rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = `https://${rawUrl}`;
      }
      const backendUrl = rawUrl.replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages.filter(m => m.content && m.content.trim()),
          job_description: jobDescription
        }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
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
        if (lastIndex >= 0 && newMessages[lastIndex].role === 'ai') {
          newMessages[lastIndex].content = "⚠️ Connection error. Make sure the backend is running!";
        }
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="w-full py-24 px-6 md:px-16 bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-display font-medium text-dark mb-4 tracking-tight">Interactive AI Representative</h2>
        <p className="text-secondary text-lg">Evaluate my experience directly through this grounded agent.</p>
      </div>

      <div ref={containerRef} className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-[700px]">
        
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-semibold text-dark leading-tight">Anish's Agent</h1>
              <p className="text-xs text-secondary">Powered by LLaMA 3.3</p>
            </div>
          </div>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <button onClick={clearChat} className="p-2 text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Clear chat">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setShowJDInput(!showJDInput)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showJDInput ? 'bg-dark text-white' : 'bg-white border border-gray-200 text-dark hover:bg-gray-50'}`}
            >
              <ClipboardPaste className="w-4 h-4" />
              <span className="hidden sm:inline">{showJDInput ? 'Close JD' : 'Paste JD'}</span>
            </button>
          </div>
        </header>

        {/* JD Input */}
        {showJDInput && (
          <div className="p-4 bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Job Description (Context for AI)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here. The AI will evaluate my fit..."
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none"
              rows={3}
            />
          </div>
        )}
        
        {/* Chat History */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-dark mb-2">How can I help you evaluate Anish?</h2>
              <p className="text-secondary max-w-sm mb-8">Paste a job description or try asking one of these questions.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                <button 
                  onClick={() => setInput("What are Anish's top technical skills?")}
                  className="flex-1 p-4 rounded-xl border border-gray-200 hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
                >
                  <p className="text-sm font-medium text-dark group-hover:text-accent transition-colors">Top technical skills?</p>
                </button>
                <button 
                  onClick={() => setInput("Tell me about Anish's key projects.")}
                  className="flex-1 p-4 rounded-xl border border-gray-200 hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
                >
                  <p className="text-sm font-medium text-dark group-hover:text-accent transition-colors">Key projects?</p>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {msg.role === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`group relative rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-dark text-white rounded-tr-sm' 
                    : 'bg-gray-50 border border-gray-100 text-dark rounded-tl-sm'
                }`}>
                  {msg.content === '' && msg.role === 'ai' ? (
                    <div className="flex items-center gap-1 h-6 px-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  ) : (
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>
                  )}

                  {msg.role === 'ai' && msg.content && (
                    <button 
                      onClick={() => handleCopy(msg.content, index)}
                      className="absolute -bottom-3 -right-3 p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-400 hover:text-dark transition-all opacity-0 group-hover:opacity-100"
                      title="Copy"
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} className="h-4" /> 
        </main>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all shadow-sm">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={jobDescription ? "Ask: Is Anish suitable for this JD?" : "Message the AI..."}
              disabled={isTyping}
              className="flex-1 bg-transparent py-4 pl-4 pr-12 outline-none text-dark disabled:opacity-50 font-sans"
            />
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-dark text-white rounded-xl disabled:opacity-30 disabled:bg-gray-300 transition-colors"
            >
              {isTyping ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <ArrowDown className="w-5 h-5 -rotate-90" />
              )}
            </button>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
            AI generated response • Press Enter to send
          </p>
        </div>
      </div>
    </section>
  );
}
