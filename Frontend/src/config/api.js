const API_CONFIG = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",

  aiUrl:
    import.meta.env.VITE_API_URL ||
    `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/ai/chat`,
};

export const API_ENDPOINTS = {
  auth: {
    login: `${API_CONFIG.backendUrl}/api/auth/login`,
    register: `${API_CONFIG.backendUrl}/api/auth/register`,
  },
  ai: {
    chat: API_CONFIG.aiUrl,
  },
  notes: {
    addNote: `${API_CONFIG.backendUrl}/api/notes/add-note`,
    myNotes: `${API_CONFIG.backendUrl}/api/notes/my-notes`,
    deleteNote: (id) => `${API_CONFIG.backendUrl}/api/notes/delete-note/${id}`,
  },
};

export default API_CONFIG;
