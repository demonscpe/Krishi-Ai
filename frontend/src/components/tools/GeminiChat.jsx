import React, { useEffect, useRef, useState } from 'react';
import { TextField, Button, Paper, Box, Stack, IconButton, Grid, Typography, Card, CardActionArea } from '@mui/material';
import { FaPaperPlane, FaTrash, FaRobot, FaMagic, FaSeedling, FaCloudSun, FaQuestionCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import img1 from "../../assets/tp.png";

const GeminiChat = () => {
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState(() => {
        const savedHistory = localStorage.getItem('chatHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const chatContainerRef = useRef(null);

    // Prompt Suggestions (Matching your reference image style)
    const suggestions = [
        { text: "Recommend best crops for this season", icon: <FaSeedling color="#05B913" /> },
        { text: "How do I manage soil pH levels?", icon: <FaMagic color="#05B913" /> },
        { text: "What's the weather forecast for today?", icon: <FaCloudSun color="#05B913" /> },
        { text: "Identify common plant diseases", icon: <FaQuestionCircle color="#05B913" /> }
    ];

    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatHistory]);

    const handleSuggestionClick = (text) => {
        setUserInput(text);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!userInput.trim()) return;

        const userMessage = { sender: "User", text: userInput };
        setChatHistory((prev) => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput("");

        try {
            const res = await fetch('http://localhost:8080/api/generate-content/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `User query: ${currentInput}\nNote: Return ONLY the HTML body tags content.`,
                }),
            });

            if (!res.ok) throw new Error(`Server error`);
            const data = await res.json();
            const content = data.generatedText.split('\n').slice(1).join('\n'); 

            setChatHistory((prev) => [...prev, { sender: "AI", text: content }]);
        } catch (error) {
            toast.error("AI is temporarily unavailable.");
        }
    };

    return (
        <div style={{
            height: '100vh',
            backgroundImage: `url(${img1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
        }}>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 0 }}></div>

            <Paper elevation={0} sx={{
                zIndex: 1,
                width: '100%',
                maxWidth: '1000px', // Wider like your image
                height: '85vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                background: '#ffffff'
            }}>
                {/* Header Area */}
                <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#f0f9f0' }}>
                            <FaRobot size={24} color="#05B913" />
                        </Box>
                        <Typography variant="h6" fontWeight="700" color="#333">Krishi AI Chat</Typography>
                    </Stack>
                    <IconButton onClick={() => {setChatHistory([]); localStorage.removeItem('chatHistory');}} size="small">
                        <FaTrash size={16} />
                    </IconButton>
                </Box>

                {/* Main Chat/Empty State Area */}
                <Box ref={chatContainerRef} sx={{ flex: 1, overflowY: 'auto', p: 4, bgcolor: '#fff' }}>
                    <AnimatePresence>
                        {chatHistory.length === 0 ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: '600px', margin: 'auto', marginTop: '5%' }}>
                                <Box sx={{ mb: 3 }}>
                                    <FaRobot size={48} color="#e0e0e0" />
                                </Box>
                                <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#1a1a1a' }}>
                                    Let's chat! What's on your mind?
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#666', mb: 5 }}>
                                    Choose from the prompts below or start asking queries. I'm here to help with your farming needs.
                                </Typography>
                                
                                <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#999', display: 'block', mb: 2 }}>
                                    Try these prompts
                                </Typography>

                                <Grid container spacing={2}>
                                    {suggestions.map((item, idx) => (
                                        <Grid item xs={6} key={idx}>
                                            <Card variant="outlined" sx={{ borderRadius: '12px', border: '1px solid #eee', '&:hover': { borderColor: '#05B913' } }}>
                                                <CardActionArea onClick={() => handleSuggestionClick(item.text)} sx={{ p: 2, textAlign: 'left', display: 'flex', gap: 2 }}>
                                                    {item.icon}
                                                    <Typography variant="body2" fontWeight="500">{item.text}</Typography>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </motion.div>
                        ) : (
                            chatHistory.map((msg, index) => (
                                <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '24px', display: 'flex', justifyContent: msg.sender === "User" ? 'flex-end' : 'flex-start' }}>
                                    <Box sx={{ 
                                        maxWidth: '70%', 
                                        p: 2, 
                                        borderRadius: '16px',
                                        bgcolor: msg.sender === "User" ? '#05B913' : '#f5f5f5',
                                        color: msg.sender === "User" ? '#fff' : '#333'
                                    }}>
                                        {msg.sender === "AI" ? <div dangerouslySetInnerHTML={{ __html: msg.text }} /> : msg.text}
                                    </Box>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Paper elevation={0} sx={{ p: '4px 12px', display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '16px', bgcolor: '#fcfcfc' }}>
                            <TextField
                                fullWidth
                                variant="standard"
                                placeholder="Ask something..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                InputProps={{ disableUnderline: true }}
                                sx={{ ml: 1, flex: 1 }}
                            />
                            <IconButton type="submit" disabled={!userInput.trim()} sx={{ color: '#05B913' }}>
                                <FaPaperPlane size={18} />
                            </IconButton>
                        </Paper>
                    </form>
                </Box>
            </Paper>
            <ToastContainer />
        </div>
    );
};

export default GeminiChat;