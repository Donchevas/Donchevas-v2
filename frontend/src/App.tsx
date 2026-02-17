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
      setMessages(prev => [...prev, { text: "⚠️ Error: No pude conectar con el Orquestador.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '900px', margin: '0 auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f0f2f5' }}>
      <header style={{ background: '#2563eb', color: 'white', padding: '20px', textAlign: 'center', borderBottom: '4px solid #1d4ed8' }}>
        <h1 style={{ margin: 0 }}>🤖 Donchevas-v2</h1>
        <p style={{ margin: '5px 0 0' }}>Agente Multi-Dominio | Persistencia de Contexto</p>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '15px', borderRadius: '15px', background: m.sender === 'user' ? '#007bff' : 'white', color: m.sender === 'user' ? 'white' : '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            {/* Renderizado Profesional de Markdown */}
            <div style={{ lineHeight: '1.6' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && <div style={{ alignSelf: 'flex-start', color: '#666', fontStyle: 'italic' }}>Analizando corpus y contexto...</div>}
        <div ref={scrollRef} />
      </main>

      <footer style={{ padding: '20px', background: 'white', display: 'flex', gap: '10px', borderTop: '1px solid #ddd' }}>
        <input 
          style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ccc', outline: 'none' }}
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Consulta inversiones, familia o cursos de IA..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Enviar
        </button>
      </footer>
    </div>
  );
}

export default App;