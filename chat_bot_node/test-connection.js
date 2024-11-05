const path = require('path');
const dotenv = require('dotenv');

// Charger le .env depuis le bon chemin
const envPath = path.join(__dirname, '..', '.env'); // Ajustez le nombre de .. selon votre structure
dotenv.config({ path: envPath });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('URL de la base de données:', process.env.DATABASE_URL);
        await prisma.$connect();
        console.log('✅ Connexion à la base de données réussie');
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();