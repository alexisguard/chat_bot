const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path'); // Ajouté pour servir les fichiers statiques
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const cors = require('cors');

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
app.use(require('compression')());
app.use(cors({
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
    headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    }
}));

const WORKSPACE_ID = 'cm37fd130003jekcahrm77lug';
const USER_ID = 'cm33gppy60008p9ku5qo7r5mh';
const WORKSPACE_USER_ID = 'cm37fd130003kekcavq9424hy';
const PROJECT_ID = 'cm37fs66b0043ekcapdjkg7kx';
const API_BASE_URL = 'http://127.0.0.1:8000';

// app.post('/api/chat', async (req, res) => {
//     console.log('\n=== Nouveau message reçu ===');
//     const { message, chatAgentTaskId } = req.body;
//     console.log('Message:', message);
//     console.log('ChatAgentTaskId:', chatAgentTaskId);

//     if (!message || !chatAgentTaskId) {
//         console.error('❌ Données manquantes');
//         return res.status(400).json({ error: "Message et chatAgentTaskId requis" });
//     }

//     try {
//         const chatTask = await prisma.chatAgentTask.findUnique({
//             where: { id: chatAgentTaskId }
//         });

//         if (!chatTask) {
//             console.error('❌ Session de chat non trouvée:', chatAgentTaskId);
//             throw new Error('Session de chat non trouvée');
//         }
//         console.log('✅ Session de chat trouvée');

//         // Sauvegarder le message utilisateur
//         await prisma.message.create({
//             data: {
//                 messageSender: 'USER',
//                 content: message,
//                 chatAgentTaskId,
//             }
//         });
//         console.log('✅ Message utilisateur enregistré');

//         let botResponse;
//         try {
//             console.log('Appel de l\'API externe...');
//             // Utilisation du bon endpoint
//             const response = await axios.get(`${API_BASE_URL}/chat_bot/${chatAgentTaskId}`, {
//                 params: {
//                     message: message
//                 }
//             });
//             console.log('Réponse API brute:', response.data);
            
//             // Extraire la réponse en fonction de la structure de votre API
//             botResponse = response.data.answer || response.data.content || "Pas de réponse du bot";
//             console.log('✅ Réponse API reçue:', botResponse);
//         } catch (error) {
//             console.error('❌ Erreur API externe:', {
//                 status: error.response?.status,
//                 data: error.response?.data,
//                 message: error.message
//             });
//             botResponse = "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.";
//         }

//         // Sauvegarder la réponse du bot
//         await prisma.message.create({
//             data: {
//                 messageSender: 'BOT',
//                 content: botResponse,
//                 chatAgentTaskId
//             }
//         });
//         console.log('✅ Réponse du bot enregistrée');

//         res.json({ 
//             answer: botResponse, 
//             sources: []
//         });
//     } catch (error) {
//         console.error('❌ Erreur de traitement:', error);
//         res.status(500).json({ 
//             error: "Erreur lors du traitement du message",
//             details: error.message 
//         });
//     }
// });

app.post('/api/start-chat', async (req, res) => {
    console.log('\n=== Démarrage d\'une nouvelle session de chat ===');
    
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: WORKSPACE_ID },
            include: {
                projects: { where: { id: PROJECT_ID } },
                workspaceUsers: { 
                    where: { id: WORKSPACE_USER_ID },
                    include: { user: true }
                }
            }
        });

        if (!workspace) {
            console.error('❌ Workspace non trouvé:', WORKSPACE_ID);
            throw new Error('Workspace non trouvé');
        }
        console.log('✅ Workspace trouvé:', workspace.name);

        const project = await prisma.project.findUnique({
            where: { id: PROJECT_ID }
        });
        if (!project) {
            console.error('❌ Projet non trouvé dans ce workspace');
            throw new Error('Projet non trouvé dans ce workspace');
        }
        console.log('✅ Projet sélectionné:', project.name);

        const workspaceUser = await prisma.workspaceUser.findUnique({
            where: { id: WORKSPACE_USER_ID },
			include: { user: true }
        });
		if (!workspaceUser) {
            console.error('❌ Utilisateur non trouvé dans ce workspace');
            throw new Error('Utilisateur non trouvé dans ce workspace');
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

app.get('/api/chat/:chatAgentTaskId', async (req, res) => {
    try {
        const { chatAgentTaskId } = req.params;
        const message = req.query.message;

        console.log('Début du streaming pour le message:', message);

		await prisma.message.create({
			data: {
				messageSender: 'USER',
				content: message,
				chatAgentTaskId
			}
		});
		console.log('✅ Message utilisateur enregistré');

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const apiUrl = `${API_BASE_URL}/chat_bot/${chatAgentTaskId}`;
        console.log('Appel API:', apiUrl);

		let fullResponse = '';

		const response = await axios.get(apiUrl, {
			responseType: 'stream',
			headers: {
				'Accept': 'text/plain'
			}
		});
		
		response.data.on('data', chunk => {
			const decodedChunk = new TextDecoder().decode(chunk);
			console.log('Chunk reçu:', decodedChunk);
			
			if (decodedChunk.trim()) {
				res.write(decodedChunk);
				if (res.flush && typeof res.flush === 'function') {
					res.flush();
				}
				fullResponse += decodedChunk;
			}
		});
		
        await new Promise((resolve, reject) => {
            response.data.on('end', async () => {
                try {
                    // Sauvegarder la réponse du bot
                    if (fullResponse.trim()) {
                        await prisma.message.create({
                            data: {
                                messageSender: 'BOT',
                                content: fullResponse,
                                chatAgentTaskId
                            }
                        });
                        console.log('✅ Réponse du bot enregistrée');
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
            response.data.on('error', reject);
        });

        res.end();
    } catch (error) {
        console.error('Erreur streaming:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n=== Démarrage du serveur ===');
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`✅ API externe: ${API_BASE_URL}`);
    console.log(`✅ Workspace: ${WORKSPACE_ID}`);
});