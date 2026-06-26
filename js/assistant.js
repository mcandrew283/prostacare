// js/assistant.js
/**
 * AI Assistant using Custom Webhook.
 */

const WEBHOOK_URL = 'https://markresearch.app.n8n.cloud/webhook/deb8fd48-9f57-442d-9aac-6a22a62072ce';

document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing');
    const sendBtn = document.getElementById('send-btn');

    if (chatForm) {
        chatForm.addEventListener('submit', handleSendMessage);
    }

    function appendMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        // For simple formatting, replace newlines with <br>
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');

        // Insert before typing indicator
        chatMessages.insertBefore(msgDiv, typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleSendMessage(e) {
        e.preventDefault();

        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Append User Message
        appendMessage(text, true);
        chatInput.value = '';

        // Prevent multiple sends
        sendBtn.disabled = true;
        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // 2. Call Webhook
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.text();
            let botReply = responseData;

            // 3. Robust JSON Parsing
            try {
                const jsonObj = JSON.parse(responseData);

                // n8n often returns an array of objects
                const data = Array.isArray(jsonObj) ? jsonObj[0] : jsonObj;

                if (data && typeof data === 'object') {
                    // Try to find the reply in common field names
                    botReply = data.output ||
                        data.response ||
                        data.reply ||
                        data.message ||
                        data.text ||
                        data.content ||
                        (typeof data === 'string' ? data : JSON.stringify(data, null, 2));
                } else if (typeof data === 'string') {
                    botReply = data;
                }
            } catch (e) {
                // If not valid JSON, use the raw response or the default message
                botReply = responseData.trim() || "No response received from the assistant.";
            }

            // 4. Append Bot Message
            appendMessage(botReply);
        } catch (error) {
            console.error("Webhook Error:", error);
            appendMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.");
        } finally {
            typingIndicator.style.display = 'none';
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }
});
