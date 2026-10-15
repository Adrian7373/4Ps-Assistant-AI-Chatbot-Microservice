import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const CHATBOT_API_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:4001';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{ sender: "bot", text: "Hello! May katanungan ba kayo tungkol sa 4Ps Cabanatuan City?" }]);
    const hasWokenServer = useRef(false);

    // Stores the exact format Gemini requires for context memory
    const [geminiHistory, setGeminiHistory] = useState([]);

    useEffect(() => {
        if (hasWokenServer.current) return;

        hasWokenServer.current = true;
        axios.get(`${CHATBOT_API_URL}/health`).catch((error) => {
            console.error('Unable to wake the chatbot service:', error);
        });
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        setInput("");

        // Update UI immediately for responsiveness
        setMessages(prev => [...prev, { sender: "user", text: userText }]);

        const userHistoryItem = { role: "user", parts: [{ text: userText }] };

        try {
            const res = await axios.post(`${CHATBOT_API_URL}/api/chat`, {
                message: userText,
                history: geminiHistory
            });

            const botReply = res.data.reply;
            const botHistoryItem = { role: "model", parts: [{ text: botReply }] };

            // Update UI with bot response
            setMessages(prev => [...prev, { sender: "bot", text: botReply }]);

            // Append both user and bot messages to the conversation memory
            setGeminiHistory(prev => [...prev, userHistoryItem, botHistoryItem]);

        } catch (error) {
            setMessages(prev => [...prev, { sender: "bot", text: "Network error connecting to the AI service." }]);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 font-sans">
            {isOpen ? (
                <div className="w-80 h-96 bg-[#171717] border border-neutral-800 rounded-lg shadow-2xl flex flex-col text-neutral-200">
                    <div className="bg-[#1C1C1E] border-b border-neutral-800 text-neutral-300 p-3 flex justify-between items-center rounded-t-lg">
                        <strong>4Ps Cabanatuan Assistant</strong>
                        <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">✕</button>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto bg-[#171717] flex flex-col gap-3 scrollbar-thin">
                        {messages.map((msg, index) => (
                            <div key={index} className={`p-2.5 rounded-lg text-sm max-w-[85%] leading-relaxed ${msg.sender === "user" ? "bg-neutral-700 text-white self-end rounded-br-none" : "bg-[#1C1C1E] border border-neutral-800 text-neutral-300 self-start rounded-bl-none"}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="p-2 border-t border-neutral-800 flex bg-[#1C1C1E] rounded-b-lg">
                        <input
                            type="text"
                            className="flex-1 p-2 bg-[#171717] text-neutral-200 border border-neutral-700 rounded-l-md outline-none focus:border-neutral-500 placeholder-neutral-500 text-sm transition-colors"
                            placeholder="Type a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-r-md text-sm transition-colors">Send</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 p-4 rounded-full shadow-lg transition-colors flex items-center gap-2 font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    Ask 4Ps AI
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget;