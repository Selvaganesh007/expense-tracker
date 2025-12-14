import { useEffect, useState } from "react";
import "./Dashboard.scss";
import { GiTakeMyMoney } from "react-icons/gi";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs";
import { Select } from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import { DB_COLLECTION_NAMES } from "../../Utils/DB_COLLECTION_CONST";
import { useAppSelector } from "../../redux/store";
import { UserState } from "../../redux/auth/authSlice";
import Loader from "../../helpers/Loader";

import { CollectionType, ExpenseType } from "../../types";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const profileDetails: UserState = useAppSelector((state) => state.auth);
  const currency = "₹";
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [transactions, setTransactions] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    const colRef = collection(db, DB_COLLECTION_NAMES.COLLECTION);
    const q = query(
      colRef,
      where("user_id", "==", profileDetails.currentUser.user_id)
    );
    const snapshot = await getDocs(q);

    const list: CollectionType[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name,
        user_id: d.user_id,
        created_at: d.created_at?.seconds ? new Date(d.created_at.seconds * 1000).toLocaleString() : "-",
        updated_at: d.updated_at?.seconds ? new Date(d.updated_at.seconds * 1000).toLocaleString() : "-",
      };
    });

    setCollections(list);
    if (list.length > 0) {
      setSelectedCollection(list[list.length - 1].id); // pick recent one
      fetchTransactions(list[list.length - 1].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profileDetails.currentUser.user_id) fetchCollections();
  }, [profileDetails.currentUser]);

  useEffect(() => {
    if (selectedCollection) fetchTransactions();
  }, [selectedCollection]);

  const fetchTransactions = async (collectionId?: string) => {
    setLoading(true);
    const txRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
    const q = query(
      txRef,
      where("collection_id", "==", collectionId || selectedCollection)
    );
    const snapshot = await getDocs(q);

    const list: ExpenseType[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
            id: doc.id,
            name: d.name,
            type: d.type,
            amount: Number(d.amount),
            cashFlowType: d.cashFlowType,
            transactionMode: d.transactionMode,
            user_id: d.user_id,
            collection_id: d.collection_id,
            datetime: d.datetime, // keep raw Fetch for sorting if needed, or convert
            created_at: d.created_at?.seconds ? new Date(d.created_at.seconds * 1000).toLocaleString() : "-",
            updated_at: d.updated_at?.seconds ? new Date(d.updated_at.seconds * 1000).toLocaleString() : "-"
        };
    });

    setTransactions(list);
    setLoading(false);
  };

  const expenses = transactions.filter(
    (t: ExpenseType) => t.cashFlowType === "expense"
  );
  const income = transactions.filter((t: ExpenseType) => t.cashFlowType === "income");

  const totalSpending = expenses.reduce(
    (sum, t: ExpenseType) => sum + Number(t.amount || 0),
    0
  );
  const totalIncome = income.reduce(
    (sum, t: ExpenseType) => sum + Number(t.amount || 0),
    0
  );

  const handlePieChart = () => {
    const expenseByType = expenses.reduce((acc: Record<string, number>, exp: ExpenseType) => {
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

    return pieData;
  };

  return (
    <div className="dashboard">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="dashboard_amount glass-card">
            <div className="total_amount">
              <div>
                <h3>
                  {currency}
                  {(totalIncome - totalSpending).toFixed(2)}
                </h3>
                <p>Total balance amount</p>
              </div>
              <div>
                <Select
                  style={{ width: 250, marginTop: 8 }}
                  value={selectedCollection || undefined}
                  onChange={(val) => setSelectedCollection(val)}
                  placeholder="Select Collection"
                >
                  {collections.map((c) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
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
              <Pie data={handlePieChart()} />
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
            {[...transactions]
              .sort((a, b) => {
                // If datetime is a Timestamp, convert it; if it's not present, handle gracefully.
                // Assuming stored as Timestamp in older records or similar.
                // Actually in fetchTransactions we kept datetime.
                const dtA = a.datetime?.toDate ? a.datetime.toDate() : a.datetime;
                const dtB = b.datetime?.toDate ? b.datetime.toDate() : b.datetime;
                return dayjs(dtB).diff(dayjs(dtA));
              })
              .slice(0, 10)
              .map((tx, idx) => (
                <div key={idx} className="expense_transaction glass-card">
                  <div>{tx.name}</div>
                  <div>{tx.type}</div>
                  <div>
                    {currency}
                    {tx.amount}
                  </div>
                  <div>
                    {tx.cashFlowType === "expense" ? (
                      <FaMoneyBillTrendUp />
                    ) : (
                      <GiTakeMyMoney />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
