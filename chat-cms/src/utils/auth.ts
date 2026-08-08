const TOKEN_KEY = 'cms_access_token';

export interface AuthPayload {
    iat: number;
    exp: number;
    username: string;
}

function decodePayload(token: string): AuthPayload | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const normalizedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        return JSON.parse(atob(normalizedBase64)) as AuthPayload;
    } catch {
        return null;
    }
}

export const authService = {
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    getPayload(): AuthPayload | null {
        const token = this.getToken();
        return token ? decodePayload(token) : null;
    },

    isAuthenticated(): boolean {
        const payload = this.getPayload();

        if (!payload || payload.exp * 1000 <= Date.now()) {
            this.removeToken();
            return false;
        }

        return true;
    },
};