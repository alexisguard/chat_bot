// client.js

async function fetchChatStream(chatAgentTaskId) {
  try {
    const response = await fetch(`/api/chat/${chatAgentTaskId}`, {
      headers: {
        'Authorization': `Bearer ${yourAuthToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Traitement de chaque chunk reçu
      const chunk = textDecoder.decode(value);
      // Mise à jour de l'interface utilisateur avec le nouveau texte
      updateUI(chunk);
    }

  } catch (error) {
    console.error('Erreur:', error);
  }
}

function updateUI(newText) {
  // Logique pour mettre à jour l'interface utilisateur
  // Par exemple, ajouter le texte à un élément DOM
} 