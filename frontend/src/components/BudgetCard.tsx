import { Backdrop, Box, Button, Card, CardContent, FilledInput, FormControl, InputLabel, Typography } from "@mui/material";
import { Budget } from "../types";
import { useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
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

    const chartData = useMemo(
        () => ({
            labels: ["Expenses", "Remaining"],
            datasets: [
                {
                    data: [Math.max(expenses, 0), Math.max(remaining, 0)],
                    backgroundColor: ["#50a8e3dd", "#ccccccd8"],
                    hoverBackgroundColor: ["#50A9E3", "#ccc"],
                    borderWidth: 0,
                },
            ],
        }),
        [expenses, remaining]
    );

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
        <Card>
            <CardContent>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #ccc", pb: 1 }}>
                            <Typography component="div" sx={{ fontSize: 18, fontWeight: "600", }}>
                                Budget (Current Month)
                            </Typography>
                            <Button sx={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', width: 'fit-content', textTransform: 'none', color: 'inherit' }} onClick={() => { setEditBudget(true) }}>
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
                <Backdrop open={editBudget}>
                    <Box
                        sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}
                        onClick={e => e.stopPropagation()} // Prevent Backdrop click from closing when clicking inside
                    >
                        <Typography variant="h6">Edit Budget</Typography>
                        <FormControl fullWidth variant="filled">
                            <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
                            <NumericFormat
                                id="filled-adornment-amount"
                                customInput={FilledInput}
                                value={totalIncome && totalIncome > 0 ? totalIncome : ""}
                                onValueChange={(values) => setTotalIncome(values.floatValue ?? null)}
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                                prefix="$"
                                allowNegative={false}
                                allowLeadingZeros={false}
                                placeholder="0.00"
                            />
                        </FormControl>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "1rem",
                                mt: "4rem",
                                borderTop: "1px solid #ccc",
                                pt: "1rem",
                            }}
                        >
                            <Button variant="outlined" onClick={() => {
                                setEditBudget(false);
                            }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    if (typeof totalIncome === "number" && budget?.id) {
                                        const data = await apiService.addBudget(budget.id, totalIncome);
                                        if (data && "total_income" in data) {
                                            setBudget(data as Budget);
                                            setEditBudget(false);
                                        } else {
                                            // Handle error case
                                            setBudget(null);
                                        }
                                    }
                                }}
                                variant="outlined"
                            >
                                Save
                            </Button>
                        </Box>
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
                </Backdrop>
            </CardContent>
        </Card>
    );
}