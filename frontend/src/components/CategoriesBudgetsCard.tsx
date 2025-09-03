import { Box, Card, CardContent, Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useMemo } from "react";
import { Budget, Category } from "../types";
ChartJS.register(ArcElement, Tooltip, Legend);


/**
 * Displays a card summarizing budget allocations by category, including a doughnut chart visualization,
 * and highlights the most and least spent categories.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Budget | null} props.budget - The overall budget object, containing total income.
 * @param {Category[] | null} props.categories - Array of category objects, each with budget and expense data.
 *
 * @returns {JSX.Element} A card component showing category budgets, a doughnut chart, and spending highlights.
 *
 * @example
 * <CategoriesBudgetsCard budget={budget} categories={categories} />
 */
export default function CategoriesBudgetsCard({
    budget,
    categories,
}: {
    budget: Budget | null;
    categories: Category[] | null;
}) {
    const income = useMemo(() => Number(budget?.total_income ?? 0), [budget]);

    const currency = useMemo(
        () =>
            new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
            }),
        []
    );

    const categoriesBudgets = categories?.map((category) => ({
        label: category.name,
        value: Number(category.budget ?? 0),
    }));

    const filteredCategories = useMemo(
        () => categoriesBudgets?.filter(c => c.value > 0) ?? [],
        [categoriesBudgets]
    );

    const categoriesValues = filteredCategories.map((c) => c.value);
    const totalCategories = categoriesValues.reduce((sum, v) => sum + v, 0);
    const remainingValue = Math.max(income - totalCategories, 0);

    const chartData = useMemo(() => {
        // Filter only categories with budget > 0

        if (filteredCategories.length === 0) {
            return {
                labels: ["No Data"],
                datasets: [
                    {
                        data: [0.00000001],
                        backgroundColor: ["#e0e0e0"],
                        hoverBackgroundColor: ["#e0e0e0"],
                        borderWidth: 0,
                    },
                ],
            };
        }
        // Default color palette for categories (no gray)
        const categoryColors = [
            "#50a8e3", // blue
            "#f7b267", // orange
            "#6dd3c5", // teal
            "#ff6f61", // red
            "#a259f7", // purple
            "#f6c85f", // yellow
            "#43aa8b", // green
            "#e4572e", // coral
            "#2e4057", // navy
            "#f4d35e", // light yellow
            "#b56576", // mauve
            "#355c7d", // deep blue
            "#ffb4a2", // peach
            "#9d8189", // taupe
            "#3a86ff", // vivid blue
            "#8338ec", // violet
            "#fb5607", // orange-red
            "#ffbe0b", // gold
            "#00b4d8", // cyan
            "#90be6d", // olive green
            "#ff006e", // magenta
            "#06d6a0", // mint
            "#ffd166", // pastel yellow
            "#118ab2", // steel blue
            "#ef476f", // pink
            "#073b4c", // dark blue
            "#8d99ae", // gray blue
            "#f3722c", // tangerine
            "#4d908e", // turquoise
            "#577590", // slate blue
            "#bc5090", // raspberry
            "#ff9f1c", // amber
            "#2ec4b6", // aqua
            "#e71d36", // crimson
            "#ff7f50", // coral orange
            "#6a4c93", // indigo
            "#cdb4db", // lavender
            "#b2f7ef", // pale cyan
            "#fcbf49", // sunflower
            "#a1c181", // moss green
            "#e5989b", // rose
        ];

        const data = [...categoriesValues, remainingValue];
        const labels = [...filteredCategories.map((c) => c.label), "Remaining"];

        // Assign each category a color, remaining is always #ccc
        const backgroundColor = [
            ...categoryColors.slice(0, filteredCategories.length),
            "#cccccc", // Remaining color (always #ccc)
        ];
        const hoverBackgroundColor = [
            ...categoryColors.slice(0, filteredCategories.length).map((color) => `${color}cc`),
            "#ccccccd8", // Stronger gray for "Remaining"
        ];

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor,
                    hoverBackgroundColor,
                    borderWidth: 0,
                },
            ],
        };
    }, [filteredCategories, categoriesValues, remainingValue]);

    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%", // thickness of the ring
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => {
                            const label = ctx.label || "";
                            const value = typeof ctx.parsed === "number" ? ctx.parsed : 0;
                            return `${label}: ${currency.format(value)}`;
                        },
                    },
                },
            },
        }),
        [currency]
    );
    return (
        <Card sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1, justifyContent: "center" }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #ccc", pb: 1, mb: 3 }}>
                        <Typography component="div" sx={{ fontSize: 18, fontWeight: "600" }}>
                            Budgets by Category
                        </Typography>
                    </Box>

                    <Box sx={{ height: 240 }}>
                        <Doughnut data={chartData} options={chartOptions} />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            mt: 1,
                            pt: 1,
                            margin: 'auto',
                            borderTop: '1px solid #ccc',
                            gap: '6rem',
                        }}
                    >
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Total Budgeted
                            </Typography>
                            <Typography variant="body1">
                                {totalCategories > 0 ? currency.format(totalCategories) : "-"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Remaining
                            </Typography>
                            <Typography variant="body1">
                                {remainingValue > 0 ? currency.format(remainingValue) : "-"}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}