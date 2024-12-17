import "./App.css";
import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BasicTable from "./Table";
import { Button, Box, Typography, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface Category {
  id: string;
  user_id: string;
  name: string;
  total_expenses: number;
  description: string;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  category_id: string;
  date: Date;
  notes: string;
}

export default function App() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null); // State for fetched data
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async (): Promise<void> => {
    try {
      const res: Response = await fetch("/logout", {
        method: "GET",
      });
      if (res.status === 200) {
        console.log("Logged out successfully!");
        navigate("/login");
      }
    } catch (err) {
      console.error(`Error fetching the API: ${err}`);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/session-id-exists", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          navigate("/login");
        } else {
          fetchCategoriesData();
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error fetching the API: ${err}`);
      }
    })();

    async function fetchCategoriesData() {
      try {
        const res = await fetch("/all-categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.status === 200) {
          const categoriesData: Category[] = await res.json(); // Make sure that the response is of type Category[]
          setCategories(categoriesData);
          fetchExpensesData();
        }
      } catch (err) {
        console.error(`Error fetching categories data ${err}`);
      }
    }

    async function fetchExpensesData() {
      try {
        const res = await fetch("/all-expenses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.status === 200) {
          const expensesData: Expense[] = await res.json(); // Make sure that the response is of type Expense[]
          setExpenses(expensesData);
        }
      } catch (err) {
        console.error(`Error fetching expenses data ${err}`);
      }
    }
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box className="App" sx={{ margin: "2rem 0" }}>
      <Typography fontSize={32} fontWeight={"bold"} marginBottom={"2rem"}>
        Welcome to my Data File Generator!
      </Typography>
      {/* <TextField label={"Search"} variant="filled" /> */}
      {/* <Button
        sx={{ marginBottom: "2rem" }}
        variant="contained"
        onClick={logout}
      >
        Logout
      </Button> */}
      <BasicTable expenses={expenses} categories={categories} />
    </Box>
  );
}
