const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path'); // Ajouté pour servir les fichiers statiques
const dotenv = require('dotenv');

// Charger le .env depuis le bon chemin
const envPath = path.join(__dirname, '..', '.env'); // Ajustez le nombre de .. selon votre structure
dotenv.config({ path: envPath });

const app = express();
const prisma = new PrismaClient();

// Configuration pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));
app.use(express.json());

const WORKSPACE_ID = 'cm33gys530001u5b3bej29tqe';
const API_BASE_URL = 'http://127.0.0.1:8000';

app.post('/api/chat', async (req, res) => {
    console.log('\n=== Nouveau message reçu ===');
    const { message, chatAgentTaskId } = req.body;
    console.log('Message:', message);
    console.log('ChatAgentTaskId:', chatAgentTaskId);

    if (!message || !chatAgentTaskId) {
        console.error('❌ Données manquantes');
        return res.status(400).json({ error: "Message et chatAgentTaskId requis" });
    }

    try {
        const chatTask = await prisma.chatAgentTask.findUnique({
            where: { id: chatAgentTaskId }
        });

        if (!chatTask) {
            console.error('❌ Session de chat non trouvée:', chatAgentTaskId);
            throw new Error('Session de chat non trouvée');
        }
        console.log('✅ Session de chat trouvée');

        // Sauvegarder le message utilisateur
        await prisma.message.create({
            data: {
                messageSender: 'USER',
                content: message,
                chatAgentTaskId,
            }
        });
        console.log('✅ Message utilisateur enregistré');

        let botResponse;
        try {
            console.log('Appel de l\'API externe...');
            // Utilisation du bon endpoint
            const response = await axios.get(`${API_BASE_URL}/chat_bot/${chatAgentTaskId}`, {
                params: {
                    message: message
                }
            });
            console.log('Réponse API brute:', response.data);
            
            // Extraire la réponse en fonction de la structure de votre API
            botResponse = response.data.answer || response.data.content || "Pas de réponse du bot";
            console.log('✅ Réponse API reçue:', botResponse);
        } catch (error) {
            console.error('❌ Erreur API externe:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            botResponse = "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.";
        }

        // Sauvegarder la réponse du bot
        await prisma.message.create({
            data: {
                messageSender: 'BOT',
                content: botResponse,
                chatAgentTaskId
            }
        });
        console.log('✅ Réponse du bot enregistrée');

        res.json({ 
            answer: botResponse, 
            sources: []
        });
    } catch (error) {
        console.error('❌ Erreur de traitement:', error);
        res.status(500).json({ 
            error: "Erreur lors du traitement du message",
            details: error.message 
        });
    }
});

app.post('/api/start-chat', async (req, res) => {
    console.log('\n=== Démarrage d\'une nouvelle session de chat ===');
    
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: WORKSPACE_ID },
            include: {
                projects: { take: 1 },
                workspaceUsers: { 
                    take: 1,
                    include: { user: true }
                }
            }
        });

        if (!workspace) {
            console.error('❌ Workspace non trouvé:', WORKSPACE_ID);
            throw new Error('Workspace non trouvé');
        }
        console.log('✅ Workspace trouvé:', workspace.name);

        const project = workspace.projects[0];
        if (!project) {
            console.error('❌ Aucun projet dans le workspace');
            throw new Error('Aucun projet trouvé dans ce workspace');
        }
        console.log('✅ Projet sélectionné:', project.name);

        const workspaceUser = workspace.workspaceUsers[0];
        if (!workspaceUser?.user) {
            console.error('❌ Aucun utilisateur dans le workspace');
            throw new Error('Aucun utilisateur trouvé dans ce workspace');
        }
        console.log('✅ Utilisateur sélectionné:', workspaceUser.user.email);

        // Créer la tâche de chat
        const chatAgentTask = await prisma.chatAgentTask.create({
            data: {
                id: uuidv4(),
                name: `Chat Session ${new Date().toISOString()}`,
                workspaceId: WORKSPACE_ID,
                projectId: project.id,
                userId: workspaceUser.user.id,
                messages: {
                    create: {
                        messageSender: 'BOT',
                        content: 'Bonjour 👋\nComment puis-je vous aider aujourd\'hui?'
                    }
                }
            }
        });

        console.log('✅ ChatAgentTask créé avec succès:', chatAgentTask.id);
        res.json({ chatAgentTaskId: chatAgentTask.id });
    } catch (error) {
        console.error('❌ Erreur détaillée:', error);
        res.status(500).json({ 
            error: "Erreur lors de la création de la session",
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n=== Démarrage du serveur ===');
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`✅ API externe: ${API_BASE_URL}`);
    console.log(`✅ Workspace: ${WORKSPACE_ID}`);
});