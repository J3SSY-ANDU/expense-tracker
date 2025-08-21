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
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ExpensesTable } from "./ExpensesTable";
import { JSX, useState } from "react";
import { Budget, Category, Expense, History as MonthlyHistory } from "../types";
import { MuiIconPicker } from "./MuiIconPicker";
import { iconMap } from "./icons";
import React from "react";
import { NumericFormat } from "react-number-format";

/**
 * CategoryCard component displays and manages a single expense category, allowing users to:
 * - Edit the category's name, description, icon, and budget.
 * - View total expenses for the category.
 * - Delete the category (with confirmation dialog).
 * - View and manage expenses associated with the category.
 *
 * @param newExpensesByCategory - The list of expenses filtered by the selected category, or null.
 * @param setNewExpensesByCategory - Setter for updating the filtered expenses by category.
 * @param setExpenses - Setter for updating the global list of expenses.
 * @param categories - The list of all categories, or null.
 * @param setCategories - Setter for updating the list of categories.
 * @param setHistory - Setter for updating the monthly history of expenses.
 * @param selectedCategory - The currently selected category, or null.
 * @param setSelectedCategory - Setter for updating the selected category.
 * @param openCategory - Boolean indicating if the category card dialog is open.
 * @param setOpenCategory - Setter for toggling the category card dialog.
 * @param handleChangeName - Async function to handle updating the category name.
 * @param handleChangeDescription - Async function to handle updating the category description.
 * @param handleChangeIcon - Function to handle updating the category icon.
 * @param handleDeleteCategory - Function to handle deleting the category.
 * @param handleUpdateData - Async function to handle updating an expense.
 * @param setBudget - Setter for updating the budget object.
 * @param handleChangeBudget - Async function to handle updating the category budget.
 *
 * @returns The rendered CategoryCard component.
 */
export function CategoryCard({
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
  handleChangeIcon,
  handleDeleteCategory,
  handleUpdateData,
  setBudget,
  handleChangeBudget,
}: {
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
  handleChangeIcon: (iconName: string) => void;
  handleDeleteCategory: () => void;
  handleUpdateData: (updatedExpense: Expense) => Promise<void>;
  setBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
  handleChangeBudget: (budget: number) => Promise<void>;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false); // State for delete category dialog
  const [errors, setErrors] = useState<{ name: string; }>({ name: "" });

  // Validate fields before saving
  const validateFields = () => {
    let valid = true;
    const newErrors = { name: "" };
    if (!selectedCategory?.name || selectedCategory.name.trim() === "") {
      newErrors.name = "Name is required";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

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

  function formatNumberToCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return (
    <Backdrop
      open={openCategory}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      onClick={() => {
        setErrors({ name: "" });
        setOpenCategory(false);
      }}
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
            <MuiIconPicker
              value={selectedCategory?.icon || ""}
              onChange={(icon) => {
                handleChangeIcon(icon);
              }}
              selectedCategory={selectedCategory}
            />
            <Box
              sx={{
                display: "flex",
                gap: "0.3rem",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: "4px",
                transition: "background 0.2s",
                "&:hover": {
                  background: "#f5f5f5",
                },
                padding: "0.5rem",
              }}
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
            <TextField
              variant="standard"
              InputProps={{
                disableUnderline: true,
                style: { fontSize: "2rem", fontWeight: 700, padding: 0, background: "none" },
              }}
              inputProps={{
                style: { fontSize: "2rem", fontWeight: 700, padding: 0, background: "none" },
                maxLength: 50,
              }}
              sx={{
                transition: "background 0.2s",
                borderRadius: "4px",
                "&:hover": { background: "#f5f5f5" },
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setErrors(prev => ({ ...prev, name: "" }));
                setSelectedCategory((prev) => {
                  if (prev) return { ...prev, name: e.target.value };
                  else return null;
                });
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  if (validateFields()) await handleChangeName();
                }
              }}
              onBlur={async () => {
                if (validateFields()) await handleChangeName();
              }}
              value={selectedCategory?.name}
              helperText={errors.name}
              error={!!errors.name}
              title="name"
              fullWidth
              placeholder="Add name..."
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Typography fontSize={16} fontWeight={400} sx={{ width: "auto", whiteSpace: "nowrap" }}>
                Budget:
              </Typography>
              <NumericFormat
                value={selectedCategory?.budget && selectedCategory.budget !== 0 ? selectedCategory.budget : ""}
                thousandSeparator
                prefix="$"
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                customInput={TextField}
                onValueChange={(values) => {
                  const { floatValue } = values;
                  setSelectedCategory((prev) => {
                    if (prev) {
                      return { ...prev, budget: floatValue ?? "" };
                    }
                    return prev;
                  });
                }}
                inputProps={{
                  style: {
                    backgroundColor: "#d3d3d3",
                    padding: "0.3rem",
                    borderRadius: "3px",
                    cursor: "text",
                    flex: 1,
                    border: "none !important",
                  },
                }}
                onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  if (validateFields()) {
                    await handleChangeBudget(Number(selectedCategory?.budget) || 0);
                  }
                }
              }}
                sx={{ width: "100%" }}
                inputMode="decimal"
                title="budget"
                placeholder="$0.00"
                variant="standard"
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Typography fontSize={16} fontWeight={400} sx={{ width: "auto", whiteSpace: "nowrap" }}>
                Total Expenses:
              </Typography>
              <span
                style={{
                  width: "100%",
                  backgroundColor: "#d3d3d3",
                  padding: "0.3rem",
                  borderRadius: "3px",
                  display: "inline-block",
                }}
              >
                {formatNumberToCurrency(Number(selectedCategory?.total_expenses))}
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
                transition: "background 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseOut={e => (e.currentTarget.style.background = "none")}
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
              handleChangeIcon={handleChangeIcon}
              setOpenCategory={setOpenCategory}
              mode="category"
              title=""
              setBudget={setBudget}
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
