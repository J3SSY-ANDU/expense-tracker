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
  FormHelperText,
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
import { NumericFormat } from 'react-number-format';
import { MuiIconPicker } from "./MuiIconPicker";

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
  handleChangeIcon,
  saveLoading = false,
  setSaveLoading,
  setOpenCategory,
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
  handleChangeIcon: (icon: string) => void;
  saveLoading: boolean;
  setSaveLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenCategory?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [updatedName, setUpdatedName] = useState<string | null>(null);
  const [updatedAmount, setUpdatedAmount] = useState<string | null>(null);
  const [updatedCategory, setUpdatedCategory] = useState<string | null>(null);
  const [updatedDate, setUpdatedDate] = useState<Dayjs | null>(null);
  const [updatedNotes, setUpdatedNotes] = useState<string | null>(null);
  const [errors, setErrors] = useState({ name: "", amount: "", category: "", date: "" });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", amount: "", category: "", date: "" };
    if (!((updatedName !== null ? updatedName : selectedExpense?.name) || "").trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    const amt = updatedAmount !== null ? updatedAmount : selectedExpense?.amount;
    if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) {
      newErrors.amount = "Amount must be a positive number";
      isValid = false;
    }
    if (!((updatedCategory !== null ? updatedCategory : selectedExpense?.category_id) || "")) {
      newErrors.category = "Category is required";
      isValid = false;
    }
    const dt = updatedDate !== null ? updatedDate : (selectedExpense && selectedExpense.date ? dayjs(selectedExpense.date) : null);
    if (!dt) {
      newErrors.date = "Date is required";
      isValid = false;
    }
    if (dt && new Date(dt.toString()) > new Date()) {
      newErrors.date = "Valid date is required";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  return (
    <Backdrop
      open={openExpense}
      onClick={() => {
        setUpdatedName(null);
        setUpdatedAmount(null);
        setUpdatedCategory(null);
        setUpdatedDate(null);
        setUpdatedNotes(null);
        setErrors({ name: "", amount: "", category: "", date: "" });
        setOpenExpense(false);
      }}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Card
        sx={{
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
            <TextField
              variant="standard"
              InputProps={{
              disableUnderline: true,
              style: { fontSize: "2rem", fontWeight: 700, padding: 0, background: "none" },
              }}
              inputProps={{
              style: { fontSize: "2rem", fontWeight: 700, padding: 0, background: "none" },
              maxLength: 25,
              }}
              sx={{
              transition: "background 0.2s",
              borderRadius: "4px",
              "&:hover": {
                background: "#f5f5f5",
              },
              }}
              onChange={(e) => {
              setErrors(prev => ({ ...prev, name: "" }));
              setUpdatedName(e.target.value);
              }}
              value={updatedName !== null ? updatedName : selectedExpense?.name || ""}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              placeholder="Add name..."
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
              padding: "0rem 0.5rem",
              }}
              onClick={() => setShowDeleteDialog(true)}
            >
              <DeleteIcon
              sx={{ fontSize: 20 }}
              color="action"
              />
              <Typography fontWeight={"600"}>
              Delete
              </Typography>
            </Box>
            </Box>
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <FormControl fullWidth variant="filled" error={!!errors.amount} sx={{ marginTop: "1rem" }}>
              <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
              <NumericFormat
                id="filled-adornment-amount"
                customInput={FilledInput}
                value={updatedAmount !== null ? updatedAmount : selectedExpense?.amount}
                onValueChange={(values) => {
                  setErrors(prev => ({ ...prev, amount: "" }));
                  setUpdatedAmount(values.value);
                }}
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
                prefix="$"
                allowNegative={false}
                allowLeadingZeros={false}
                placeholder="0.00"
              />
              {errors.amount && (
                <FormHelperText error>{errors.amount}</FormHelperText>
              )}
            </FormControl>
          </Box>
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel id="new-category">Select Category</InputLabel>
            <Select
              fullWidth
              labelId="new-category"
              id="new-category"
              variant="outlined"
              value={updatedCategory !== null ? updatedCategory : selectedExpense?.category_id || ""}
              label="Select Category"
              onChange={(e) => {
                setErrors(prev => ({ ...prev, category: "" }));
                setUpdatedCategory(e.target.value);
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
                  <MuiIconPicker value={category.icon} onChange={(icon) => {
                    handleChangeIcon(icon);
                  }} selectedCategory={category ? { icon: category.icon } : null} size={20} />
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <FormHelperText error>{errors.category}</FormHelperText>
            )}
          </FormControl>
          <Box sx={{ marginBottom: "-1rem" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={updatedDate !== null ? updatedDate : (selectedExpense && selectedExpense.date ? dayjs(selectedExpense.date) : null)}
                onChange={(newValue) => {
                  setErrors(prev => ({ ...prev, date: "" }));
                  setUpdatedDate(newValue);
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
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <TextField
              label="Note"
              variant="outlined"
              fullWidth
              margin="normal"
              inputProps={{ maxLength: 100}}
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
                setErrors({ name: "", amount: "", category: "", date: "" });
                setOpenExpense(false);
              }}>Cancel</Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={async () => {
                if (!validateForm()) return;
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
                if (setOpenCategory) {
                  setOpenCategory(false);
                }
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