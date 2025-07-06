import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Box,
  TableContainer,
  Typography,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  Category,
  Expense,
  User,
  NewExpense,
  History as MonthlyHistory,
} from "../types";
import { Dayjs } from "dayjs";
import {
  CreateExpense,
  DeleteExpense,
  UpdateExpense,
} from "../api";
import { ExpenseCard } from "./ExpenseCard";
import { NewExpenseCard } from "./NewExpenseCard";

type ExpenseTableModeValues = "monthly" | "history" | "category";
export function ExpensesTable({
  user,
  expenses,
  setExpenses,
  categories,
  setCategories,
  setHistory,
  mode,
  title,
  handleDeleteExpenseByCategory, // keep in props for now, but will only use if mode === "category"
}: {
  user: User | null;
  expenses: Expense[] | null;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
  categories: Category[] | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
  setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
  mode: ExpenseTableModeValues;
  title: string;
  handleDeleteExpenseByCategory?: (expenseId: string) => void;
}) {
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [categoriesNames, setCategoriesNames] = useState<{
    [key: string]: string;
  }>({});
  const [newExpense, setNewExpense] = useState<boolean>(false); // State for new expense
  const [creatingExpense, setCreatingExpense] = useState<boolean>(false);
  const [newExpenseName, setNewExpenseName] = useState<string>("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [newExpenseNotes, setNewExpenseNotes] = useState<string>("");
  const [openExpense, setOpenExpense] = useState<boolean>(false); // State for backdrop
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null); // State for selected expense
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false); // State for delete category dialog
  const [saveLoading, setSaveLoading] = useState<boolean>(false); // State for save loading

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

  function formatDateToYYYYMMDD(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const handleSave = async () => {
    setCreatingExpense(true);
    if (!user) {
      console.error("User not found");
      setNewExpense(false);
      return;
    }

    const newExpenseData: NewExpense = {
      name: newExpenseName,
      user_id: user.id,
      amount: Number(newExpenseAmount),
      category_id: selectedCategory ? selectedCategory.id : "",
      date: selectedDate
        ? formatDateToYYYYMMDD(selectedDate.toDate())
        : formatDateToYYYYMMDD(new Date()),
      notes: newExpenseNotes,
    };

    try {
      const createdExpense = await CreateExpense(newExpenseData);

      if (!createdExpense) {
        console.error("Error creating expense");
        setCreatingExpense(false);
        return;
      }

      const month = new Date(createdExpense.date).getMonth() + 1;
      const year = new Date(createdExpense.date).getFullYear();

      if (
        month !== new Date().getMonth() + 1 ||
        year !== new Date().getFullYear()
      ) {
        setHistory((prev) => {
          if (!prev) return prev;
          const existingHistoryIndex = prev.findIndex(
            (history) => history.month === month && history.year === year
          );
          const cat: Category | undefined = categories?.find(c => c.id === createdExpense.category_id);
          const usedCategory: Category = cat
            ? { ...cat, total_expenses: createdExpense.amount }
            : {
              id: createdExpense.category_id,
              user_id: user?.id || "",
              name: selectedCategory?.name || "Uncategorized",
              total_expenses: createdExpense.amount,
              description: "",
              order: 0,
            };

          if (existingHistoryIndex !== -1) {
            // Copy the existing history object (do NOT mutate directly!)
            const oldHistory = prev[existingHistoryIndex];

            // Create new arrays for expenses and categories
            const newExpenses = [createdExpense, ...oldHistory.expenses];

            // Find if the category already exists in this history
            const categoryIndex = oldHistory.categories.findIndex(
              (category) => category.id === createdExpense.category_id
            );

            let newCategories: Category[];
            if (categoryIndex !== -1) {
              // Update the category's total_expenses in a new array
              newCategories = oldHistory.categories.map((catObj, idx) =>
                idx === categoryIndex
                  ? {
                    ...catObj,
                    total_expenses: (
                      Number(catObj.total_expenses) + Number(createdExpense.amount)
                    ).toFixed(2),
                  }
                  : catObj
              );
              console.log("newCategories", newCategories);
              console.log("newExpenses", newExpenses);
            } else {
              // Add the usedCategory to the front of the array
              newCategories = [usedCategory, ...oldHistory.categories];
              console.log("newCategories", newCategories);
              console.log("newExpenses", newExpenses);
            }

            // Build a new MonthlyHistory object
            const newHistory: MonthlyHistory = {
              ...oldHistory,
              expenses: newExpenses,
              total_expenses: Number(oldHistory.total_expenses) + Number(createdExpense.amount),
              categories: newCategories,
            };

            console.log("newHistory", newHistory);

            setCreatingExpense(false);
            setNewExpense(false);
            setNewExpenseName("");
            setNewExpenseAmount("");
            setSelectedCategory(null);
            setSelectedDate(null);
            setNewExpenseNotes("");
            // Return a new array with the updated history at the same index
            return prev.map((h, i) => (i === existingHistoryIndex ? newHistory : h));
          }

          // No history for this month/year: create one with only the selected category and new expense
          const newHistory: MonthlyHistory = {
            id: crypto.randomUUID(),
            name: new Date(year, month - 1).toLocaleString("default", {
              month: "long",
            }),
            user_id: user?.id || "",
            month,
            year,
            total_expenses: Number(createdExpense.amount),
            expenses: [createdExpense],
            categories: [usedCategory],
          };

          console.log("newHistory", newHistory);

          setCreatingExpense(false);
          setNewExpense(false);
          setNewExpenseName("");
          setNewExpenseAmount("");
          setSelectedCategory(null);
          setSelectedDate(null);
          setNewExpenseNotes("");
          return [newHistory, ...prev];
        });
        setCreatingExpense(false);
        setNewExpense(false);
        return;
      }
      setExpenses((prev) =>
        prev ? [createdExpense, ...prev] : [createdExpense]
      );
      setCategories((prev) => {
        if (!prev) return prev;
        const category = prev.find(
          (category) => category.id === createdExpense.category_id
        );
        if (!category) return prev;
        category.total_expenses = (
          Number(createdExpense.amount) + Number(category.total_expenses)
        ).toFixed(2);
        return prev;
      });

      setCreatingExpense(false);
      setNewExpense(false);
      setNewExpenseName("");
      setNewExpenseAmount("");
      setSelectedCategory(null);
      setSelectedDate(null);
      setNewExpenseNotes("");
    } catch (err) {
      console.error(`Error creating expense ${err}`);
      setCreatingExpense(false);
    }
  };

  const handleExpenseUpdate = async (updatedExpense: Expense, oldExpense: Expense) => {
    if (!updatedExpense) return;
    try {
      const updated = await UpdateExpense(updatedExpense);
      if (updated && "error" in updated) {
        console.error(`Error updating expense: ${updated.error}`);
        // Add any additional error handling here if needed


        setSaveLoading(false);
        return;
      }
      setExpenses((prev) =>
        prev ? prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)) : null
      );
      setCategories((prev) => {
        if (!prev) return prev;
        // If category didn't change, update only that category's total_expenses
        if (oldExpense?.category_id === updatedExpense.category_id) {
          return prev.map((category) =>
            category.id === updatedExpense.category_id
              ? {
                ...category,
                total_expenses: (
                  Number(category.total_expenses) -
                  Number(oldExpense?.amount || 0) +
                  Number(updatedExpense.amount)
                ).toFixed(2),
              }
              : category
          );
        } else {
          // Category changed: update both old and new categories
          return prev.map((category) => {
            if (category.id === oldExpense?.category_id) {
              // Subtract from old category
              return {
                ...category,
                total_expenses: (
                  Number(category.total_expenses) -
                  Number(oldExpense?.amount || 0)
                ).toFixed(2),
              };
            }
            if (category.id === updatedExpense.category_id) {
              // Add to new category
              return {
                ...category,
                total_expenses: (
                  Number(category.total_expenses) +
                  Number(updatedExpense.amount)
                ).toFixed(2),
              };
            }
            return category;
          });
        }
      });

      

      

      setSaveLoading(false);
      setOpenExpense(false);
    } catch (err) {
      console.error(`Error updating expense ${err}`);
    }
  }

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    const isDeleted = await DeleteExpense(selectedExpense.id);
    if (isDeleted) {
      // If mode is "category", call the handleDeleteExpenseByCategory function
      // to update the expenses in the parent component
      if (mode === "category" && handleDeleteExpenseByCategory) {
        handleDeleteExpenseByCategory(selectedExpense.id);
      }

      const month = new Date(selectedExpense.date).getMonth() + 1;
      const year = new Date(selectedExpense.date).getFullYear();

      if (month !== new Date().getMonth() + 1 || year !== new Date().getFullYear()) {
        setHistory((prev) => {
          if (!prev) return prev;
          // Find the MonthlyHistory for this month/year
          const historyIndex = prev.findIndex(
            (history) => history.month === month && history.year === year
          );
          if (historyIndex === -1) return prev;

          const oldHistory = prev[historyIndex];

          // Remove the expense from the expenses array
          const newExpenses = oldHistory.expenses.filter(
            (expense) => expense.id !== selectedExpense.id
          );

          // Update the category's total_expenses
          const newCategories = oldHistory.categories.map((cat) =>
            cat.id === selectedExpense.category_id
              ? {
                ...cat,
                total_expenses: (
                  Number(cat.total_expenses) - Number(selectedExpense.amount)
                ).toFixed(2),
              }
              : cat
          );

          // Remove category if its total_expenses becomes 0
          const filteredCategories = newCategories.filter(
            (cat) => Number(cat.total_expenses) > 0
          );

          // Update total_expenses for the month
          const newTotalExpenses =
            Number(oldHistory.total_expenses) - Number(selectedExpense.amount);

          const newHistory: MonthlyHistory = {
            ...oldHistory,
            expenses: newExpenses,
            categories: filteredCategories,
            total_expenses: newTotalExpenses,
          };

          // If there are no expenses left, remove the history entry
          if (newExpenses.length === 0) {
            return prev.filter((_, idx) => idx !== historyIndex);
          }

          // Otherwise, update the history entry
          return prev.map((h, i) => (i === historyIndex ? newHistory : h));
        });
      }
      setExpenses((prev) => {
        return prev
          ? prev.filter((expense) => expense.id !== selectedExpense.id)
          : null;
      });
      setCategories((prev) => {
        if (!prev) return prev;
        const category = prev.find(
          (category) => category.id === selectedExpense?.category_id
        );
        if (!category) return prev;
        category.total_expenses = (
          Number(category.total_expenses) - Number(selectedExpense.amount)
        ).toFixed(2);
        return prev;
      });

      setSelectedExpense(null);
      setOpenExpense(false);
    }
  };

  return (
    <Box>
      {mode === "monthly" && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={"1rem"}
        >
          <Typography fontSize={20} fontWeight={"600"}>
            {title}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setNewExpense(true)}
          >
            New Expense
          </Button>
        </Box>
      )}
      <TableContainer component={Box}>
        <Table sx={{ margin: "auto", width: "100%", minWidth: "700px" }}>
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
              <TableRow
                key={expense.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  setOpenExpense(true);
                  setSelectedExpense(expense);
                }}
              >
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
      <NewExpenseCard
        newExpense={newExpense}
        setNewExpense={setNewExpense}
        newExpenseName={newExpenseName}
        setNewExpenseName={setNewExpenseName}
        newExpenseAmount={newExpenseAmount}
        setNewExpenseAmount={setNewExpenseAmount}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        newExpenseNotes={newExpenseNotes}
        setNewExpenseNotes={setNewExpenseNotes}
        handleSave={handleSave}
        creatingExpense={creatingExpense}
      />
      <ExpenseCard
        openExpense={openExpense}
        setOpenExpense={setOpenExpense}
        selectedExpense={selectedExpense}
        setSelectedExpense={setSelectedExpense}
        setShowDeleteDialog={setShowDeleteDialog}
        categories={categories}
        showDeleteDialog={showDeleteDialog}
        handleDeleteExpense={handleDeleteExpense}
        handleExpenseUpdate={handleExpenseUpdate}
        saveLoading={saveLoading}
        setSaveLoading={setSaveLoading}
      />
    </Box>
  );
}
