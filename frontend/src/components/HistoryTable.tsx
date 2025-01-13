import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
} from "@mui/material";
import { Category, Expense } from "../types";
import { useEffect, useState } from "react";

export function HistoryTable({
  expenses,
  categories,
}: {
  expenses: Expense[] | null;
  categories: Category[] | null;
}) {
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
    }
  }, [categories, expenses]);

  return (
    <Box>
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
              <TableRow key={expense.id} hover>
                <TableCell
                  sx={{
                    display: "flex",
                    gap: "3rem",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>{expense.name}</Typography>
                </TableCell>
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
