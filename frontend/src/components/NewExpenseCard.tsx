import {
  Backdrop,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FilledInput,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Category } from "../types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { NumericFormat } from 'react-number-format';
import { useState } from "react";
import { MuiIconPicker } from "./MuiIconPicker";

export function NewExpenseCard({
  newExpense,
  setNewExpense,
  newExpenseName,
  setNewExpenseName,
  newExpenseAmount,
  setNewExpenseAmount,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedDate,
  setSelectedDate,
  newExpenseNotes,
  setNewExpenseNotes,
  handleSave,
  creatingExpense,
}: {
  newExpense: boolean;
  setNewExpense: React.Dispatch<React.SetStateAction<boolean>>;
  newExpenseName: string;
  setNewExpenseName: React.Dispatch<React.SetStateAction<string>>;
  newExpenseAmount: string;
  setNewExpenseAmount: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: Category | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  categories: Category[] | null;
  selectedDate: Dayjs | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  newExpenseNotes: string;
  setNewExpenseNotes: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  creatingExpense: boolean;
}) {
  const [errors, setErrors] = useState({
    name: "",
    amount: "",
    category: "",
    date: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", amount: "", category: "", date: "" };

    if (!newExpenseName) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!newExpenseAmount || isNaN(Number(newExpenseAmount)) || Number(newExpenseAmount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
      isValid = false;
    }

    if (!selectedCategory) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    if (!selectedDate) {
      newErrors.date = "Date is required";
      isValid = false;
    }

    if (selectedDate && new Date(selectedDate.toString()) > new Date()) {
      newErrors.date = "Valid date is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  return (
    <Backdrop
      open={newExpense}
      onClick={() => setNewExpense(false)}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Card
        sx={{
          width: "50%",
          padding: '1rem',
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Typography sx={{ width: "100%", fontSize: "2rem", fontWeight: "700", padding: 0, margin: 0 }}>
            New Expense
          </Typography>
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newExpenseName}
              inputProps={{ maxLength: 25 }}
              onChange={(e) => {
                setErrors(prev => ({ ...prev, name: ""}));
                setNewExpenseName(e.target.value)
              }}
              error={!!errors.name}
              helperText={errors.name}
            />
            <FormControl
              fullWidth
              variant="filled"
              error={!!errors.amount}
              sx={{
                marginTop: "1rem",
              }}
            >
              <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
              <NumericFormat
                id="filled-adornment-amount"
                customInput={FilledInput}
                value={newExpenseAmount}
                onValueChange={(values) => {
                  setErrors(prev => ({ ...prev, amount: "" }));
                  setNewExpenseAmount(values.value)
                }}
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
                prefix="$"
                allowNegative={false}
                allowLeadingZeros={false}
                placeholder="0.00"
                required
                error={!!errors.amount}
              />
              {errors.amount && (
                <FormHelperText error>{errors.amount}</FormHelperText>
              )}
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <FormControl
              fullWidth
              error={!!errors.category}
            >
              <InputLabel id="category">Select Category</InputLabel>
              <Select
                fullWidth
                labelId="category"
                id="category"
                variant="outlined"
                value={selectedCategory?.id || ""}
                label="Select Category"
                onChange={(e) => {
                  setErrors(prev => ({ ...prev, category: "" }));
                  const selectedId = e.target.value;
                  const selectedCat = categories?.find((cat) => cat.id === selectedId) || null;
                  setSelectedCategory(selectedCat);
                }}
                renderValue={(selectedId) => {
                const selectedCat = categories?.find(cat => cat.id === selectedId);
                if (!selectedCat) return '';
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MuiIconPicker value={selectedCat.icon} onChange={() => { }} selectedCategory={{ icon: selectedCat.icon }} size={20} />
                    {selectedCat.name}
                  </Box>
                );
              }}
                error={!!errors.category}
              >
                {categories?.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
                    sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <MuiIconPicker value={category.icon} selectedCategory={category} onChange={() => {}} size={20} />
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText error>{errors.category}</FormHelperText>
              )}
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newValue) => {
                  setErrors(prev => ({ ...prev, date: "" }));
                  setSelectedDate(newValue)
                }}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
          <TextField
            label="Note"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newExpenseNotes}
            inputProps={{ maxLength: 100 }}
            onChange={(e) => setNewExpenseNotes(e.target.value)}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: '1rem', marginTop: "5rem", paddingTop: "1rem", borderTop: "1px solid #d3d3d3" }}>
            <Button variant="outlined" color="primary" onClick={() => {
              setNewExpense(false);
              setNewExpenseName("");
              setNewExpenseAmount("");
              setSelectedCategory(null);
              setSelectedDate(null);
              setNewExpenseNotes("");
              setErrors({ name: "", amount: "", category: "", date: "" });
            }}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                if (validateForm()) {
                  handleSave();
                }
              }}
            >
              {creatingExpense ? (
                <CircularProgress size={20} />
              ) : (
                "Save"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Backdrop>
  );
}