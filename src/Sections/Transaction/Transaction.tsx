import React, { useState, useEffect, useContext } from "react";
import "./Transaction.scss";
import { Button, Input, Select } from "antd";
import dayjs from "dayjs";
import { AppContext } from "../../Context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { DB_COLLECTION_NAMES } from "../../Utils/DB_COLLECTION_CONST";
import { db } from "../../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const { Search } = Input;
const { Option } = Select;
export interface ExpenseType {
  transactionID: number;
  name: string;
  type: string;
  date: string;
  time: string;
  amount: string;
}

function Transaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profileDetails } = useContext(AppContext);
  const { expenseTypes, settings } =
    useContext(AppContext);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [transactionList, setTransactionList] = useState<Record<string, any>[]>([]);

  const currency = settings.currency || "₹";

  useEffect(() => {
    if (profileDetails.user_id) getTransactionList();
  }, [profileDetails.user_id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const getTransactionList = async () => {
    const usersRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
    const q = query(usersRef, where("user_id", "==", profileDetails.user_id), where("collection_name", "==", id));
    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs.map((doc) => {
      const d = doc.data();
      // convert Firestore timestamp to readable date
      const createdAt = d.created_at?.seconds
        ? new Date(d.created_at.seconds * 1000).toLocaleString()
        : "-";
      const updatedAt = d.updated_at?.seconds
        ? new Date(d.updated_at.seconds * 1000).toLocaleString()
        : "-";
      return {
        id: doc.id,
        name: d.name,
        amount: d.amount,
        type: d.type,
        cashFlowType: d.cashFlowType,
        created_at: createdAt,
        updated_at: updatedAt,
      };
    });
    setTransactionList(result);
  };

  const onEdit = () => { };

  const onDelete = () => { };

  const filteredTransaction = transactionList.filter((exp: any) => {
    const matchesSearch =
      exp.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
      exp.amount.toString().includes(debouncedSearchText);
    const matchesType =
      filterType === "" || exp.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="expense">
      <div className="expense_header">
        <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          Transactions List
        </div>
        <Search
          placeholder="Search by name or amount"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200, marginRight: 16 }}
        />
        <Select
          placeholder="Filter by type"
          allowClear
          value={filterType || undefined}
          onChange={(value) => setFilterType(value || "")}
          style={{ width: 180, marginRight: 16 }}
        >
          {expenseTypes.map((type: any) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
        <Button type="primary" onClick={() => { navigate(`/collection/${id}/new`) }}>
          Add Transaction
        </Button>
      </div>
      <div className="collection_balance">
        <div className="balance_IN">Total Income: ₹ 62,193</div>
        <div className="balance_OUT">Total expense: ₹ 60,193</div>
        <div className="balance_amount">Balance: ₹ 2,000</div>
      </div>
      <div className="expense_list">
        {filteredTransaction.length === 0 && (
          <p>Transaction doesn't match your search/filter.</p>
        )}
        {filteredTransaction.map((exp: any) => (
          <div key={exp.transactionID} className="expense_item">
            <div>{exp.name}</div>
            <div>{exp.type}</div>
            <div>
              {exp.date} {exp.time}
            </div>
            <div className="expense_item-amount">
              {currency} {exp.amount}
            </div>
            <div className="expense_item-action">
              <Button type="primary" onClick={() => {}}>
                Edit
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => {}}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Transaction;
