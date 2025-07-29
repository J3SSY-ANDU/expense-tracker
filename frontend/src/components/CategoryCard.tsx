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
import { JSX, useState } from "react";
import { Category, Expense, History as MonthlyHistory } from "../types";

export function CategoryCard({
  categoryIcon,
  newExpensesByCategory,
  setNewExpensesByCategory,
  setExpenses,
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
  categoryIcon: (categoryName: string, size?: number) => JSX.Element | null;
  newExpensesByCategory: Expense[] | null;
  setNewExpensesByCategory: React.Dispatch<
    React.SetStateAction<Expense[] | null>
  >;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
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
              marginBottom: "1rem",
            }}
          >
            {categoryIcon(selectedCategory?.name ?? "", 48)}
            <Box sx={{ display: "flex", gap: "0.3rem", alignItems: "center", cursor: "pointer" }}
              onClick={() => setShowDeleteDialog(true)}
            >
              <DeleteIcon
                sx={{ fontSize: 20 }}
                color="action"
              />
              <Typography
                fontWeight={"600"}
              >
                Delete
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography fontSize={16} fontWeight={"400"} sx={{ minWidth: "120px" }}>
                Total expenses
              </Typography>
              <span style={{
                width: "100%",
                backgroundColor: "#d3d3d3",
                padding: "0.3rem",
                borderRadius: "3px",
              }}>${selectedCategory?.total_expenses}
              </span>
            </Box>
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
                color: "#6B7A90",
                width: "100%",
                fontWeight: "400",
                fontStyle: "italic",
                fontSize: "1rem",
                borderRadius: "4px",
                padding: "0.3rem 0.5rem",
                cursor: "text",
                marginBottom: "1rem",
              }}
            />
          </Box>
          {newExpensesByCategory && newExpensesByCategory.length > 0 && (
            <ExpensesTable
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
