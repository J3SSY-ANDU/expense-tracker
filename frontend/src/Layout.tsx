import { useEffect, useState } from 'react';
import { Account } from './components';
import NavTabs from './NavTabs';
import { Outlet, useNavigate } from 'react-router-dom';
import { User } from './types';
import apiService from './api/apiService';

export default function Layout() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const userData: User | { error: string } = await apiService.getUserData();
                if ((!userData || "error" in userData)) {
                    setUser(null);
                    navigate("/login");
                    return;
                } 
                setUser(userData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setLoading(false);
                return;
            }
        };
        fetchUser();
    }, [navigate]);

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 4rem 1rem 4rem', marginBottom: '3rem' }}>
                <Account user={user} setUser={setUser} />
                <NavTabs />
            </div>
            <Outlet />
        </div>
    );
}