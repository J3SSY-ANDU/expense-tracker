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
  UpdateExpenseName,
  UpdateExpenseAmount,
  UpdateExpenseCategory,
  UpdateExpenseDate,
  UpdateExpenseNotes,
  FetchHistoryData,
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
}: {
  user: User | null;
  expenses: Expense[] | null;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
  categories: Category[] | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
  setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
  mode: ExpenseTableModeValues;
  title: string;
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

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Regular expression to allow numbers with up to 2 decimal places
    if (/^\d*(\.\d{0,2})?$/.test(inputValue)) {
      setNewExpenseAmount(inputValue);
    }
  };

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

  const handleChangeExpenseName = async () => {
    if (!selectedExpense) return;

    const currentExpense = expenses?.find(
      (expense) => expense.id === selectedExpense.id
    );

    if (currentExpense && currentExpense.name === selectedExpense.name) {
      console.log("No changes detected in name.");
      return;
    }
    const updatedExpense = await UpdateExpenseName(
      selectedExpense.id,
      selectedExpense.name
    );
    if (updatedExpense) {
      setExpenses((prev) => {
        return prev
          ? prev.map((expense) =>
            expense.id === selectedExpense.id ? updatedExpense : expense
          )
          : null;
      });

      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
      console.log("Name updated successfully.");
    } else {
      console.log("Failed to update name.");
    }
  };

  const handleExpenseAmountChange = async () => {
    if (!selectedExpense) return;

    const currentExpense = expenses?.find(
      (expense) => expense.id === selectedExpense.id
    );

    if (currentExpense && currentExpense.amount === selectedExpense.amount) {
      console.log("No changes detected in amount.");
      return;
    }

    const updatedExpense = await UpdateExpenseAmount(
      selectedExpense.id,
      Number(selectedExpense.amount)
    );
    if (updatedExpense) {
      setExpenses((prev) => {
        return prev
          ? prev.map((expense) =>
            expense.id === selectedExpense.id ? updatedExpense : expense
          )
          : null;
      });

      setCategories((prev) => {
        if (!prev) return prev;
        const category = prev.find(
          (category) => category.id === selectedExpense.category_id
        );
        if (!category) return prev;
        category.total_expenses = (
          Number(category.total_expenses) -
          Number(currentExpense?.amount) +
          Number(updatedExpense.amount)
        ).toFixed(2);
        return prev;
      });

      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
      console.log("Amount updated successfully.");
    } else {
      console.log("Failed to update amount.");
    }
  };

  const handleChangeCategory = async (newCategoryId: string) => {
    if (!selectedExpense) return;

    const sameCategory = selectedExpense?.category_id === newCategoryId;

    if (sameCategory) {
      console.log("No changes detected in category.");
      return;
    }

    console.log(`selectedCategory: ${newCategoryId}`);
    if (!newCategoryId) return;
    const updatedExpense = await UpdateExpenseCategory(
      selectedExpense.id,
      newCategoryId
    );
    if (updatedExpense) {
      setCategories((prev) => {
        if (!prev) return prev;
        const oldCategory = prev.find(
          (category) => category.id === selectedExpense.category_id
        );
        if (!oldCategory) return prev;
        oldCategory.total_expenses = (
          Number(oldCategory.total_expenses) - Number(selectedExpense.amount)
        ).toFixed(2);
        const newCategory = prev.find(
          (category) => category.id === newCategoryId
        );
        if (!newCategory) return prev;
        newCategory.total_expenses = (
          Number(newCategory.total_expenses) + Number(selectedExpense.amount)
        ).toFixed(2);

        setExpenses((prev) => {
          return prev
            ? prev.map((expense) =>
              expense.id === selectedExpense.id ? updatedExpense : expense
            )
            : null;
        });
        return prev;
      });

      setSelectedExpense(updatedExpense);
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
      console.log("Category updated successfully.");
    } else {
      console.log("Failed to update category.");
    }
  };

  const handleChangeDate = async (newDate: Dayjs | null) => {
    if (!selectedExpense) return;

    const currentExpense = expenses?.find(
      (expense) => expense.id === selectedExpense.id
    );

    const formatedDate: string = newDate
      ? formatDateToYYYYMMDD(newDate.toDate())
      : "";

    if (
      currentExpense &&
      formatDateToYYYYMMDD(new Date(currentExpense.date)) === formatedDate
    ) {
      console.log("No changes detected in date.");
      return;
    }

    const updatedExpense = await UpdateExpenseDate(
      selectedExpense.id,
      formatedDate
    );
    if (updatedExpense) {
      if (
        new Date(updatedExpense.date).getMonth() + 1 !==
        new Date().getMonth() + 1 &&
        new Date(updatedExpense.date).getFullYear() !== new Date().getFullYear()
      ) {
        FetchHistoryData()
          .then((data) => {
            setHistory(data);
            setExpenses((prev) =>
              prev
                ? prev.filter((expense) => expense.id !== updatedExpense.id)
                : null
            );
            setCategories((prev) => {
              if (!prev) return prev;
              const category = prev.find(
                (category) => category.id === updatedExpense.category_id
              );
              if (!category) return prev;
              category.total_expenses = (
                Number(category.total_expenses) - Number(updatedExpense?.amount)
              ).toFixed(2);
              return prev;
            });
            setCreatingExpense(false);
            setNewExpense(false);
          })
          .catch(() => {
            setCreatingExpense(false);
          });
        return;
      }

      setExpenses((prev) => {
        return prev
          ? prev.map((expense) =>
            expense.id === selectedExpense.id ? updatedExpense : expense
          )
          : null;
      });

      setSelectedExpense(updatedExpense);
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
      console.log("Date updated successfully.");
    } else {
      console.log("Failed to update date.");
    }
  };

  const handleChangeNotes = async () => {
    if (!selectedExpense) return;

    const currentExpense = expenses?.find(
      (expense) => expense.id === selectedExpense.id
    );

    if (currentExpense && currentExpense.notes === selectedExpense.notes) {
      console.log("No changes detected in notes.");
      return;
    }

    const updatedExpense = await UpdateExpenseNotes(
      selectedExpense.id,
      selectedExpense.notes
    );
    if (updatedExpense) {
      setExpenses((prev) => {
        return prev
          ? prev.map((expense) =>
            expense.id === selectedExpense.id ? updatedExpense : expense
          )
          : null;
      });

      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
      console.log("Notes updated successfully.");
    } else {
      console.log("Failed to update notes.");
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    const isDeleted = await DeleteExpense(selectedExpense.id);
    if (isDeleted) {
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
        handleAmountChange={handleAmountChange}
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
        handleExpenseAmountChange={handleExpenseAmountChange}
        handleChangeCategory={handleChangeCategory}
        handleChangeDate={handleChangeDate}
        handleChangeNotes={handleChangeNotes}
        handleDeleteExpense={handleDeleteExpense}
        handleChangeExpenseName={handleChangeExpenseName}
      />
    </Box>
  );
}
