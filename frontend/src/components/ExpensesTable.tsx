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
  Card,
  CardContent,
  TextField,
  Backdrop,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FilledInput,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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

export function ExpensesTable({
  user,
  expenses,
  setExpenses,
  categories,
  setCategories,
  setHistory,
  title,
}: {
  user: User | null;
  expenses: Expense[] | null;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
  categories: Category[] | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
  setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [newExpenseNotes, setNewExpenseNotes] = useState<string>("");
  const [openExpense, setOpenExpense] = useState<boolean>(false); // State for backdrop
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null); // State for selected expense

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
      category_id: selectedCategory,
      date: selectedDate
        ? formatDateToYYYYMMDD(selectedDate.toDate())
        : formatDateToYYYYMMDD(new Date()),
      notes: newExpenseNotes,
    };

    try {
      const createdExpense = await CreateExpense(newExpenseData);
      console.log("Created Expense:", createdExpense);

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
        FetchHistoryData()
          .then((data) => {
            setHistory(data);
            setExpenses((prev) => (prev ? prev : []));
            setCategories((prev) => (prev ? prev : []));
            setCreatingExpense(false);
            setNewExpense(false);
          })
          .catch(() => {
            setCreatingExpense(false);
          });
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
      <Backdrop open={newExpense} onClick={() => setNewExpense(false)}>
        <Card
          sx={{
            width: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
            />
            <FormControl fullWidth variant="filled">
              <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
              <FilledInput
                value={newExpenseAmount}
                onChange={handleAmountChange}
                id="filled-adornment-amount"
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="category">Select Category</InputLabel>
              <Select
                fullWidth
                labelId="category"
                id="category"
                variant="outlined"
                value={selectedCategory}
                label="Select Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories?.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <TextField
              label="Notes"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newExpenseNotes}
              onChange={(e) => setNewExpenseNotes(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleSave}>
              {creatingExpense ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                "Save"
              )}
            </Button>
          </CardContent>
        </Card>
      </Backdrop>
      <Backdrop open={openExpense} onClick={() => setOpenExpense(false)}>
        <Card
          sx={{
            width: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent>
            <input
              type="text"
              title="name"
              value={selectedExpense?.name}
              onChange={(e) =>
                setSelectedExpense((prev) => {
                  if (prev) {
                    return { ...prev, name: e.target.value };
                  } else {
                    return null;
                  }
                })
              }
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleChangeExpenseName();
                }
              }}
            />
            <input
              type="text"
              title="amount"
              value={selectedExpense?.amount}
              onChange={(e) => {
                setSelectedExpense((prev) => {
                  if (prev) {
                    return { ...prev, amount: e.target.value };
                  } else {
                    return null;
                  }
                });
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleExpenseAmountChange();
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="new-category">Select Category</InputLabel>
              <Select
                fullWidth
                labelId="new-category"
                id="new-category"
                variant="outlined"
                value={selectedCategory}
                label="Select Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories?.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
                    onClick={() => {
                      handleChangeCategory(category.id);
                    }}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  handleChangeDate(newValue);
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <input
              type="text"
              title="notes"
              value={selectedExpense?.notes}
              onChange={(e) =>
                setSelectedExpense((prev) => {
                  if (prev) {
                    return { ...prev, notes: e.target.value };
                  } else {
                    return null;
                  }
                })
              }
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleChangeNotes();
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleDeleteExpense}
            >
              Delete
            </Button>
          </CardContent>
        </Card>
      </Backdrop>
    </Box>
  );
}
