import React, { useState, useEffect, useContext } from "react";
import "./Transaction.scss";
import { Button, Input, Select } from "antd";
import { AppContext } from "../../Context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { DB_COLLECTION_NAMES } from "../../Utils/DB_COLLECTION_CONST";
import { db } from "../../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Loader from "../../helpers/Loader";
import { useAppSelector } from "../../redux/store";
import { UserState } from "../../redux/auth/authSlice";

const { Search } = Input;
const { Option } = Select;
export interface ExpenseType {
  transactionID: number;
  name: string;
  type: string;
  datetime: string;
  amount: string;
}

function Transaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const profileDetails: UserState = useAppSelector((state) => state.auth);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [currency, setCurrency] = useState("₹");
  const [incomeTypeFilter, setIncomeTypeFilter] = useState("");
  const [transactionModeFilter, setTransactionModeFilter] = useState("");
  const [expenseTypeFilter, setExpenseTypeFilter] = useState("");
  const [transactionList, setTransactionList] = useState<Record<string, any>[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [incomeTypes, setIncomeTypes] = useState<string[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<string[]>([]);
  const [transactionModes, setTransactionModes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profileDetails.currentUser.user_id) getTransactionList();
  }, [profileDetails.currentUser.user_id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    const income = transactionList
      .filter((t) => t.cashFlowType === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactionList
      .filter((t) => t.cashFlowType === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setIncomeTotal(income);
    setExpenseTotal(expense);
  }, [transactionList]);

  useEffect(() => {
    fetchUserSettings();
  }, [profileDetails.currentUser.user_id]);

  const fetchUserSettings = async () => {
    if (!profileDetails?.currentUser.user_id) return;
    try {
      const usersRef = collection(db, DB_COLLECTION_NAMES.USERS);
      const q = query(
        usersRef,
        where("user_id", "==", profileDetails.currentUser.user_id)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const settings = userDoc.data().settings || {};
        setCurrency(settings.currency[0]);
        setIncomeTypes(settings.income || []);
        setExpenseTypes(settings.expense || []);
        setTransactionModes(settings.transactionMode || []);
      }
    } catch (err) {
      console.error("Error fetching user settings:", err);
    } finally {
    }
  };

  const getTransactionList = async () => {
    setLoading(true);
    const usersRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
    const q = query(
      usersRef,
      where("user_id", "==", profileDetails.currentUser.user_id),
      where("collection_id", "==", id),
      orderBy("datetime", "desc")
    );
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
    const income = result
      .filter((t) => t.cashFlowType === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = result
      .filter((t) => t.cashFlowType === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setIncomeTotal(income);
    setExpenseTotal(expense);
    setTransactionList(result);
    setLoading(false);
  };

  const onDelete = async (transactionId: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setDeletingId(transactionId);
      try {
        const docRef = doc(db, DB_COLLECTION_NAMES.TRANSACTION, transactionId);
        await deleteDoc(docRef);
        setTransactionList((prev) =>
          prev.filter((t) => t.id !== transactionId)
        );
      } catch (error) {
        console.error("Error deleting:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredTransaction = transactionList.filter((exp: any) => {
    const matchesSearch =
      exp.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
      exp.amount.toString().includes(debouncedSearchText);

    const matchesExpenseType =
      !expenseTypeFilter ||
      exp.type?.toLowerCase() === expenseTypeFilter.toLowerCase();

    const matchesIncomeType =
      !incomeTypeFilter ||
      exp.type?.toLowerCase() === incomeTypeFilter.toLowerCase();

    const matchesTransactionMode =
      !transactionModeFilter ||
      exp.transactionMode?.toLowerCase() ===
        transactionModeFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesExpenseType &&
      matchesIncomeType &&
      matchesTransactionMode
    );
  });

  return (
    <div className="expense">
      {loading ? (
        <Loader />
      ) : (
        <>
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
              placeholder="Filter by expense type"
              allowClear
              value={expenseTypeFilter || undefined}
              onChange={(value) => setExpenseTypeFilter(value || "")}
              style={{ width: 180, marginRight: 16 }}
            >
              {expenseTypes.map((type: any) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by income type"
              allowClear
              value={incomeTypeFilter || undefined}
              onChange={(value) => setIncomeTypeFilter(value || "")}
              style={{ width: 180, marginRight: 16 }}
            >
              {incomeTypes.map((type: any) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by transaction mode"
              allowClear
              value={transactionModeFilter || undefined}
              onChange={(value) => setTransactionModeFilter(value || "")}
              style={{ width: 180, marginRight: 16 }}
            >
              {transactionModes.map((type: any) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              onClick={() => {
                navigate(`/collection/${id}/new`);
              }}
            >
              Add Transaction
            </Button>
          </div>
          <div className="collection_balance">
            <div className="balance_IN">
              Total Income: {currency} {incomeTotal.toLocaleString()}
            </div>
            <div className="balance_OUT">
              Total Expense: {currency} {expenseTotal.toLocaleString()}
            </div>
            <div className="balance_amount">
              Balance: {currency}{" "}
              {(incomeTotal - expenseTotal).toLocaleString()}
            </div>
          </div>
          <div className="expense_list">
            {filteredTransaction.length === 0 && (
              <p>Transaction doesn't match your search/filter.</p>
            )}
            {filteredTransaction.map((exp: any) => (
              <div key={exp.id} className="expense_item">
                <div>{exp.name}</div>
                <div>{exp.type}</div>
                <div>{exp.updated_at}</div>
                <div className="expense_item-amount">
                  {currency} {exp.amount}
                </div>
                <div className="expense_item-action">
                  <Button
                    type="primary"
                    onClick={() => navigate(`/collection/${id}/${exp.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="primary"
                    danger
                    loading={deletingId === exp.id}
                    onClick={() => onDelete(exp.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Transaction;
