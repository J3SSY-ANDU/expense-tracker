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
  ExampleExpense,
  NewExpense,
  History as MonthlyHistory,
} from "../types";
import { Dayjs } from "dayjs";
import apiService from "../api/apiService";
import { ExpenseCard } from "./ExpenseCard";
import { NewExpenseCard } from "./NewExpenseCard";
import Tooltip from '@mui/material/Tooltip';

export const exampleExpenses: ExampleExpense[] = [
  {
    name: "Grocery Shopping",
    amount: "54.99",
    category_name: "Food & Groceries",
    date: new Date("07/01/2025"),
    notes: "Weekly groceries at supermarket",
  },
  {
    name: "Electricity Bill",
    amount: "82.50",
    category_name: "Bills & Utilities",
    date: new Date("07/02/2025"),
    notes: "Monthly power bill",
  },
  {
    name: "Netflix Subscription",
    amount: "15.99",
    category_name: "Entertainment",
    date: new Date("07/05/2025"),
    notes: "Streaming service",
  },
  {
    name: "Bus Pass",
    amount: "40.00",
    category_name: "Transportation",
    date: new Date("07/01/2025"),
    notes: "Monthly city bus pass",
  },
  {
    name: "Gym Membership",
    amount: "29.99",
    category_name: "Health & Fitness",
    date: new Date("07/10/2025"),
    notes: "Fitness club fee",
  },
  {
    name: "Lunch at Cafe",
    amount: "12.75",
    category_name: "Food & Groceries",
    date: new Date("07/21/2025"),
    notes: "Sandwich and coffee",
  },
  {
    name: "Movie Night",
    amount: "18.00",
    category_name: "Entertainment",
    date: new Date("07/12/2025"),
    notes: "Cinema ticket",
  },
  {
    name: "Water Bill",
    amount: "23.60",
    category_name: "Bills & Utilities",
    date: new Date("07/07/2025"),
    notes: "Monthly water service",
  },
  {
    name: "School Supplies",
    amount: "37.20",
    category_name: "Education",
    date: new Date("07/09/2025"),
    notes: "Notebooks and pens",
  },
  {
    name: "Taxi Ride",
    amount: "16.50",
    category_name: "Transportation",
    date: new Date("07/18/2025"),
    notes: "Airport to home",
  },
];

type ExpenseTableModeValues = "monthly" | "history" | "category";
export function ExpensesTable({
  expenses,
  setExpenses,
  categories,
  setCategories,
  setHistory,
  mode,
  title,
  handleDeleteExpenseByCategory, // keep in props for now, but will only use if mode === "category"
  handleUpdateData, // Optional prop for updating history
}: {
  expenses: Expense[] | null;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
  categories: Category[] | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
  setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
  mode: ExpenseTableModeValues;
  title: string;
  handleDeleteExpenseByCategory?: (expenseId: string) => void;
  handleUpdateData: (updatedExpense: Expense) => Promise<void>; // Optional prop for updating history
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
  const [exampleExpense, setExampleExpense] = useState<ExampleExpense | null>(null);
  const [total, setTotal] = useState<number>(0);

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
      setExampleExpense(null);
      setLoading(false);
    }

    if (expenses?.length === 0) {
      setExampleExpense(exampleExpenses[Math.floor(Math.random() * exampleExpenses.length)]);
    }
  }, [categories, expenses]);

  function formatDateToYYYYMMDD(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const handleSave = async () => {
    setCreatingExpense(true);

    const newExpenseData: NewExpense = {
      name: newExpenseName,
      amount: Number(newExpenseAmount),
      category_id: selectedCategory ? selectedCategory.id : "",
      date: selectedDate
        ? formatDateToYYYYMMDD(selectedDate.toDate())
        : formatDateToYYYYMMDD(new Date()),
      notes: newExpenseNotes,
    };

    try {
      const createdExpense = await apiService.createExpense(newExpenseData);

      if (!createdExpense || "error" in createdExpense) {
        console.error("Error creating expense");
        // Add any additional error handling here if needed

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
              name: selectedCategory?.name || "Uncategorized",
              total_expenses: createdExpense.amount,
              description: "",
              order: 0,
              icon: selectedCategory?.icon || "", // Provide a default or fallback icon
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

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    const isDeleted: void | { error: string } = await apiService.deleteExpense(selectedExpense.id);
    if (isDeleted && "error" in isDeleted) {
      console.error(`Error deleting expense: ${isDeleted.error}`);
      return;
    }
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
  };

  function truncateText(text: string, maxLength: number) {
    if (text && text.length <= maxLength) return text;
    return text ? text.slice(0, maxLength) + '…' : '';
  }

  useEffect(() => {
    if (mode === 'category') return;
    // Only recalculate total if expenses changed
    if (expenses && expenses.length > 0) {
      let totalExpenses = 0;
      for (let i = 0; i < expenses.length; i++) {
        totalExpenses += Number(expenses[i].amount) || 0;
      }
      setTotal(totalExpenses);
    } else {
      setTotal(0);
    }
  }, [expenses, mode]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
        <Table sx={{ margin: "auto", width: "100%" }}>
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
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 100,
                  }}
                >
                  <Typography fontSize={14}>{truncateText(expense?.name, 20)}</Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Typography sx={{ fontSize: 14 }}>${expense?.amount}</Typography></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Typography sx={{ fontSize: 14 }}>{truncateText(categoriesNames[expense?.category_id], 20)}</Typography></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Typography sx={{ fontSize: 14 }}>{new Date(expense.date).toLocaleDateString()}</Typography>
                </TableCell>
                <TableCell sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 200
                }}><Typography sx={{ fontSize: 14 }}>{truncateText(expense?.notes, 20)}</Typography></TableCell>
              </TableRow>
            ))}
            {exampleExpense && (
              <Tooltip title="This is just an example expense">
                <TableRow
                  key={exampleExpense.name}
                  sx={{
                    fontStyle: "italic", color: "#6B7A90", opacity: 0.8,
                  }}
                >
                  <TableCell
                    sx={{
                      display: "flex",
                      gap: "3rem",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#6B7A90"
                    }}
                  >
                    {exampleExpense.name}
                  </TableCell>
                  <TableCell sx={{ color: "#6B7A90" }}>${exampleExpense.amount}</TableCell>
                  <TableCell sx={{ color: "#6B7A90" }}>{exampleExpense.category_name}</TableCell>
                  <TableCell sx={{ color: "#6B7A90" }}>
                    {new Date(exampleExpense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ color: "#6B7A90" }}>{exampleExpense.notes}</TableCell>
                </TableRow>
              </Tooltip>
            )}
            {total > 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ borderBottom: "none" }}>
                    <Typography variant="body2" sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: "bold" }}>Total:</span>
                      <span>${total}</span>
                    </Typography>
                </TableCell>
              </TableRow>
            )}
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
        handleUpdateData={handleUpdateData}
        saveLoading={saveLoading}
        setSaveLoading={setSaveLoading}
      />
    </Box>
  );
}
