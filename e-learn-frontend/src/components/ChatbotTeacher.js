import React, { useState, useRef, useEffect } from 'react';
import axios from '../services/axios';
import { Box, Typography, TextField, IconButton, Paper, CircularProgress, Fade } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatbotTeacher = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Teacher. Ask me anything about your courses.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/chatbot', { message: input });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (err) {
      console.error("Error in chatbot request:", err);
      setError(err?.response?.data?.error || 'Failed to get a response.');
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I could not process your request.' }]);
    }
    setLoading(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <Paper elevation={4} sx={{ maxWidth: 400, mx: 'auto', my: 3, p: 2, borderRadius: 3, height: 550, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" align="center" gutterBottom>AI Chatbot Teacher</Typography>
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, px: 1, background: '#f9f9f9', borderRadius: 2 }}>
        {messages.map((msg, idx) => (
          <Box key={idx} sx={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', mb: 1 }}>
            <Box sx={{ bgcolor: msg.sender === 'user' ? '#1976d2' : '#e0e0e0', color: msg.sender === 'user' ? '#fff' : '#333', px: 2, py: 1, borderRadius: 2, maxWidth: '80%' }}>
              <Typography variant="body2">{msg.text}</Typography>
            </Box>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>
      {error && (
        <Box sx={{ mb: 2, p: 1, bgcolor: '#ffebee', color: '#c62828', borderRadius: 2 }}>
          <Typography variant="body2">Error: {error}</Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={loading}
        />
        <Fade in={loading} unmountOnExit>
          <CircularProgress size={28} sx={{ ml: 2 }} />
        </Fade>
        <IconButton color="primary" onClick={sendMessage} disabled={loading || !input.trim()} sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatbotTeacher;
