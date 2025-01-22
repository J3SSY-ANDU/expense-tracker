import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2,
  Button,
  TextField,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState, useRef, useCallback } from "react";
import { Category, NewCategory, User, Expense } from "../types";
import {
  AddCategory,
  DeleteCategory,
  DeleteExpense,
  UpdateCategoryDescription,
  UpdateCategoryName,
} from "../api";

export function Categories({
  user,
  categories,
  setCategories,
  expenses,
  setExpenses,
}: {
  user: User | null;
  categories: Category[] | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
  expenses: Expense[] | null;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
}) {
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [newCategory, setNewCategory] = useState<boolean>(false); // State for new category
  const [newCategoryName, setNewCategoryName] = useState<string>(""); // State for category name
  const newCategoryRef = useRef<HTMLInputElement | null>(null); // Reference to the new category DOM element
  const [openCategory, setOpenCategory] = useState<boolean>(false); // State for backdrop
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  ); // State for selected category
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false); // State for delete category dialog

  const handleSaveCategory = useCallback(async () => {
    if (!user) {
      return;
    }
    const newCategoryData: NewCategory = {
      name: newCategoryName,
      user_id: user.id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      total_expenses: 0,
      description: "",
    };
    if (newCategoryName) {
      // Save category

      const createdCategory: Category | null = await AddCategory(
        newCategoryData
      );
      if (!createdCategory) {
        return;
      }
      setCategories((prev) => {
        return prev ? [...prev, createdCategory] : [createdCategory];
      });
      setNewCategory(false);
      setNewCategoryName("");
    }
  }, [newCategoryName, user, setCategories]);

  useEffect(() => {
    if (categories) {
      setLoading(false);
    }

    // Handle clicking outside or pressing Enter
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        newCategoryRef.current &&
        !newCategoryRef.current.contains(event.target as Node)
      ) {
        handleSaveCategory();
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSaveCategory();
      }
    };

    if (newCategory) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [categories, newCategory, handleSaveCategory]);

  const handleChangeName = async () => {
    if (!selectedCategory) return;

    const currentCategory = categories?.find(
      (category) => category.id === selectedCategory.id
    );

    // Check if the name has changed
    if (currentCategory && currentCategory.name === selectedCategory.name) {
      console.log("No changes detected in name.");
      return;
    }

    const updatedCategory = await UpdateCategoryName(
      selectedCategory.id,
      selectedCategory.name
    );
    if (updatedCategory) {
      setCategories((prev) => {
        return prev
          ? prev.map((category) =>
              category.id === updatedCategory.id ? updatedCategory : category
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

  const handleChangeDescription = async () => {
    if (!selectedCategory) return;

    const currentCategory = categories?.find(
      (category) => category.id === selectedCategory.id
    );

    // Check if the description has changed
    if (
      currentCategory &&
      currentCategory.description === selectedCategory.description
    ) {
      console.log("No changes detected in description.");
      return;
    }

    const updatedCategory = await UpdateCategoryDescription(
      selectedCategory.id,
      selectedCategory.description
    );
    if (updatedCategory) {
      setCategories((prev) => {
        return prev
          ? prev.map((category) =>
              category.id === updatedCategory.id ? updatedCategory : category
            )
          : null;
      });
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
      console.log("Description updated successfully.");
    } else {
      console.log("Failed to update description.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    if (expenses) {
      const expenseDeletions = expenses
        .filter((expense) => expense.category_id === selectedCategory.id)
        .map(async (expense) => {
          const deleted = await DeleteExpense(expense.id);
          if (deleted) {
            setExpenses((prev) => {
              return prev ? prev.filter((exp) => exp.id !== expense.id) : null;
            });
          }
        });

      // Wait for all expense deletions to complete
      await Promise.all(expenseDeletions);
    }
    const isDeleted: boolean = await DeleteCategory(selectedCategory.id);
    if (isDeleted) {
      setCategories((prev) => {
        return prev
          ? prev.filter((category) => category.id !== selectedCategory.id)
          : null;
      });
      setSelectedCategory(null);
      setOpenCategory(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Typography fontSize={20} fontWeight={"600"}>
          Categories
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => setNewCategory(true)}
        >
          New Category
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Grid2 container spacing={4}>
          {categories?.map((category) => {
            return (
              <Grid2 key={category.id} size={3}>
                <Card
                  sx={{
                    background: "#f5f5f5",
                    cursor: "pointer",
                  }}
                  elevation={0}
                  onClick={() => {
                    setOpenCategory(true);
                    setSelectedCategory(category);
                  }}
                >
                  <CardContent>
                    <Typography
                      fontSize={16}
                      fontWeight={"600"}
                      marginBottom={"1rem"}
                    >
                      {category.name}
                    </Typography>
                    <Typography fontSize={14} fontWeight={"400"}>
                      ${category.total_expenses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
            );
          })}
          {newCategory && (
            <Grid2 size={3}>
              <Card sx={{ background: "#f5f5f5" }}>
                <CardContent>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      width: "100%",
                      marginBottom: "1rem",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                    ref={newCategoryRef}
                  />
                  <Typography fontSize={14} fontWeight={"400"}>
                    $0.00
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          )}
        </Grid2>
        <Backdrop
          open={openCategory}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          onClick={() => setOpenCategory(false)}
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
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontSize={24} fontWeight={"600"}>
                  {selectedCategory?.name}
                </Typography>
                <DeleteIcon
                  onClick={() => setShowDeleteDialog(true)}
                  color="action"
                  sx={{ cursor: "pointer" }}
                />
              </Box>
              <Typography fontSize={16} fontWeight={"400"}>
                Total expenses: ${selectedCategory?.total_expenses}
              </Typography>
              <Box
                sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <Typography>Description: </Typography>
                <input
                  type="text"
                  title="description"
                  name="description"
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
                    width: "100%",
                    backgroundColor: "#d3d3d3",
                    padding: "0.3rem",
                    borderRadius: "3px",
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
            <DialogTitle id="alert-dialog-title">Delete Category</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This action will delete all expenses associated with this
                category. Are you sure you want to delete this category?
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
      </Box>
    </Box>
  );
}
