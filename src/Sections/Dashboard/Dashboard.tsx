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

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const profileDetails: UserState = useAppSelector((state) => state.auth);
  const currency = "₹";
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    const colRef = collection(db, DB_COLLECTION_NAMES.COLLECTION);
    const q = query(
      colRef,
      where("user_id", "==", profileDetails.currentUser.user_id)
    );
    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCollections(list);
    if (list.length > 0) {
      setSelectedCollection(list[0].id); // pick recent one
      fetchTransactions(list[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profileDetails.currentUser.user_id) fetchCollections();
  }, [profileDetails.currentUser]);

  const fetchTransactions = async (collectionId?: string) => {
    setLoading(true);
    const txRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
    const q = query(
      txRef,
      where("collection_id", "==", collectionId || selectedCollection)
    );
    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTransactions(list);
    setLoading(false);
  };

  const expenses = transactions.filter(
    (t: any) => t.cashFlowType === "expense"
  );
  const income = transactions.filter((t: any) => t.cashFlowType === "income");

  const totalSpending = expenses.reduce(
    (sum, t: any) => sum + Number(t.amount || 0),
    0
  );
  const totalIncome = income.reduce(
    (sum, t: any) => sum + Number(t.amount || 0),
    0
  );
  const balance = totalIncome - totalSpending;

  const expenseByType = expenses.reduce((acc: any, exp: any) => {
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

  const allTransactions = [...transactions]
    .sort((a, b) => {
      const dateTimeA: any = dayjs(`${a.date} ${a.time}`);
      const dateTimeB: any = dayjs(`${b.date} ${b.time}`);
      return dateTimeB - dateTimeA;
    })
    .slice(0, 10);

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
