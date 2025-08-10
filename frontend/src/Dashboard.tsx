import { useOutletContext } from "react-router-dom";
import BudgetCard from "./components/BudgetCard";
import { Budget } from "./types";
import { Grid } from "@mui/material";

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
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <BudgetCard budget={budget} setBudget={setBudget} />
                </Grid>
                {/* Add more <Grid item> with <BudgetCard> as needed */}
            </Grid>
        </div>
    )
}