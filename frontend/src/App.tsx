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
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#2563eb', color: 'white', padding: '1rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>🤖 Donchevas-v2</h1>
        <p style={{ margin: 0 }}>Persistencia de Contexto Multi-Dominio</p>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f3f4f6' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            background: m.sender === 'user' ? '#dbeafe' : 'white',
            padding: '12px', borderRadius: '10px', marginBottom: '10px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
          </div>
        ))}
        {isLoading && <p><i>Consultando agentes especializados...</i></p>}
        <div ref={scrollRef} />
      </main>
      <footer style={{ display: 'flex', padding: '15px', background: 'white' }}>
        <input style={{ flex: 1, padding: '10px' }} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend} style={{ marginLeft: '10px', padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none' }}>Enviar</button>
      </footer>
    </div>
  );
}

export default App;