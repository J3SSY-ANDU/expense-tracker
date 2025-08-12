import { Backdrop, Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useMemo } from "react";
import { Budget, Category } from "../types";
ChartJS.register(ArcElement, Tooltip, Legend);


export default function CategoriesBudgetsCard({
    budget,
    categories,
}: {
    budget: Budget | null;
    categories: Category[] | null;
}) {
    const income = useMemo(() => Number(budget?.total_income ?? 0), [budget]);
    const expenses = useMemo(() => Number(budget?.total_expenses ?? 0), [budget]);
    const remaining = useMemo(() => Math.max(income - expenses, 0), [income, expenses]);

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

    const chartData = useMemo(() => {
        // Filter only categories with budget > 0
        const filteredCategories = categoriesBudgets?.filter(c => c.value > 0) ?? [];

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
        ];
        const categoriesValues = filteredCategories.map((c) => c.value);
        const totalCategories = categoriesValues.reduce((sum, v) => sum + v, 0);
        const remainingValue = Math.max(income - totalCategories, 0);

        const data = [...categoriesValues, remainingValue];
        const labels = [...filteredCategories.map((c) => c.label), "Remaining"];

        // Assign each category a color, remaining is always gray
        const backgroundColor = [
            ...categoryColors.slice(0, filteredCategories.length),
            "#cccccc", // Remaining color (always gray)
        ];
        const hoverBackgroundColor = [
            ...categoryColors.slice(0, filteredCategories.length).map((color) => `${color}cc`), // add opacity for stronger hover
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
    }, [categoriesBudgets, income]);

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
        <Card>
            <CardContent>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #ccc", pb: 1 }}>
                        <Typography component="div" sx={{ fontSize: 18, fontWeight: "600", }}>
                            Categories & Budgets
                        </Typography>
                    </Box>

                    <Box sx={{ height: 240 }}>
                        <Doughnut data={chartData} options={chartOptions} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}