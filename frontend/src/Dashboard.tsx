import { useOutletContext } from "react-router-dom";
import BudgetCard from "./components/BudgetCard";
import { Budget, Category, Expense, NewExpense, History as MonthlyHistory } from "./types";
import { Grid } from "@mui/material";
import CategoriesBudgetsCard from "./components/CategoriesBudgetsCard";
import { NewExpenseCard } from "./components";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import apiService from "./api/apiService";
import MonthlyExpensesCard from "./components/MonthlyExpensesCard";
import CategoryBudgetExpensesCard from "./components/CategoryBudgetExpensesCard";

/**
 * Dashboard component for the expense tracker application.
 *
 * This component displays the main dashboard, including budget overview, category budgets,
 * monthly expenses, and the ability to add new expenses. It manages state for new expense creation,
 * interacts with the API to persist new expenses, and updates local state for budgets, categories,
 * expenses, and monthly history accordingly.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered dashboard UI.
 *
 * @remarks
 * - Uses context from the parent route to access and update budget, categories, expenses, and history.
 * - Handles creation of new expenses and updates all relevant state slices.
 * - Displays loading state if budget data is not yet available.
 */
export default function Dashboard() {
    const [newExpense, setNewExpense] = useState<boolean>(false); // You can use this to show/hide the card, or just set true always
    const [newExpenseName, setNewExpenseName] = useState<string>("");
    const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [newExpenseNotes, setNewExpenseNotes] = useState<string>("");
    const [creatingExpense, setCreatingExpense] = useState<boolean>(false);

    interface OutletContextType {
        budget: Budget | null;
        setBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
        categories: Category[] | null;
        setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
        expenses: Expense[] | null;
        setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
        setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
    }

    const { budget, setBudget, categories, setCategories, expenses, setExpenses, setHistory } = useOutletContext<OutletContextType>();

    function formatDateToYYYYMMDD(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const handleSave = async () => {
        setCreatingExpense(true);

        const newExpenseData: NewExpense = {
            name: newExpenseName,
            amount: Number(newExpenseAmount),
            category_id: selectedCategory ? selectedCategory.id : "",
            date: selectedDate
                ? formatDateToYYYYMMDD(selectedDate.toDate())
                : formatDateToYYYYMMDD(new Date()),
            notes: newExpenseNotes,
        };

        try {
            const createdExpense = await apiService.createExpense(newExpenseData);

            if (!createdExpense || "error" in createdExpense) {
                console.error("Error creating expense");
                // Add any additional error handling here if needed

                setCreatingExpense(false);
                return;
            }

            const month = new Date(createdExpense.date).getMonth() + 1;
            const year = new Date(createdExpense.date).getFullYear();

            if (
                month !== new Date().getMonth() + 1 ||
                year !== new Date().getFullYear()
            ) {
                setHistory((prev) => {
                    if (!prev) return prev;
                    const existingHistoryIndex = prev.findIndex(
                        (history) => history.month === month && history.year === year
                    );
                    const cat: Category | undefined = categories?.find(c => c.id === createdExpense.category_id);
                    const usedCategory: Category = cat
                        ? { ...cat, total_expenses: createdExpense.amount }
                        : {
                            id: createdExpense.category_id,
                            name: selectedCategory?.name || "Uncategorized",
                            budget: selectedCategory?.budget || 0,
                            total_expenses: createdExpense.amount,
                            description: "",
                            order: 0,
                            icon: selectedCategory?.icon || "", // Provide a default or fallback icon
                        };

                    if (existingHistoryIndex !== -1) {
                        // Copy the existing history object (do NOT mutate directly!)
                        const oldHistory = prev[existingHistoryIndex];

                        // Create new arrays for expenses and categories
                        const newExpenses = [createdExpense, ...oldHistory.expenses];

                        // Find if the category already exists in this history
                        const categoryIndex = oldHistory.categories.findIndex(
                            (category) => category.id === createdExpense.category_id
                        );

                        let newCategories: Category[];
                        if (categoryIndex !== -1) {
                            // Update the category's total_expenses in a new array
                            newCategories = oldHistory.categories.map((catObj, idx) =>
                                idx === categoryIndex
                                    ? {
                                        ...catObj,
                                        total_expenses: (
                                            Number(catObj.total_expenses) + Number(createdExpense.amount)
                                        ).toFixed(2),
                                    }
                                    : catObj
                            );
                            console.log("newCategories", newCategories);
                            console.log("newExpenses", newExpenses);
                        } else {
                            // Add the usedCategory to the front of the array
                            newCategories = [usedCategory, ...oldHistory.categories];
                            console.log("newCategories", newCategories);
                            console.log("newExpenses", newExpenses);
                        }

                        // Build a new MonthlyHistory object
                        const newHistory: MonthlyHistory = {
                            ...oldHistory,
                            expenses: newExpenses,
                            total_expenses: Number(oldHistory.total_expenses) + Number(createdExpense.amount),
                            categories: newCategories,
                        };

                        console.log("newHistory", newHistory);

                        setCreatingExpense(false);
                        setNewExpense(false);
                        setNewExpenseName("");
                        setNewExpenseAmount("");
                        setSelectedCategory(null);
                        setSelectedDate(null);
                        setNewExpenseNotes("");
                        // Return a new array with the updated history at the same index
                        return prev.map((h, i) => (i === existingHistoryIndex ? newHistory : h));
                    }

                    // No history for this month/year: create one with only the selected category and new expense
                    const newHistory: MonthlyHistory = {
                        id: crypto.randomUUID(),
                        name: new Date(year, month - 1).toLocaleString("default", {
                            month: "long",
                        }),
                        month,
                        year,
                        total_expenses: Number(createdExpense.amount),
                        expenses: [createdExpense],
                        categories: [usedCategory],
                    };

                    console.log("newHistory", newHistory);

                    setCreatingExpense(false);
                    setNewExpense(false);
                    setNewExpenseName("");
                    setNewExpenseAmount("");
                    setSelectedCategory(null);
                    setSelectedDate(null);
                    setNewExpenseNotes("");
                    return [newHistory, ...prev];
                });
                setCreatingExpense(false);
                setNewExpense(false);
                return;
            }
            setExpenses((prev) =>
                prev ? [createdExpense, ...prev] : [createdExpense]
            );
            setCategories((prev) => {
                if (!prev) return prev;
                const category = prev.find(
                    (category) => category.id === createdExpense.category_id
                );
                if (!category) return prev;
                category.total_expenses = (
                    Number(createdExpense.amount) + Number(category.total_expenses)
                ).toFixed(2);
                return prev;
            });
            setBudget((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    total_expenses: (
                        Number(prev.total_expenses) + Number(createdExpense.amount)
                    ).toFixed(2),
                };
            });;

            setCreatingExpense(false);
            setNewExpense(false);
            setNewExpenseName("");
            setNewExpenseAmount("");
            setSelectedCategory(null);
            setSelectedDate(null);
            setNewExpenseNotes("");
        } catch (err) {
            console.error(`Error creating expense ${err}`);
            setCreatingExpense(false);
        }
    };

    if (!budget) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '0 4rem' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} style={{ display: 'flex' }}>
                    <BudgetCard budget={budget} setBudget={setBudget} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} style={{ display: 'flex' }}>
                    <CategoriesBudgetsCard budget={budget} categories={categories} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} style={{ display: 'flex' }}>
                    <NewExpenseCard
                        newExpense={newExpense}
                        setNewExpense={setNewExpense}
                        newExpenseName={newExpenseName}
                        setNewExpenseName={setNewExpenseName}
                        newExpenseAmount={newExpenseAmount}
                        setNewExpenseAmount={setNewExpenseAmount}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        categories={categories}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        newExpenseNotes={newExpenseNotes}
                        setNewExpenseNotes={setNewExpenseNotes}
                        handleSave={handleSave}
                        creatingExpense={creatingExpense}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={6} style={{ display: 'flex' }}>
                    <MonthlyExpensesCard expenses={expenses} />
                </Grid>
                <Grid item xs={12} sm={6} md={6} style={{ display: 'flex' }}>
                    <CategoryBudgetExpensesCard categories={categories} />
                </Grid>
            </Grid>
        </div>
    )
}