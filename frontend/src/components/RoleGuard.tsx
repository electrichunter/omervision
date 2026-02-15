"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface RoleGuardProps {
    children: React.ReactNode;
    minRole: number; // 1=Admin, 4=Reader. Access if userRole <= minRole (smaller ID = higher priv)
}

export default function RoleGuard({ children, minRole }: RoleGuardProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Gerçek uygulamada burada backend'den "me" endpoint'i çağrılır
        // Şimdilik cookie'den veya mock data'dan alıyoruz

        // MOCK: Her zaman Admin (1) gibi davranıyoruz test için
        const userRole = 1;

        if (userRole <= minRole) {
            setAuthorized(true);
        } else {
            router.push("/unauthorized"); // veya login
        }
    }, [minRole, router]);

    if (!authorized) {
        return <div className="p-10 text-center text-slate-500">Yetki kontrolü yapılıyor...</div>;
    }

    return <>{children}</>;
}
