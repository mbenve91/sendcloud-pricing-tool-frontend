import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        email: string;
        _id: string;
    };
    token: string;
}

class AuthService {
    private static instance: AuthService;
    private token: string | null = null;

    private constructor() {
        this.token = Cookies.get('token') || null;
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);
            const { token, user } = response.data;
            
            this.setToken(token);
            return { token, user };
        } catch (error) {
            throw new Error('Invalid login credentials');
        }
    }

    public logout(): void {
        this.token = null;
        Cookies.remove('token');
    }

    public getToken(): string | null {
        return this.token;
    }

    private setToken(token: string): void {
        this.token = token;
        Cookies.set('token', token, { expires: 1 }); // Expires in 1 day
    }

    public isAuthenticated(): boolean {
        return !!this.token;
    }
}

export const authService = AuthService.getInstance(); 