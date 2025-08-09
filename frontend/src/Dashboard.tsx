import { useOutletContext } from "react-router-dom";
import BudgetCard from "./components/BudgetCard";
import { Budget } from "./types";

export default function Dashboard() {
    interface OutletContextType {
        budget: Budget | null;
        setBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
    }

    const { budget, setBudget } = useOutletContext<OutletContextType>();
    if (!budget) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '0 4rem' }}>
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard!</p>
            {/* You can add more components or content here as needed */}
            <BudgetCard budget={budget} setBudget={setBudget} />
        </div>
    )
}