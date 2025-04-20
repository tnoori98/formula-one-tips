'use client';

import React, { useState, useEffect } from 'react';
import { TabView, TabPanel, TabViewTabChangeEvent } from 'primereact/tabview';
import { useRouter } from "next/navigation";
import 'primeicons/primeicons.css';
import OverView from '../components/Overview';
import Admin from '../components/Admin';

interface JwtPayload {
    role?: string;
    [key: string]: any;
}

const Navbar: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        const parsed = parseJwt(token);
        if (parsed?.role) {
            setUserRole(parsed.role);
        }
    }, [router]);

    const handleTabChange = (e: TabViewTabChangeEvent) => {
        if (e.index === 2) {
            localStorage.clear();
            router.push('/');
            return;
        }
        setActiveIndex(e.index);
    };

    const parseJwt = (token: string): JwtPayload | null => {
        if (!token) return null;
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(base64));
        } catch (err) {
            console.error("Error parsing JWT:", err);
            return null;
        }
    };

    return (
        <div className="p-6">
            <TabView activeIndex={activeIndex} onTabChange={handleTabChange}>
                <TabPanel header="Mein Bereich">
                    <OverView />
                </TabPanel>
                {userRole === "admin" && (
                    <TabPanel header="Admin Bereich">
                        <Admin />
                    </TabPanel>
                )}
                <TabPanel header="Abmelden" />
            </TabView>
        </div>
    );
};

export default Navbar;