import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Box,
  TableContainer,
} from "@mui/material";
import { useState, useEffect } from "react";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category_id: string;
  date: Date;
  notes: string;
}

interface Category {
  id: string;
  user_id: string;
  name: string;
  total_expenses: number;
  description: string;
}

export default function BasicTable({
  expenses,
  categories,
}: {
  expenses: Expense[] | null;
  categories: Category[] | null;
}) {
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [categoriesNames, setCategoriesNames] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (categories && expenses) {
      for (const expense of expenses) {
        const category = categories.find(
          (category) => category.id === expense.category_id
        );
        if (category) {
          setCategoriesNames((prev) => ({
            ...prev,
            [expense.category_id]: category.name,
          }));
        }
      }
      setLoading(false);
    }
  }, [categories, expenses]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <TableContainer
      component={Box}
      sx={{
        margin: "auto",
        width: "70%",
        borderRadius: "4px",
        minWidth: "700px",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>NAME</TableCell>
            <TableCell>AMOUNT</TableCell>
            <TableCell>CATEGORY</TableCell>
            <TableCell>DATE</TableCell>
            <TableCell>NOTES</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses?.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{expense.name}</TableCell>
              <TableCell>${expense.amount}</TableCell>
              <TableCell>{categoriesNames[expense.category_id]}</TableCell>
              <TableCell>
                {new Date(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{expense.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
