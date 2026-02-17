import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = "https://donchevas-v2-1069673789450.europe-west1.run.app/chat";

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'bot'}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { text: data.respuesta, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "⚠️ Error de conexión.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .chat-app { display: flex; flex-direction: column; height: 100vh; max-width: 900px; margin: 0 auto; background: #f8fafc; font-family: 'Inter', sans-serif; }
        .chat-header { background: #1e40af; color: white; padding: 20px; text-align: center; border-bottom: 4px solid #1e3a8a; }
        .chat-window { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        
        .chat-bubble { max-width: 85%; padding: 15px 20px; border-radius: 12px; font-size: 15px; line-height: 1.6; }
        .chat-bubble.user { align-self: flex-end; background: #2563eb; color: white; }
        .chat-bubble.bot { align-self: flex-start; background: white; color: #334155; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        
        /* Formato Profesional de Contenido */
        .markdown-content p { margin-bottom: 12px; }
        .markdown-content ul, .markdown-content ol { margin-left: 20px; margin-bottom: 12px; }
        .markdown-content li { margin-bottom: 6px; }
        .markdown-content strong { color: #1e40af; font-weight: 700; }
        .markdown-content table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        .markdown-content th, .markdown-content td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        .markdown-content th { background: #f1f5f9; }
      `}</style>

      <div className="chat-app">
        <header className="chat-header">
          <h1>🤖 Donchevas-v2</h1>
          <p>Orquestador Multi-Dominio con Persistencia de Contexto</p>
        </header>
        <main className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.sender}`}>
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && <div className="chat-bubble bot"><i>Consultando base de conocimientos...</i></div>}
          <div ref={scrollRef} />
        </main>
        <footer className="chat-input-container">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Consulta presupuestos, familia o formación..."
            style={{flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1'}}
          />
          <button onClick={handleSend} disabled={isLoading} style={{padding: '12px 24px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', marginLeft: '10px'}}>
            Enviar
          </button>
        </footer>
      </div>
    </>
  );
}

export default App;