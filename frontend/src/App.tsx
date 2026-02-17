import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Nueva librería

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
      setMessages(prev => [...prev, { text: "⚠️ Error de conexión con el Orquestador.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .chat-app { display: flex; flex-direction: column; height: 100vh; max-width: 900px; margin: 0 auto; background: #f0f2f5; font-family: 'Segoe UI', Roboto, sans-serif; }
        .chat-header { background: #2563eb; color: white; padding: 1.5rem; text-align: center; border-bottom: 4px solid #1d4ed8; }
        .chat-window { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        
        /* Burbujas mejoradas */
        .chat-bubble { max-width: 85%; padding: 12px 18px; border-radius: 18px; font-size: 15px; line-height: 1.6; }
        .chat-bubble.user { align-self: flex-end; background: #007bff; color: white; border-bottom-right-radius: 4px; box-shadow: 0 2px 5px rgba(0,123,255,0.3); }
        .chat-bubble.bot { align-self: flex-start; background: white; color: #333; border-bottom-left-radius: 4px; border: 1px solid #e1e4e8; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        
        /* Estilos para el texto de IA (Markdown) */
        .chat-bubble.bot p { margin-bottom: 10px; }
        .chat-bubble.bot strong { color: #2563eb; }
        .chat-bubble.bot ul { padding-left: 20px; margin-bottom: 10px; }
        
        .chat-input-container { display: flex; padding: 20px; background: white; gap: 12px; border-top: 1px solid #dcdfe6; }
        .chat-input-container input { flex: 1; padding: 12px 18px; border: 2px solid #e1e4e8; border-radius: 30px; outline: none; transition: border-color 0.2s; }
        .chat-input-container input:focus { border-color: #2563eb; }
        .chat-input-container button { background: #2563eb; color: white; border: none; padding: 0 25px; border-radius: 30px; cursor: pointer; font-weight: 600; }
        .chat-input-container button:disabled { background: #a5b4fc; cursor: not-allowed; }
      `}</style>

      <div className="chat-app">
        <header className="chat-header">
          <h1>🤖 Donchevas-v2</h1>
          <p>Orquestador Multi-Dominio: Familia | CV | Cursos</p>
        </header>
        <main className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.sender}`}>
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          ))}
          {isLoading && <div className="chat-bubble bot"><i>Donchevas está analizando tu consulta...</i></div>}
          <div ref={scrollRef} />
        </main>
        <footer className="chat-input-container">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta aquí..."
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()}>Enviar</button>
        </footer>
      </div>
    </>
  );
}

export default App;