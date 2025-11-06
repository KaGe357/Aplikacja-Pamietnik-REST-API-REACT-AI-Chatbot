const AUTH_TOKEN_KEY = "auth_token";

export const authStorage = {
  setToken: (token) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      }
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  },

  getToken: () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem(AUTH_TOKEN_KEY);
      }
      return null;
    } catch (error) {
      console.error("Failed to retrieve token:", error);
      return null;
    }
  },

  removeToken: () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  },
};
