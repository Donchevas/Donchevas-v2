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
    <div className="chat-app" style={{ maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#2563eb', color: 'white', padding: '15px', textAlign: 'center' }}>
        <h1>🤖 Donchevas-v2</h1>
        <p>Orquestador: Familia | CV | Cursos</p>
      </header>
      
      <main style={{ height: '70vh', overflowY: 'auto', padding: '20px', background: '#f3f4f6' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            marginBottom: '15px', 
            padding: '10px 15px', 
            borderRadius: '10px',
            background: m.sender === 'user' ? '#dbeafe' : 'white',
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {/* Renderizado de Markdown para un formato profesional */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
          </div>
        ))}
        {isLoading && <p><i>Donchevas está analizando el contexto...</i></p>}
        <div ref={scrollRef} />
      </main>

      <footer style={{ display: 'flex', padding: '20px', background: 'white' }}>
        <input 
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu consulta..."
        />
        <button 
          style={{ marginLeft: '10px', padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px' }}
          onClick={handleSend} 
          disabled={isLoading}
        >
          Enviar
        </button>
      </footer>
    </div>
  );
}

export default App;