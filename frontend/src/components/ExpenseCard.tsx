import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FilledInput,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Category, Expense } from "../types";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

export function ExpenseCard({
  openExpense,
  setOpenExpense,
  selectedExpense,
  setSelectedExpense,
  setShowDeleteDialog,
  categories,
  showDeleteDialog,
  handleDeleteExpense,
  handleUpdateData,
  saveLoading = false,
  setSaveLoading,
}: {
  openExpense: boolean;
  setOpenExpense: React.Dispatch<React.SetStateAction<boolean>>;
  selectedExpense: Expense | null;
  setSelectedExpense: React.Dispatch<React.SetStateAction<Expense | null>>;
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[] | null;
  showDeleteDialog: boolean;
  handleDeleteExpense: () => void;
  handleUpdateData: (updatedExpense: Expense) => Promise<void>;
  saveLoading: boolean;
  setSaveLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [updatedName, setUpdatedName] = useState<string | null>(null);
  const [updatedAmount, setUpdatedAmount] = useState<string | null>(null);
  const [updatedCategory, setUpdatedCategory] = useState<string | null>(null);
  const [updatedDate, setUpdatedDate] = useState<Dayjs | null>(null);
  const [updatedNotes, setUpdatedNotes] = useState<string | null>(null);

  return (
    <Backdrop
      open={openExpense}
      onClick={() => {
        setUpdatedName(null);
        setUpdatedAmount(null);
        setUpdatedCategory(null);
        setUpdatedDate(null);
        setUpdatedNotes(null);
        setOpenExpense(false);
      }}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Card
        sx={{
          width: "50%",
          padding: "1rem",
          overflow: "auto",
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
            }}
          >
            <input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUpdatedName(e.target.value);
              }}
              style={{
                all: "unset",
                width: "100%",
                fontSize: "2rem",
                fontWeight: "700",
              }}
              value={updatedName !== null ? updatedName : selectedExpense?.name || ""}
              title="name"
              placeholder="Add name..."
            />
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
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <FormControl fullWidth variant="filled" sx={{ marginTop: "1rem" }}>
              <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
              <FilledInput
                value={updatedAmount !== null ? updatedAmount : selectedExpense?.amount || ""}
                onChange={(e) => setUpdatedAmount(e.target.value)}
                id="filled-adornment-amount"
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
          </Box>
          <FormControl fullWidth>
            <InputLabel id="new-category">Select Category</InputLabel>
            <Select
              fullWidth
              labelId="new-category"
              id="new-category"
              variant="outlined"
              value={updatedCategory !== null ? updatedCategory : selectedExpense?.category_id || ""}
              label="Select Category"
              onChange={(e) => setUpdatedCategory(e.target.value)}
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
          <Box sx={{ marginBottom: "-1rem" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={updatedDate !== null ? updatedDate : (selectedExpense && selectedExpense.date ? dayjs(selectedExpense.date) : null)}
                onChange={(newValue) => {
                  setUpdatedDate(newValue);
                }}
                maxDate={dayjs()}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <TextField
              label="Note"
              variant="outlined"
              fullWidth
              margin="normal"
              value={updatedNotes !== null ? updatedNotes : selectedExpense?.notes || ""}
              onChange={(e) => setUpdatedNotes(e.target.value)}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "right", gap: "1rem", borderTop: "1px solid #d3d3d3", marginTop: "4rem", paddingTop: "1rem" }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={async () => {
                setUpdatedName(null);
                setUpdatedAmount(null);
                setUpdatedCategory(null);
                setUpdatedDate(null);
                setUpdatedNotes(null);
                setOpenExpense(false);
              }}>Cancel</Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={async () => {
                setSaveLoading(true);
                if (!selectedExpense) return;
                const oldExpense = selectedExpense;
                const updated = {
                  ...oldExpense,
                  name: updatedName || oldExpense.name,
                  amount: updatedAmount || oldExpense.amount,
                  category_id: updatedCategory || oldExpense.category_id,
                  date: updatedDate ? updatedDate.toDate() : oldExpense.date,
                  notes: updatedNotes || oldExpense.notes,
                };
                setUpdatedName(null);
                setUpdatedAmount(null);
                setUpdatedCategory(null);
                setUpdatedDate(null);
                setUpdatedNotes(null);
                setSelectedExpense(updated);
                await handleUpdateData(updated);
                setSaveLoading(false);
                setOpenExpense(false);
              }}
            >
              {saveLoading ? <CircularProgress size={16} /> : "Save"}
            </Button>
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
