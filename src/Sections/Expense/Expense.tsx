import React, { useState, useEffect, useContext } from "react";
import "./Expense.scss";
import { Button, Input, Select } from "antd";
import ExpenseDrawer from "./ExpenseDrawer";
import dayjs from "dayjs";
import { AppContext } from "../../Context/AppContext";

const { Search } = Input;
const { Option } = Select;

const DEFAULT_EXPENSE = {
  expenseID: 0,
  name: "",
  type: "",
  date: "",
  time: "",
  amount: "",
};

export interface ExpenseType {
  expenseID: number;
  name: string;
  type: string;
  date: string;
  time: string;
  amount: string;
}

function Expense() {
  const { expenses, setExpenses, expenseTypes, setExpenseTypes, settings } =
    useContext(AppContext);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expenseDetails, setExpenseDetails] =
    useState<ExpenseType>(DEFAULT_EXPENSE);
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
    setExpenseDetails(DEFAULT_EXPENSE);
    return true;
  };

  const onAddClick = () => {
    const now = dayjs();
    setExpenseDetails({
      ...DEFAULT_EXPENSE,
      date: now.format("YYYY-MM-DD"),
      time: now.format("HH:mm"),
    });
    setDrawerOpen(true);
  };

  const onExpenseAdd = () => {
    if (expenseDetails.expenseID) {
      const updated = expenses.map((exp: any) =>
        exp.expenseID === expenseDetails.expenseID ? expenseDetails : exp
      );
      setExpenses(updated);
    } else {
      const newExpense = {
        ...expenseDetails,
        expenseID: Date.now(),
      };
      setExpenses([...expenses, newExpense]);
    }
    onDrawerClose();
  };

  const onEdit = (expense: any) => {
    setExpenseDetails(expense);
    setDrawerOpen(true);
  };

  const onDelete = (id: string) => {
    setExpenses(expenses.filter((exp: any) => exp.expenseID !== id));
  };

  const filteredExpenses = expenses.filter((exp: any) => {
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
          Expenses List
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

        <Button type="primary" onClick={onAddClick}>
          Add expense
        </Button>
      </div>

      <div className="expense_list">
        {filteredExpenses.length === 0 && (
          <p>No expenses match your search/filter.</p>
        )}
        {filteredExpenses.map((exp: any) => (
          <div key={exp.expenseID} className="expense_item">
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
                onClick={() => onDelete(exp.expenseID)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ExpenseDrawer
        drawerOpen={drawerOpen}
        onDrawerClose={onDrawerClose}
        expenseDetails={expenseDetails}
        setExpenseDetails={setExpenseDetails}
        onExpenseAdd={onExpenseAdd}
        expenseTypes={expenseTypes}
        setExpenseTypes={setExpenseTypes}
      />
    </div>
  );
}

export default Expense;
