import React, { useState, useEffect, useContext } from "react";
import "./Transaction.scss";
import { Button, Input, Select } from "antd";
import dayjs from "dayjs";
import { AppContext } from "../../Context/AppContext";

const { Search } = Input;
const { Option } = Select;

const DEFAULT_TRANSACTION = {
  transactionID: 0,
  name: "",
  type: "",
  date: "",
  time: "",
  amount: "",
};

export interface ExpenseType {
  transactionID: number;
  name: string;
  type: string;
  date: string;
  time: string;
  amount: string;
}

function Transaction() {
  const { expenses, setExpenses, expenseTypes, settings } =
    useContext(AppContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactionDetails, setTransactionDetails] =
    useState<ExpenseType>(DEFAULT_TRANSACTION);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [filterType, setFilterType] = useState("");

  const currency = settings.currency || "₹";

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const onDrawerClose = () => {
    setDrawerOpen(false);
    setTransactionDetails(DEFAULT_TRANSACTION);
    return true;
  };

  const onAddClick = () => {
    const now = dayjs();
    setTransactionDetails({
      ...DEFAULT_TRANSACTION,
      date: now.format("YYYY-MM-DD"),
      time: now.format("HH:mm"),
    });
    setDrawerOpen(true);
  };

  const onExpenseAdd = () => {
    if (transactionDetails.transactionID) {
      const updated = expenses.map((exp: any) =>
        exp.transactionID === transactionDetails.transactionID ? transactionDetails : exp
      );
      setExpenses(updated);
    } else {
      const newExpense = {
        ...transactionDetails,
        transactionID: Date.now(),
      };
      setExpenses([...expenses, newExpense]);
    }
    onDrawerClose();
  };

  const onEdit = (expense: any) => {
    setTransactionDetails(expense);
    setDrawerOpen(true);
  };

  const onDelete = (id: string) => {
    setExpenses(expenses.filter((exp: any) => exp.transactionID !== id));
  };

  const filteredTransaction = expenses.filter((exp: any) => {
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
        <Button type="primary" onClick={() => {}}>
          Add Transaction
        </Button>
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
              <Button type="primary" onClick={() => onEdit(exp)}>
                Edit
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => onDelete(exp.transactionID)}
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
