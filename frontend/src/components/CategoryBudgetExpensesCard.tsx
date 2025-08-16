import { Box, Card, CardContent, Typography, LinearProgress, Stack, Grid } from "@mui/material";
import { Category } from "../types";
import { iconMap } from "./icons";

type Props = {
    categories: Category[] | null;
};

export default function CategoryBudgetExpensesCard({ categories }: Props) {
    if (!categories || categories.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography>No categories found.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography component="div" sx={{ fontSize: 18, fontWeight: "600", borderBottom: "1px solid #ccc", pb: 1, mb: 3 }}>
                    Category Budgets and Expenses
                </Typography>
                <Grid
                    container
                    spacing={2}
                    sx={{
                        flexGrow: 1,
                        overflowY: categories.filter(cat => Number(cat.budget) > 0).length > 8 ? 'auto' : 'unset',
                        maxHeight: categories.filter(cat => Number(cat.budget) > 0).length > 8 ? 400 : 'unset',
                    }}
                >
                    {categories
                        .filter(cat => Number(cat.budget) > 0)
                        .map((cat, i) => {
                            const CategoryIcon = cat.icon ? iconMap[cat.icon] : "";
                            const budget = Number(cat.budget);
                            const totalExpenses = Number(cat.total_expenses);
                            const percent = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;
                            return (
                                <Grid item xs={12} sm={6} key={cat.id}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                {CategoryIcon && <CategoryIcon sx={{ fontSize: 18 }} />}
                                                <Typography variant="subtitle1">{cat.name}</Typography>
                                            </Box>
                                            <Typography variant="body2">
                                                ${budget}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ position: "relative", width: "100%" }}>
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    left: 0,
                                                    top: 0,
                                                    width: `${percent}%`,
                                                    height: "100%",
                                                    zIndex: 2,
                                                    cursor: "pointer",
                                                }}
                                                title={`Total Expenses: $${totalExpenses}`}
                                            />
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    left: `${percent}%`,
                                                    top: 0,
                                                    width: `${100 - percent}%`,
                                                    height: "100%",
                                                    zIndex: 2,
                                                    cursor: "pointer",
                                                }}
                                                title={`Remaining: $${Math.max(budget - totalExpenses, 0)}`}
                                            />
                                            <LinearProgress
                                                variant="determinate"
                                                value={percent}
                                                sx={{ height: 8, borderRadius: 4 }}
                                                color={percent >= 100 ? "error" : "primary"}
                                            />
                                        </Box>
                                        <Typography sx={{ alignSelf: 'flex-end', color: 'var(--color-text-secondary)', opacity: 0.7, fontSize: 10 }}>
                                            ${totalExpenses}
                                        </Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                </Grid>
            </CardContent>
        </Card>
    );
}