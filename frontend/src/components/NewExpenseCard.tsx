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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Category } from "../types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

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
              onChange={(e) => setNewExpenseName(e.target.value)}
            />
            <FormControl fullWidth variant="filled" sx={{ marginTop: "1rem" }}>
              <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
              <FilledInput
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                id="filled-adornment-amount"
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <FormControl fullWidth>
              <InputLabel id="category">Select Category</InputLabel>
              <Select
                fullWidth
                labelId="category"
                id="category"
                variant="outlined"
                value={selectedCategory?.id || ""}
                label="Select Category"
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedCat = categories?.find((cat) => cat.id === selectedId) || null;
                  setSelectedCategory(selectedCat);
                }}
              >
                {categories?.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
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
                maxDate={dayjs()}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
          <TextField
            label="Note"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newExpenseNotes}
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
            }}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleSave}
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
