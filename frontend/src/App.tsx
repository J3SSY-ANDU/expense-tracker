import "./App.css";
import React, { useState } from "react";
import { useEffect } from "react";
import BasicTable from "./components/Table";
import { Box, Typography } from "@mui/material";
import { Category, Expense, User } from "./types";
import { useNavigate } from "react-router-dom";
import { fetchCategoriesData, fetchExpensesData, fetchUserData } from "./api";

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
    <Box className="App" sx={{ margin: "2rem 0" }}>
      <Typography fontSize={20} fontWeight={"light"} marginBottom={"1rem"}>
        Hi {user?.firstname}!
      </Typography>
      <Typography fontSize={32} fontWeight={"bold"} marginBottom={"2rem"}>
        Expense Tracker
      </Typography>
      <BasicTable expenses={expenses} categories={categories} />
    </Box>
  );
}
