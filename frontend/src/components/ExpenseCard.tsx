import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Category, Expense } from "../types";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";

export function ExpenseCard({
  openExpense,
  setOpenExpense,
  selectedExpense,
  setSelectedExpense,
  selectedCategory,
  setSelectedCategory,
  setShowDeleteDialog,
  categories,
  selectedDate,
  setSelectedDate,
  showDeleteDialog,
  handleExpenseAmountChange,
  handleChangeCategory,
  handleChangeDate,
  handleChangeNotes,
  handleDeleteExpense,
  handleChangeExpenseName,
}: {
  openExpense: boolean;
  setOpenExpense: React.Dispatch<React.SetStateAction<boolean>>;
  selectedExpense: Expense | null;
  setSelectedExpense: React.Dispatch<React.SetStateAction<Expense | null>>;
  selectedCategory: Category | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[] | null;
  selectedDate: Dayjs | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  showDeleteDialog: boolean;
  handleExpenseAmountChange: () => Promise<void>;
  handleChangeCategory: (id: string) => void;
  handleChangeDate: (newValue: Dayjs | null) => void;
  handleChangeNotes: () => Promise<void>;
  handleDeleteExpense: () => void;
  handleChangeExpenseName: () => Promise<void>;
}) {
  return (
    <Backdrop
      open={openExpense}
      onClick={() => setOpenExpense(false)}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Card
        sx={{
          width: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
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
              onBlur={async () => {
                await handleChangeExpenseName();
              }}
              style={{
                all: "unset",
                width: "100%",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
              value={selectedExpense?.name}
              title="name"
              placeholder="Add name..."
            />
            <DeleteIcon
              onClick={() => setShowDeleteDialog(true)}
              color="action"
              sx={{ cursor: "pointer" }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Typography>Amount: </Typography>
            <input
              type="text"
              title="amount"
              placeholder="Add amount..."
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
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                backgroundColor: "#d3d3d3",
                padding: "0.3rem",
                borderRadius: "3px",
              }}
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel id="new-category">Select Category</InputLabel>
            <Select
              fullWidth
              labelId="new-category"
              id="new-category"
              variant="outlined"
              value={selectedCategory?.id || ""}
              label="Select Category"
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedCat = categories?.find((cat) => cat.id === selectedId) || null;
                setSelectedCategory(selectedCat);
              }}
              size="small"
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
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Typography fontSize={16} fontWeight={"400"}>
              Notes:
            </Typography>
            <input
              type="text"
              title="notes"
              value={selectedExpense?.notes}
              placeholder="Add notes..."
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                backgroundColor: "#d3d3d3",
                padding: "0.3rem",
                borderRadius: "3px",
              }}
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
          </Box>
        </CardContent>
      </Card>
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle id="alert-dialog-title">Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. Are you sure you want to delete this
            expense?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowDeleteDialog(false);
              handleDeleteExpense();
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
