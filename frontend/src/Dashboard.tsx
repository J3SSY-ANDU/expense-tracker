import { useOutletContext } from "react-router-dom";
import BudgetCard from "./components/BudgetCard";
import { Budget, Category } from "./types";
import { Grid } from "@mui/material";
import CategoriesBudgetsCard from "./components/CategoriesBudgetsCard";

export default function Dashboard() {
    interface OutletContextType {
        budget: Budget | null;
        setBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
        categories: Category[] | null;
    }

    const { budget, setBudget, categories } = useOutletContext<OutletContextType>();
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
                <Grid item xs={12} sm={6} md={4}>
                    <CategoriesBudgetsCard budget={budget} categories={categories} />
                </Grid>
            </Grid>
        </div>
    )
}