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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '800px', margin: '0 auto', background: '#f9fafb', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#1e40af', color: 'white', padding: '15px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>🤖 Donchevas-v2</h1>
        <p style={{ margin: 0 }}>Manager Ejecutivo de IA</p>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%', padding: '12px', borderRadius: '12px',
            background: m.sender === 'user' ? '#3b82f6' : 'white',
            color: m.sender === 'user' ? 'white' : '#1f2937',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
          </div>
        ))}
        {isLoading && <div style={{ color: '#6b7280' }}>Procesando con agentes...</div>}
        <div ref={scrollRef} />
      </main>
      <footer style={{ padding: '15px', background: 'white', display: 'flex', gap: '10px' }}>
        <input style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #d1d5db' }} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Haz tu pregunta..." />
        <button onClick={handleSend} disabled={isLoading} style={{ padding: '10px 20px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '5px' }}>Enviar</button>
      </footer>
    </div>
  );
}

export default App;