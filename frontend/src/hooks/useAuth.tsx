"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '@/lib/api';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initAuth() {
            try {
                const u = await api.getCurrentUser();
                setUser(u);
            } catch (e) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        initAuth();
    }, []);

    const login = async (credentials: any) => {
        const res: any = await api.login(credentials);
        if (res.status === 'mfa_required') {
            throw new Error('mfa_required');
        }
        // If login successful, fetch user details immediately
        try {
            const u = await api.getCurrentUser();
            setUser(u);
        } catch (e) {
            console.error('Failed to fetch user after login', e);
        }
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    const hasRole = (role: string) => {
        return user?.roles?.includes(role) || false;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole }
        }>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
