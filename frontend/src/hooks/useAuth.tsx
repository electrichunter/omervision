"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: string) => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const u = await api.getCurrentUser();
            setUser(u);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        async function initAuth() {
            try {
                await refreshUser();
            } finally {
                setLoading(false);
            }
        }
        initAuth();
    }, []);

    const login = async (credentials: any) => {
        setLoading(true);
        try {
            const res: any = await api.login(credentials);
            if (res.status === 'mfa_required') {
                throw new Error('mfa_required');
            }
            await refreshUser();
        } catch (e) {
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch {
        }
        setUser(null);
    };

    const hasRole = (role: string) => {
        return user?.roles?.includes(role) || false;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole, refreshUser }}>
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
