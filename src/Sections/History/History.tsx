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

const { Search } = Input;

function History() {
  const { profileDetails } = useContext(AppContext);
  const currency =  "₹";

  const [transactions, setTransactions] = useState<any[]>([]);
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
        const collections = colSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        let allTransactions: any[] = [];

        // 2️⃣ For each collection, fetch transactions
        for (const col of collections) {
          const txRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
          const txQuery = query(txRef, where("collection_id", "==", col.id));
          const txSnapshot = await getDocs(txQuery);

          const txList = txSnapshot.docs.map((doc) => {
            const data = doc.data();

            // Handle Firestore timestamp for date & time
            let date = "-";
            let time = "-";
            if (data.datetime?.seconds) {
              const d = dayjs(data.datetime.toDate());
              date = d.format("YYYY-MM-DD");
              time = d.format("hh:mm A");
            }

            return {
              id: doc.id,
              ...data,
              collectionName: col?.name,
              date,
              time,
            };
          });

          allTransactions = [...allTransactions, ...txList];
        }

        // 3️⃣ Sort by date/time (latest first)
        allTransactions.sort((a, b) =>
          dayjs(`${b.date} ${b.time}`).diff(dayjs(`${a.date} ${a.time}`))
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
  const filteredData = transactions.filter((item: any) => {
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
    },
    {
      title: "Category",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Transaction Mode",
      dataIndex: "transactionMode",
      key: "transactionMode",
    },
    {
      title: "Flow Type",
      dataIndex: "cashFlowType",
      key: "cashFlowType",
      render: (text: string) =>
        text ? text.charAt(0).toUpperCase() + text.slice(1) : "-",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <>
          {currency} {amount}
        </>
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
          style={{ width: 500}}
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
