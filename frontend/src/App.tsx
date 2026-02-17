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
      setMessages(prev => [...prev, { text: "⚠️ Error de conexión con el Orquestador.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '900px', margin: '0 auto', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: '#1e40af', color: 'white', padding: '1.5rem', textAlign: 'center', borderBottom: '4px solid #1e3a8a' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🤖 Donchevas-v2</h1>
        <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Manager Ejecutivo: Familia | CV | Formación</p>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            padding: '1rem',
            borderRadius: '12px',
            background: m.sender === 'user' ? '#2563eb' : 'white',
            color: m.sender === 'user' ? 'white' : '#1e293b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            lineHeight: '1.6'
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
          </div>
        ))}
        {isLoading && <div style={{ alignSelf: 'flex-start', color: '#64748b', fontStyle: 'italic' }}>Analizando contexto...</div>}
        <div ref={scrollRef} />
      </main>

      <footer style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
        <input 
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '9999px', border: '1px solid #cbd5e1', outline: 'none' }}
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe aquí..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading} style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '9999px', cursor: 'pointer' }}>Enviar</button>
      </footer>
    </div>
  );
}

export default App;