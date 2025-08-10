import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Budget, Category, Expense, History as MonthlyHistory } from "./types";
import { useOutletContext } from "react-router-dom";
import { Categories, ExpensesTable, History } from "./components";
// import expense_tracker from "./expense-tracker.svg";
import apiService from "./api/apiService";

export default function Expenses() {
  const [updatingDataError, setUpdatingDataError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
      null
    ) // State for selected category

  interface OutletContextType {
    categories: Category[] | null;
    setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
    expenses: Expense[] | null;
    setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
    history: MonthlyHistory[] | null;
    setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
    budget: Budget | null;
    setBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
  }

  const { categories, setCategories, expenses, setExpenses, history, setHistory, budget, setBudget } = useOutletContext<OutletContextType>();

  if (!categories || !expenses || !history || !budget) {
    return <div>Loading...</div>;
  }

  const handleUpdateData = async (updatedExpense: Expense): Promise<void> => {
    if (!updatedExpense) return;
    try {
      const updated = await apiService.updateExpense(updatedExpense);
      if (updated && "error" in updated) {
        console.error(`Error updating expense: ${updated.error}`);
        setUpdatingDataError(`Error updating expense: ${updated.error}`);
        return;
      }
      // Fetch updated data after successful update
      const [expensesData, categoriesData, historyData, budgetData] = await Promise.all([
        apiService.getExpensesData(),
        apiService.getCategoriesData(),
        apiService.getHistoryData(),
        apiService.getBudgetData()
      ]);

      if (
        (!expensesData || "error" in expensesData) ||
        (!categoriesData || "error" in categoriesData) ||
        (!historyData || "error" in historyData) ||
        (!budgetData || "error" in budgetData)
      ) {
        console.error("Failed to fetch updated data.");
        setUpdatingDataError("Failed to fetch updated data.");
        return;
      }
      setExpenses(expensesData);
      setCategories(categoriesData); // This will update category totals in the UI
      setHistory(historyData);
      setBudget(budgetData);
    } catch (error) {
      console.error("Error updating expense:", error);
      setUpdatingDataError("Failed to update expense. Please try again later.");
      return;
    }
  }

  const handleChangeIcon = async (iconName: string) => {
    if (!selectedCategory) return

    setSelectedCategory((prev) => {
      if (prev) {
        return { ...prev, icon: iconName };
      }
      return prev;
    });

    const updatedCategory = await apiService.updateCategoryIcon(
      selectedCategory.id,
      iconName
    )
    if (!updatedCategory || 'error' in updatedCategory) {
      console.error(`Error updating category icon: ${updatedCategory?.error}`)
      // Add any additional error handling here if needed
      return
    }

    setCategories(prev => {
      return prev
        ? prev.map(category =>
          category.id === updatedCategory.id ? updatedCategory : category
        )
        : null
    })
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      activeElement.blur()
    }
    console.log('Icon updated successfully.')
  }

  return (
    <Box
      className="App"
      sx={{
        paddingX: "4rem",
        display: "flex",
        flexDirection: "column",
        gap: "3rem",
      }}
    >
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <Typography fontSize={24}>Hi {user?.firstname},</Typography>
        <Typography fontSize={24}>
          Welcome to my Expense Tracker Project!
        </Typography>
      </Box> */}
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <img
          src={expense_tracker}
          alt="Expense tracker icon"
          width={43}
          height={31}
        />
        <Typography fontSize={32} fontWeight={"bold"}>
          Expense Tracker
        </Typography>
      </Box> */}
      <Categories
        categories={categories}
        setCategories={setCategories}
        expenses={expenses}
        setExpenses={setExpenses}
        setHistory={setHistory}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        handleChangeIcon={handleChangeIcon}
        handleUpdateData={handleUpdateData}
        setBudget={setBudget}
      />
      <ExpensesTable
        expenses={expenses}
        setExpenses={setExpenses}
        categories={categories}
        setCategories={setCategories}
        setHistory={setHistory}
        handleUpdateData={handleUpdateData}
        handleChangeIcon={handleChangeIcon}
        mode="monthly"
        title={"Monthly Expenses"}
        setBudget={setBudget}
      />
      <History history={history} setHistory={setHistory} handleUpdateData={handleUpdateData} handleChangeIcon={handleChangeIcon} setBudget={setBudget} />
    </Box>
  );
}
