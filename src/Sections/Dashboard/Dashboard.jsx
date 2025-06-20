import React, { useEffect, useState, useContext } from "react";
import "./Dashboard.scss";
import { GiTakeMyMoney } from "react-icons/gi";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs";
import { AppContext } from "../../Context/AppContext";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const { settings } = useContext(AppContext);
  const currency = settings.currency || "₹";

  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);

  useEffect(() => {
    const exp = JSON.parse(localStorage.getItem("expenses")) || [];
    const inc = JSON.parse(localStorage.getItem("income")) || [];
    setExpenses(exp);
    setIncome(inc);
  }, []);

  const currentMonth = dayjs().format("YYYY-MM");
  const monthlyExpenses = expenses.filter((exp) =>
    exp.date.startsWith(currentMonth)
  );
  const monthlyIncome = income.filter((inc) =>
    inc.date.startsWith(currentMonth)
  );

  const totalSpending = monthlyExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );
  const totalIncome = monthlyIncome.reduce(
    (sum, inc) => sum + Number(inc.amount),
    0
  );

  const expenseByType = expenses.reduce((acc, exp) => {
    acc[exp.type] = (acc[exp.type] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(expenseByType),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(expenseByType),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#00FF99",
          "#FF66FF",
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const allTransactions = [
    ...expenses.map((e) => ({ ...e, type: "Expense" })),
    ...income.map((i) => ({ ...i, type: "Income" })),
  ]
    .sort((a, b) => {
      const dateTimeA = dayjs(`${a.date} ${a.time}`);
      const dateTimeB = dayjs(`${b.date} ${b.time}`);
      return dateTimeB - dateTimeA;
    })
    .slice(0, 10);

  return (
    <div className="dashboard">
      <div className="dashboard_amount glass-card">
        <div className="total_amount">
          <h3>
            {currency}
            {(totalIncome - totalSpending).toFixed(2)}
          </h3>
          <p>Total balance amount</p>
        </div>
        <div className="Transactions">
          <div className="Transactions_sections glass-card">
            <div className="label">
              Income
              <div>
                <GiTakeMyMoney />
              </div>
            </div>
            <p className="transaction_amount">
              {currency}
              {totalIncome.toFixed(2)}
            </p>
            <p>For this month</p>
          </div>
          <div className="Transactions_sections glass-card">
            <div className="label">
              Spending
              <div>
                <FaMoneyBillTrendUp />
              </div>
            </div>
            <p className="transaction_amount">
              {currency}
              {totalSpending.toFixed(2)}
            </p>
            <p>For this month</p>
          </div>
        </div>
        <div className="pie_chart glass-card">
          <Pie data={pieData} />
        </div>
      </div>
      <div className="expense glass-card">
        <p>Last 10 Transactions</p>
        <div className="expense_transaction_header">
          <div>Details</div>
          <div>Category</div>
          <div>Amount</div>
          <div>Type</div>
        </div>
        {allTransactions.map((tx, idx) => (
          <div key={idx} className="expense_transaction glass-card">
            <div>{tx.name}</div>
            <div>{tx.type}</div>
            <div>
              {currency}
              {tx.amount}
            </div>
            <div>
              {tx.type === "Expense" ? (
                <FaMoneyBillTrendUp />
              ) : (
                <GiTakeMyMoney />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
