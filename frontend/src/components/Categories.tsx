import { Box, Typography, Card, CardContent, Grid2 } from "@mui/material";
import { useEffect, useState } from "react";
import { Category } from "../types";
export function Categories({ categories }: { categories: Category[] | null }) {
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
                <Card sx={{ background: "#f5f5f5" }}>
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
        </Grid2>
      </Box>
    </Box>
  );
}
