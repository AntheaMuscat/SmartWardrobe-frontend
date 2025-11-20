import { useState } from "react";
import { colors } from "../styles/theme";
import Navbar from "../components/Navbar";

function Chatbot() {
   const [messages, setMessages] = useState([
      {
         user: "Luna",
         text: "Hey, I’m Luna 👋 Your personal style assistant. What kind of outfit are you thinking about today?",
      },
   ]);

   const [input, setInput] = useState("");
   const [typing, setTyping] = useState(false);

   const [history, setHistory] = useState([
      { role: "assistant", content: "Hey, I’m Luna 👋 What kind of outfit are you thinking about today?" }
   ]);

   const sendMessage = async () => {
      if (!input.trim()) return;

      const userMsg = { user: "You", text: input };
      setMessages(prev => [...prev, userMsg]);

      
      const newHistory = [
         ...history,
         { role: "user", content: input }
      ];
      setHistory(newHistory);

      const sendHistory = newHistory;

      setInput("");
      setTyping(true);

      try {
         const res = await fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               messages: sendHistory 
            }),
         });

         const data = await res.json();

         const botText = data.reply || "Hmm… I couldn’t think of anything 😅 Try again?";

         const botMsg = { user: "Luna", text: botText };
         setMessages(prev => [...prev, botMsg]);

         
         setHistory(prev => [...prev, { role: "assistant", content: botText }]);

      } catch (err) {
         console.error("Chat error:", err);

         const errorMsg = {
            user: "Luna",
            text: "Oops… something weird happened. Mind asking again? 💫"
         };

         setMessages(prev => [...prev, errorMsg]);

         setHistory(prev => [
            ...prev,
            { role: "assistant", content: errorMsg.text }
         ]);
      }

      setTyping(false);
   };


   const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
      }
   };


   return (
      <>
         <Navbar />
         <div
            style={{
               background: "linear-gradient(135deg, #f3f7fa, #e0edf4)",
               minHeight: "100vh",
               padding: "40px 24px",
               display: "flex",
               justifyContent: "center",
            }}
         >
            <div
               style={{
                  width: "100%",
                  maxWidth: "960px",
                  background: "#ffffff",
                  borderRadius: "24px",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
               }}
            >
               
               <div
                  style={{
                     padding: "20px 24px",
                     borderBottom: "1px solid #e2e8f0",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "space-between",
                     gap: "12px",
                  }}
               >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                     <div
                        style={{
                           width: "40px",
                           height: "40px",
                           borderRadius: "50%",
                           background: colors.primary,
                           display: "flex",
                           alignItems: "center",
                           justifyContent: "center",
                           color: "#fff",
                           fontWeight: 700,
                           fontSize: "1.1rem",
                        }}
                     >
                        L
                     </div>
                     <div>
                        <h1
                           style={{
                              margin: 0,
                              fontSize: "1.4rem",
                              color: colors.primary,
                           }}
                        >
                           Luna · Style Chat
                        </h1>
                        <p
                           style={{
                              margin: 0,
                              fontSize: "0.85rem",
                              color: "#64748b",
                           }}
                        >
                           Ask for outfit ideas, styling tips, or colour combos ✨
                        </p>
                     </div>
                  </div>
                  {typing && (
                     <span
                        style={{
                           fontSize: "0.8rem",
                           color: "#64748b",
                           fontStyle: "italic",
                        }}
                     >
                        Luna is thinking…
                     </span>
                  )}
               </div>

               
               <div
                  style={{
                     flex: 1,
                     padding: "18px 24px",
                     background: "#f8fafc",
                     overflowY: "auto",
                     display: "flex",
                     flexDirection: "column",
                     gap: "10px",
                  }}
               >
                  {messages.map((msg, idx) => {
                     const isUser = msg.user === "You";
                     return (
                        <div
                           key={idx}
                           style={{
                              display: "flex",
                              justifyContent: isUser ? "flex-end" : "flex-start",
                           }}
                        >
                           <div
                              style={{
                                 maxWidth: "75%",
                                 padding: "10px 14px",
                                 borderRadius: isUser
                                    ? "16px 16px 4px 16px"
                                    : "16px 16px 16px 4px",
                                 background: isUser
                                    ? colors.primary
                                    : "#ffffff",
                                 color: isUser ? "#ffffff" : "#0f172a",
                                 boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
                                 fontSize: "0.95rem",
                                 lineHeight: 1.4,
                                 whiteSpace: "pre-wrap",
                              }}
                           >
                              {!isUser && (
                                 <div
                                    style={{
                                       fontSize: "0.75rem",
                                       fontWeight: 600,
                                       marginBottom: "4px",
                                       color: "#64748b",
                                    }}
                                 >
                                    Luna
                                 </div>
                              )}
                              {msg.text}
                           </div>
                        </div>
                     );
                  })}
               </div>

               
               <div
                  style={{
                     borderTop: "1px solid #e2e8f0",
                     padding: "12px 16px",
                     background: "#ffffff",
                     display: "flex",
                     gap: "10px",
                     alignItems: "flex-end",
                  }}
               >
                  <textarea
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={handleKeyDown}
                     placeholder="Ask me anything about outfits, styles, colours..."
                     style={{
                        flex: 1,
                        resize: "none",
                        minHeight: "44px",
                        maxHeight: "120px",
                        borderRadius: "14px",
                        border: "1px solid #cbd5f5",
                        padding: "10px 12px",
                        fontSize: "0.95rem",
                        outline: "none",
                        boxShadow: "0 0 0 0 rgba(56,189,248,0)",
                     }}
                  />
                  <button
                     onClick={sendMessage}
                     disabled={!input.trim()}
                     style={{
                        padding: "10px 18px",
                        borderRadius: "999px",
                        border: "none",
                        background: input.trim() ? colors.primary : "#cbd5f5",
                        color: input.trim() ? "#fff" : "#94a3b8",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        cursor: input.trim() ? "pointer" : "not-allowed",
                        boxShadow: input.trim()
                           ? "0 8px 18px rgba(56,189,248,0.5)"
                           : "none",
                        transition: "transform 0.1s ease, box-shadow 0.1s ease",
                     }}
                  >
                     Send
                  </button>
               </div>
            </div>
         </div>
      </>
   );
}

export default Chatbot;
