import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ExpensesTable } from "./ExpensesTable";
import { useState } from "react";
import { Category, Expense, User, History as MonthlyHistory } from "../types";

export function CategoryCard({
  newExpensesByCategory,
  setNewExpensesByCategory,
  setExpenses,
  user,
  categories,
  setCategories,
  setHistory,
  selectedCategory,
  setSelectedCategory,
  openCategory,
  setOpenCategory,
  handleChangeName,
  handleChangeDescription,
  handleDeleteCategory,
  handleUpdateData,
}: {
  newExpensesByCategory: Expense[] | null;
  setNewExpensesByCategory: React.Dispatch<
    React.SetStateAction<Expense[] | null>
  >;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
  user: User | null;
  categories: Category[] | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
  setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
  selectedCategory: Category | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  openCategory: boolean;
  setOpenCategory: React.Dispatch<React.SetStateAction<boolean>>;
  handleChangeName: () => Promise<void>;
  handleChangeDescription: () => Promise<void>;
  handleDeleteCategory: () => void;
  handleUpdateData: (updatedExpense: Expense) => Promise<void>;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false); // State for delete category dialog

  // Function to handle deleting an expense by category globally
  const handleDeleteExpenseByCategory = (expenseId: string) => {
    setExpenses((prevExpenses) => {
      if (!prevExpenses) return null;
      const updatedExpenses = prevExpenses.filter(
        (expense) => expense.id !== expenseId
      );
      return updatedExpenses;
    });
  };

  return (
    <Backdrop
      open={openCategory}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      onClick={() => setOpenCategory(false)}
    >
      <Card
        sx={{
          width: "50%",
          height: "75%",
          padding: "1rem",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSelectedCategory((prev) => {
                  if (prev) {
                    return { ...prev, name: e.target.value };
                  } else {
                    return null;
                  }
                })
              }
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleChangeName();
                }
              }}
              onBlur={async () => {
                await handleChangeName();
              }}
              style={{
                all: "unset",
                width: "100%",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
              value={selectedCategory?.name}
              title="name"
              placeholder="Add name..."
            />
            <DeleteIcon
              onClick={() => setShowDeleteDialog(true)}
              color="action"
              sx={{ cursor: "pointer" }}
            />
          </Box>
          <Typography fontSize={16} fontWeight={"400"}>
            Total expenses: ${selectedCategory?.total_expenses}
          </Typography>
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Typography>Description: </Typography>
            <input
              type="text"
              title="description"
              name="description"
              placeholder="Add description..."
              value={selectedCategory?.description || ""}
              onChange={(e) =>
                setSelectedCategory((prev) => {
                  if (prev) {
                    return { ...prev, description: e.target.value };
                  }
                  return prev;
                })
              }
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleChangeDescription();
                }
              }}
              style={{
                all: "unset",
                width: "100%",
                backgroundColor: "#d3d3d3",
                padding: "0.3rem",
                borderRadius: "3px",
              }}
            />
          </Box>
          {newExpensesByCategory && newExpensesByCategory.length > 0 && (
            <ExpensesTable
              user={user}
              expenses={newExpensesByCategory}
              setExpenses={setNewExpensesByCategory}
              handleDeleteExpenseByCategory={
                handleDeleteExpenseByCategory
              }
              categories={categories}
              setCategories={setCategories}
              setHistory={setHistory}
              handleUpdateData={handleUpdateData}
              mode="category"
              title=""
            />
          )}
        </CardContent>
      </Card>
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle id="alert-dialog-title">Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will delete all expenses associated with this category.
            Are you sure you want to delete this category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowDeleteDialog(false);
              handleDeleteCategory();
            }}
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Backdrop>
  );
}
