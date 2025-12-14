import React, { useEffect, useState, useContext } from "react";
import "./History.scss";
import { Table, Input } from "antd";
import dayjs from "dayjs";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { DB_COLLECTION_NAMES } from "../../Utils/DB_COLLECTION_CONST";
import { AppContext } from "../../Context/AppContext";

import { CollectionType, ExpenseType } from "../../types";

const { Search } = Input;

interface HistoryTransaction extends ExpenseType {
  collectionName?: string;
  dateStr?: string; // differentiating from potential date object
  timeStr?: string;
}

function History() {
  const { profileDetails } = useContext(AppContext);
  const currency =  "₹";

  const [transactions, setTransactions] = useState<HistoryTransaction[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileDetails.user_id) return;

    const fetchAllTransactions = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch all collections of current user
        const colRef = collection(db, DB_COLLECTION_NAMES.COLLECTION);
        const q = query(colRef, where("user_id", "==", profileDetails.user_id));
        const colSnapshot = await getDocs(q);
        const collections: CollectionType[] = colSnapshot.docs.map((doc) => {
             const d = doc.data();
             return {
                 id: doc.id,
                 name: d.name,
                 user_id: d.user_id,
                 created_at: d.created_at?.seconds ? new Date(d.created_at.seconds * 1000).toLocaleString() : "-",
                 updated_at: d.updated_at?.seconds ? new Date(d.updated_at.seconds * 1000).toLocaleString() : "-",
             };
        });

        let allTransactions: HistoryTransaction[] = [];

        // 2️⃣ For each collection, fetch transactions
        for (const col of collections) {
          const txRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
          const txQuery = query(txRef, where("collection_id", "==", col.id));
          const txSnapshot = await getDocs(txQuery);

          const txList: HistoryTransaction[] = txSnapshot.docs.map((doc) => {
            const data = doc.data();

            // Handle Firestore timestamp for date & time
            let date = "-";
            let time = "-";
            if (data.datetime?.seconds) {
              const d = dayjs(data.datetime.toDate());
              date = d.format("YYYY-MM-DD");
              time = d.format("hh:mm A");
            }
            const createdAt = data.created_at?.seconds ? new Date(data.created_at.seconds * 1000).toLocaleString() : "-";
            const updatedAt = data.updated_at?.seconds ? new Date(data.updated_at.seconds * 1000).toLocaleString() : "-";

            return {
              id: doc.id,
              name: data.name,
              type: data.type,
              amount: Number(data.amount),
              cashFlowType: data.cashFlowType,
              transactionMode: data.transactionMode,
              user_id: data.user_id,
              collection_id: data.collection_id,
              datetime: data.datetime,
              created_at: createdAt,
              updated_at: updatedAt,
              
              collectionName: col?.name,
              dateStr: date, // using distinct keys to avoid conflict if I used 'date' in ExpenseType
              timeStr: time,
            };
          });

          allTransactions = [...allTransactions, ...txList];
        }

        // 3️⃣ Sort by date/time (latest first)
        allTransactions.sort((a, b) =>
          dayjs(`${b.dateStr} ${b.timeStr}`).diff(dayjs(`${a.dateStr} ${a.timeStr}`))
        );

        setTransactions(allTransactions);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [profileDetails.user_id]);

  // 🔍 Filter search
  const filteredData = transactions.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.amount?.toString().includes(searchText) ||
      item.type?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.collectionName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.transactionMode?.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  // 📋 Table columns
  const columns = [
    {
      title: "Collection",
      dataIndex: "collectionName",
      key: "collectionName",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="table_text_bold">{text}</span>,
    },
    {
      title: "Category",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <span className="badge">{type}</span>,
    },
    {
      title: "Transaction Mode",
      dataIndex: "transactionMode",
      key: "transactionMode",
      render: (mode: string) => <span className="badge">{mode}</span>,
    },
    {
      title: "Flow Type",
      dataIndex: "cashFlowType",
      key: "cashFlowType",
      render: (text: string) =>
        text ? (
            <span style={{ color: text === "income" ? "#34d399" : "#f87171", fontWeight: 600 }}>
                {text.charAt(0).toUpperCase() + text.slice(1)}
            </span>
        ) : (
            "-"
        ),
    },
    {
      title: "Date",
      dataIndex: "dateStr",
      key: "dateStr",
    },
    {
      title: "Time",
      dataIndex: "timeStr",
      key: "timeStr",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: HistoryTransaction) => (
        <span className={record.cashFlowType === "income" ? "text_success" : "text_danger"}>
          {record.cashFlowType === "income" ? "+" : "-"}{" "}
          {currency} {amount}
        </span>
      ),
    },
  ];

  return (
    <div className="history">
      <div className="history_header">
        <div className="title">All Transactions</div>
        <Search
          placeholder="Search by name, type, amount, collection or transaction mode"
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          style={{ maxWidth: 500}}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default History;
