import { useEffect, useState } from 'react';
import { Account } from './components';
import NavTabs from './NavTabs';
import { Outlet, useNavigate } from 'react-router-dom';
import { Category, Expense, User, History as MonthlyHistory } from './types';
import apiService from './api/apiService';

export default function Layout() {
    const [user, setUser] = useState<User | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [expenses, setExpenses] = useState<Expense[] | null>(null); // State for fetched data
    const [history, setHistory] = useState<MonthlyHistory[] | null>(null);
    const [errors, setErrors] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setErrors(null);
            try {
                // Fetch all data
                const [userData, categoriesData, expensesData, historyData] = await Promise.all([
                    apiService.getUserData(),
                    apiService.getCategoriesData(),
                    apiService.getExpensesData(),
                    apiService.getHistoryData()
                ]);

                if ((!userData || "error" in userData) || (!categoriesData || "error" in categoriesData) || (!expensesData || "error" in expensesData) || (!historyData || "error" in historyData)) {
                    setErrors("Failed to fetch data.");
                    navigate("/login");
                    return;
                }
                
                setUser(userData);
                setCategories(categoriesData);
                setExpenses(expensesData);
                setHistory(historyData);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setErrors("Something went wrong while fetching data. Please try again later.");
                setLoading(false);
                return;
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ paddingBottom: '5rem'}}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 4rem 1rem 4rem', marginBottom: '3rem', background: '#1E2A38', gap: '1rem' }}>
                <Account user={user} setUser={setUser} />
                <NavTabs />
            </div>
            <Outlet context={{ categories, setCategories, expenses, setExpenses, history, setHistory }} />
        </div>
    );
}