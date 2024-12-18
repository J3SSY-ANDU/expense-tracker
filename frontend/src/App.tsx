import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Category, Expense, User } from "./types";
import { useNavigate } from "react-router-dom";
import { fetchCategoriesData, fetchExpensesData, fetchUserData } from "./api";
import { Categories, ExpensesTable } from "./components";
import expense_tracker from "./expense-tracker.svg";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null); // State for fetched data
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await fetchUserData();
      if (!userData) {
        navigate("/login");
        return;
      }
      setUser(userData);
      setLoading(false);

      const categoriesData = await fetchCategoriesData();
      setCategories(categoriesData);

      const expensesData = await fetchExpensesData();
      setExpenses(expensesData);
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      className="App"
      sx={{
        padding: "2rem 10rem",
        display: "flex",
        flexDirection: "column",
        gap: "3rem",
      }}
    >
      <Box
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
      </Box>
      <Box
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
      </Box>
      <Categories categories={categories} />
      <ExpensesTable
        expenses={expenses}
        categories={categories}
        title={"Monthly Expenses"}
      />
    </Box>
  );
}
