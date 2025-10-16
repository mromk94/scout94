import { useState, useEffect, useCallback, useRef } from 'react';

const WS_URL = 'ws://localhost:8094';

export default function useWebSocket() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const runningTestRef = useRef(null);

  const connect = useCallback(() => {
    try {
      console.log('🔌 Connecting to WebSocket server...');
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        // Clear any reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received:', data);

          // Ignore heartbeat messages
          if (data.type === 'heartbeat') return;

          // Handle open_file message - auto-open report in IDE
          if (data.type === 'open_file' && data.filePath) {
            console.log('📄 Auto-opening file:', data.filePath);
            // Dispatch custom event for IDE pane to handle
            window.dispatchEvent(new CustomEvent('scout94-open-file', {
              detail: { filePath: data.filePath }
            }));
            return;
          }

          // Handle different message types
          if (data.type === 'message' || data.type === 'log' || data.type === 'connected') {
            const messageText = data.text || data.message;
            
            setMessages((prev) => [...prev, {
              id: Date.now() + Math.random(),
              agent: data.agent || 'scout94',
              text: messageText,
              timestamp: new Date(data.timestamp || Date.now()),
              type: data.messageType || 'message'
            }]);
            
            // Detect test completion and reset isRunning
            if (messageText && (
              messageText.includes('Test completed successfully') ||
              messageText.includes('ALL TESTS PASSED') ||
              messageText.includes('Analysis Complete') ||
              messageText.includes('Test failed') ||
              messageText.includes('PRODUCTION READY')
            )) {
              console.log('✅ Test completion detected, resetting state');
              setIsRunning(false);
              runningTestRef.current = null;
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        setIsRunning(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Send TEST command - triggers actual test execution
  const sendCommand = useCallback((command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('🚀 Running TEST:', command);
      setIsRunning(true);
      runningTestRef.current = command;
      
      wsRef.current.send(JSON.stringify({
        type: 'run_test',
        command: command,
        timestamp: new Date().toISOString()
      }));

      setMessages((prev) => [...prev, {
        id: Date.now(),
        agent: 'scout94',
        text: `🚀 Starting: ${command}`,
        timestamp: new Date(),
        type: 'command'
      }]);
    } else {
      console.error('WebSocket not connected');
    }
  }, []);

  // Send CHAT message - for conversation with agents
  const sendChat = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('💬 Sending chat:', message);
      
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        message: message,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.error('WebSocket not connected');
    }
  }, []);

  // STOP running tests
  const stopTests = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('🛑 Stopping tests');
      
      wsRef.current.send(JSON.stringify({
        type: 'stop_test',
        timestamp: new Date().toISOString()
      }));
      
      setIsRunning(false);
      runningTestRef.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Attach additional methods to sendCommand for backwards compatibility
  sendCommand.sendChat = sendChat;
  sendCommand.stopTests = stopTests;

  return {
    messages,
    isConnected,
    isRunning,
    sendCommand,
    sendChat,
    stopTests,
    clearMessages
  };
}
