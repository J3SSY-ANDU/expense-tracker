import { Backdrop, Box, Button, Card, CardContent, CircularProgress, FilledInput, FormControl, InputLabel, Typography } from "@mui/material";
import { Budget } from "../types";
import { useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SavingsIcon from "@mui/icons-material/Savings";
import { NumericFormat } from "react-number-format";
import apiService from "../api/apiService";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetCard({
    budget,
    setBudget,
}: {
    budget: Budget | null;
    setBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
}) {
    const [totalIncome, setTotalIncome] = useState<number | null>(null);
    const [editBudget, setEditBudget] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

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
    const chartData = useMemo(() => {
        // If both expenses and remaining are 0, show a placeholder slice
        const showPlaceholder = expenses === 0 && remaining === 0;
        return {
            labels: showPlaceholder ? ["No Data"] : ["Expenses", "Remaining"],
            datasets: [
                {
                    data: showPlaceholder ? [0.00000001] : [Math.max(expenses, 0), Math.max(remaining, 0)],
                    backgroundColor: showPlaceholder ? ["#e0e0e0"] : ["#50A9E3", "#cccccc"],
                    hoverBackgroundColor: showPlaceholder ? ["#e0e0e0"] : ["#50a8e3dd", "#ccccccd8"],
                    borderWidth: 0,
                },
            ],
        };
    }, [expenses, remaining]);

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

    const hasBudget = budget && income > 0;
    const hasExpenses = expenses > 0;

    return (
        <Card sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #ccc", pb: 1, mb: 3 }}>
                        <Typography component="div" sx={{ fontSize: 18, fontWeight: "600", }}>
                            Budget Overview
                        </Typography>
                        <Button sx={{ display: 'flex', alignItems: 'center', gap: '0.4rem', p: 0, cursor: 'pointer', width: 'fit-content', textTransform: 'none', color: 'inherit' }} onClick={() => { setEditBudget(true) }}>
                            {hasBudget ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            <Typography>
                                {hasBudget ? "Edit" : "Add"}
                            </Typography>
                        </Button>
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
                                Budget
                            </Typography>
                            <Typography variant="body1">
                                {hasBudget ? currency.format(income) : "-"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Expenses
                            </Typography>
                            <Typography variant="body1">
                                {hasExpenses ? currency.format(expenses) : "-"}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Backdrop open={editBudget} sx={{ zIndex: 1200 }}>
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            p: 3,
                            borderRadius: 3,
                            minWidth: 340,
                            boxShadow: 4,
                            mx: 2,
                            position: "relative"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <SavingsIcon sx={{ fontSize: 24, mr: 1 }} />
                            <Typography variant="h6" fontWeight={700}>
                                {hasBudget ? "Edit Budget" : "Add Budget"}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                            {hasBudget
                                ? `Current budget: $${Number(budget.total_income ?? 0).toLocaleString()}`
                                : "Set your monthly budget limit"}
                        </Typography>
                        <FormControl fullWidth variant="filled" sx={{ my: 2 }}>
                            <InputLabel htmlFor="filled-adornment-amount" size="small" sx={{ fontSize: 14 }}>Amount</InputLabel>
                            <NumericFormat
                                id="filled-adornment-amount"
                                customInput={FilledInput}
                                value={totalIncome ?? ""}
                                onValueChange={(values) => setTotalIncome(values.floatValue ?? null)}
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                                prefix="$"
                                allowNegative={false}
                                allowLeadingZeros={false}
                                placeholder="0.00"
                                sx={{ fontSize: 16, fontWeight: 600 }}
                                size="small"
                            />
                        </FormControl>
                        <Typography variant="caption" color="text.secondary" mb={2} display="block">
                            You can adjust your budget any time.
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2,
                                mt: 3,
                                borderTop: "1px solid #eee",
                                pt: 2,
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setEditBudget(false);
                                    setTotalIncome(null);
                                }}
                                disabled={loading || totalIncome === null || totalIncome <= 0}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={async () => {
                                    if (typeof totalIncome === "number" && budget?.id) {
                                        setLoading(true);
                                        const data = await apiService.addBudget(budget.id, totalIncome);
                                        if (data && "total_income" in data) {
                                            setBudget(data as Budget);
                                            setTotalIncome(null);
                                            setLoading(false);
                                            setEditBudget(false);
                                        } else {
                                            setBudget(null);
                                        }
                                    }
                                }}
                                disabled={loading || totalIncome === null || totalIncome <= 0}
                                startIcon={loading ? <CircularProgress size={16} /> : undefined}
                            >
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </Box>
                        {/* Backdrop click closes only if outside the Box */}
                        <Box
                            sx={{
                                position: "fixed",
                                inset: 0,
                                zIndex: -1,
                            }}
                            onClick={() => setEditBudget(false)}
                        />
                    </Box>
                </Backdrop>
            </CardContent>
        </Card>
    );
}