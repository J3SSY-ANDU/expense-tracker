import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Category } from "../types";
export default function Categories({
  categories,
}: {
  categories: Category[] | null;
}) {
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  useEffect(() => {
    if (categories) {
      setLoading(false);
    }
  }, [categories]);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Box>
      <Typography fontSize={20} fontWeight={"600"} marginBottom={"1rem"}>
        Categories
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Grid2 container spacing={4}>
          {categories?.map((category) => {
            return (
              <Grid2 key={category.id} size={3}>
                <Card>
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
          <Grid2 size={3}>
            <Button
              variant="outlined"
              sx={{
                padding: "0.5rem",
                border: "1px solid #d3d3d3",
                borderRadius: "10px",
                color: "#d5d5d5",
                width: "100%",
              }}
            >
              New Category
            </Button>
          </Grid2>
        </Grid2>
      </Box>
    </Box>
  );
}
