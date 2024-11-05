document.addEventListener("DOMContentLoaded", () => {
    console.log("Script démarré");

    // Sélecteurs
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector("#send-btn");

    let userMessage = null;
    let chatAgentTaskId = null;
    const inputInitHeight = chatInput?.scrollHeight || 50;

    // Création d'un message
    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat");
        if (className === "error") {
            chatLi.classList.add("incoming", "error");
        } else {
            chatLi.classList.add(className);
        }
        
        let chatContent = className === "outgoing" 
            ? `<p></p>` 
            : `<span class="material-symbols-outlined">support_agent</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    };

    // Initialisation du chat
    const initializeChat = async () => {
        try {
            const response = await fetch('/api/start-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erreur d\'initialisation du chat');

            const data = await response.json();
            chatAgentTaskId = data.chatAgentTaskId;

            if (chatbox.children.length === 0) {
                const welcomeMessage = createChatLi("Bonjour 👋\nComment puis-je vous aider aujourd'hui?", "incoming");
                chatbox.appendChild(welcomeMessage);
            }
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
            const errorMessage = createChatLi("Erreur de connexion au service.", "error");
            chatbox.appendChild(errorMessage);
        }
    };

    // Gestion des messages
    const handleChat = async () => {
        if (!chatInput) return;
        
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Réinitialiser l'input
        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        // Afficher le message utilisateur
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    chatAgentTaskId: chatAgentTaskId
                })
            });

            if (!response.ok) throw new Error('Erreur de communication');

            const data = await response.json();
            chatbox.appendChild(createChatLi(data.answer, "incoming"));
        } catch (error) {
            console.error('Erreur:', error);
            chatbox.appendChild(createChatLi("Désolé, une erreur s'est produite.", "error"));
        }
        
        chatbox.scrollTo(0, chatbox.scrollHeight);
    };

    // Toggle du chatbot
    const toggleChatbot = () => {
        document.body.classList.toggle("show-chatbot");
        if (!chatAgentTaskId) {
            initializeChat();
        }
    };

    // Écouteurs d'événements
    chatbotToggler.addEventListener("click", toggleChatbot);
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    sendChatBtn.addEventListener("click", handleChat);

    // Gestion du textarea
    chatInput.addEventListener("input", () => {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });
});