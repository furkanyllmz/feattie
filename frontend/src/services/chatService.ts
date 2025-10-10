import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Backend API URL'i

export const chatService = {
    sendMessage: async (message: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/chat`, { message });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Diğer API çağrıları buraya eklenebilir
};