import { Card, CardContent, Typography, Box } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from "chart.js";
import dayjs from "dayjs";
import { Expense } from "../types";
import { useMemo } from "react";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

export default function DailyExpensesChart({ expenses }: { expenses: Expense[] | null }) {
  const now = dayjs();
  const year = now.year();
  const month = now.month();
  const daysInMonth = now.daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const cumulativeTotals = useMemo(() => {
    const filtered = (expenses ?? []).filter(exp => {
      const date = dayjs(exp.date);
      return date.year() === year && date.month() === month;
    });
    const totalsMap: { [day: number]: number } = {};
    filtered.forEach(exp => {
      const date = dayjs(exp.date);
      const day = date.date();
      totalsMap[day] = (totalsMap[day] || 0) + Number(exp.amount);
    });
    let runningTotal = 0;
    return daysArray.map(day => {
      runningTotal += totalsMap[day] || 0;
      return runningTotal;
    });
  }, [expenses, daysArray, year, month]);

  const chartData = {
    labels: daysArray.map(day => `${day}`),
    datasets: [
      {
        label: "Cumulative Expenses",
        data: cumulativeTotals,
        fill: true, // <-- Area chart
        backgroundColor: "rgba(80, 168, 227, 0.2)", // semi-transparent area
        borderColor: "#50a8e3",
        tension: 0.25,
        pointRadius: 3,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (ctx: any) => {
            const dayIndex = ctx[0]?.dataIndex ?? 0;
            const date = dayjs().year(year).month(month).date(dayIndex + 1);
            return date.format("MMMM D");
          },
          label: (ctx: any) => {
            const dayIndex = ctx.dataIndex;
            const cumulative = Number(ctx.parsed.y);
            const individual = (expenses ?? []).filter(exp => {
              const date = dayjs(exp.date);
              return date.year() === year && date.month() === month && date.date() === dayIndex + 1;
            }).reduce((sum, exp) => sum + Number(exp.amount), 0);
            return [
              `Cumulative: $${cumulative.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              `Day: $${individual.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            ];
          }
        }
      }
    },
    scales: {
      x: { 
        title: { display: true, text: "Day" },
        ticks: {
          callback: function(value: any) {
            // Only show even numbers on the x-axis
            const day = Number(value) + 1;
            return day % 2 === 0 ? day : '';
          }
        }
      },
      y: {
        title: { display: true, text: "Amount ($)" },
        beginAtZero: true
      }
    }
  };

  return (
    <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Daily Expenses ({now.format("MMMM YYYY")})
        </Typography>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ width: "100%", height: 350 }}>
            <Line data={chartData} options={chartOptions} style={{ width: "100%", height: "100%" }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
