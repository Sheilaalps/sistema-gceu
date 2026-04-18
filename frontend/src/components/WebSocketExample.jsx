/**
 * ================================================================
 * EXEMPLO: Componente React com WebSocket Seguro
 * ================================================================
 * Copie e adapte este arquivo para seus componentes
 * 
 * Demonstra:
 * - Conectar ao WebSocket seguro
 * - Enviar e receber mensagens
 * - Gerenciar estado de conexão
 * - Tratar erros e reconexão
 */

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export function WebSocketExample() {
  const { ws, wsConnected, wsError } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Configurar listeners WebSocket
  useEffect(() => {
    if (!ws) return;

    // Escutar mensagens do servidor
    const handleMessage = (message) => {
      console.log('[Example] Mensagem recebida:', message);
      
      if (message.type === 'message') {
        setMessages(prev => [...prev, {
          from: message.from,
          content: message.content,
          timestamp: message.timestamp,
        }]);
      }
    };

    ws.on('message', handleMessage);

    // Cleanup
    return () => {
      ws.off('message', handleMessage);
    };
  }, [ws]);

  // Enviar mensagem
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !ws) return;

    ws.send({
      type: 'message',
      content: inputValue,
    });

    setInputValue('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>🌐 WebSocket Seguro - Exemplo</h2>

      {/* Status de Conexão */}
      <div style={{
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '4px',
        backgroundColor: wsConnected ? '#d4edda' : '#f8d7da',
        color: wsConnected ? '#155724' : '#721c24',
      }}>
        {wsConnected ? '✅ WebSocket Conectado' : '❌ WebSocket Desconectado'}
        {wsError && <p>Erro: {wsError.message}</p>}
      </div>

      {/* Chat */}
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px',
        marginBottom: '10px',
        height: '300px',
        overflow: 'auto',
        backgroundColor: '#f9f9f9',
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#999' }}>Nenhuma mensagem ainda...</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#fff',
                borderLeft: '3px solid #007bff',
                borderRadius: '2px',
              }}
            >
              <strong>{msg.from}</strong>
              <p style={{ margin: '4px 0 0 0' }}>{msg.content}</p>
              <small style={{ color: '#999' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          ))
        )}
      </div>

      {/* Form de Mensagem */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={!wsConnected}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        />
        <button
          type="submit"
          disabled={!wsConnected || !inputValue.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: wsConnected ? '#007bff' : '#ccc',
            color: 'white',
            cursor: wsConnected ? 'pointer' : 'not-allowed',
            fontSize: '14px',
          }}
        >
          Enviar
        </button>
      </form>

      {/* Debug Info */}
      <details style={{ marginTop: '20px', color: '#666' }}>
        <summary>📋 Debug Info</summary>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px',
        }}>
{`
Mensagens: ${messages.length}
WebSocket Status: ${wsConnected ? 'Conectado' : 'Desconectado'}
WebSocket Objeto: ${ws ? 'Inicializado' : 'Null'}
Erro: ${wsError ? wsError.message : 'Nenhum'}
`}
        </pre>
      </details>
    </div>
  );
}

export default WebSocketExample;
