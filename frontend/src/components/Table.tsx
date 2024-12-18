import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Box,
  TableContainer,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Category, Expense } from "../types";

export default function BasicTable({
  expenses,
  categories,
  title,
}: {
  expenses: Expense[] | null;
  categories: Category[] | null;
  title: string;
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
    <Box>
      <Typography fontSize={20} fontWeight={"600"} marginBottom={"1rem"}>
        {title}
      </Typography>
      <TableContainer
        component={Box}
        sx={{
          margin: "auto",
          width: "100%",
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
    </Box>
  );
}
