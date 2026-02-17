import React, { useState, useRef, useEffect } from 'react';

// URL de tu backend exitoso en Cloud Run
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
      setMessages(prev => [...prev, { text: "Error de conexión.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* SECCIÓN DE ESTILOS INYECTADOS (Lo que antes iba en App.css) */}
      <style>{`
        .chat-app { display: flex; flex-direction: column; height: 100vh; max-width: 800px; margin: 0 auto; background: #f3f4f6; font-family: sans-serif; }
        .chat-header { background: #2563eb; color: white; padding: 1rem; text-align: center; }
        .chat-window { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 10px; }
        .chat-bubble { max-width: 80%; padding: 10px 15px; border-radius: 15px; font-size: 14px; }
        .chat-bubble.user { align-self: flex-end; background: #dbeafe; color: #1f2937; }
        .chat-bubble.bot { align-self: flex-start; background: white; color: #1f2937; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .chat-input-container { display: flex; padding: 1rem; background: white; gap: 10px; border-top: 1px solid #ddd; }
        .chat-input-container input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
        .chat-input-container button { background: #2563eb; color: white; border: none; padding: 0 20px; border-radius: 5px; cursor: pointer; }
        .chat-input-container button:disabled { background: #93c5fd; }
      `}</style>

      {/* ESTRUCTURA DEL CHAT */}
      <div className="chat-app">
        <header className="chat-header">
          <h1>🤖 Donchevas-v2</h1>
          <p>Orquestador: Familia | CV | Cursos</p>
        </header>
        <main className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.sender}`}>{m.text}</div>
          ))}
          {isLoading && <div className="chat-bubble bot">Pensando...</div>}
          <div ref={scrollRef} />
        </main>
        <footer className="chat-input-container">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta algo..."
          />
          <button onClick={handleSend} disabled={isLoading}>Enviar</button>
        </footer>
      </div>
    </>
  );
}

export default App;