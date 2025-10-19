import React, { useEffect, useState, useContext } from "react";
import "./Income.scss";
import { Button, Input, Select } from "antd";
import IncomeDrawer from "./IncomeDrawer";
import dayjs from "dayjs";
import { AppContext } from "../../Context/AppContext";

const { Search } = Input;
const { Option } = Select;

const DEFAULT_INCOME_DETAILS = {
  incomeID: 0,
  name: "",
  type: "",
  date: "",
  time: "",
  amount: "",
};

const DEFAULT_INCOME_TYPES = [
  "Salary",
  "Freelance",
  "Bonus",
  "Investment",
  "Other",
];

function Income() {
  const { income, setIncome, incomeTypes, setIncomeTypes, settings } =
    useContext(AppContext);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [incomeDetails, setIncomeDetails] = useState(DEFAULT_INCOME_DETAILS);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [filterType, setFilterType] = useState("");

  const currency = settings.currency || "₹";

  useEffect(() => {
    const savedIncomes =
      JSON.parse(localStorage.getItem("income") as string) || [];
    const savedTypes =
      JSON.parse(localStorage.getItem("incomeTypes") as string) ||
      DEFAULT_INCOME_TYPES;

    setIncome(savedIncomes);
    setIncomeTypes(savedTypes);
  }, []);

  useEffect(() => {
    localStorage.setItem("income", JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem("incomeTypes", JSON.stringify(incomeTypes));
  }, [incomeTypes]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const onDrawerClose = () => {
    setDrawerOpen(false);
    setIncomeDetails(DEFAULT_INCOME_DETAILS);
  };

  const onAddClick = () => {
    const now = dayjs();
    setIncomeDetails({
      ...DEFAULT_INCOME_DETAILS,
      date: now.format("YYYY-MM-DD"),
      time: now.format("HH:mm"),
    });
    setDrawerOpen(true);
  };

  const onIncomeAdd = () => {
    if (incomeDetails.incomeID) {
      const updated = income.map((inc: any) =>
        inc.incomeID === incomeDetails.incomeID ? incomeDetails : inc
      );
      setIncome(updated);
    } else {
      const newIncome = {
        ...incomeDetails,
        incomeID: Date.now(),
      };
      setIncome([...income, newIncome]);
    }
    onDrawerClose();
  };

  const onEdit = (incomeItem: any) => {
    setIncomeDetails(incomeItem);
    setDrawerOpen(true);
  };

  const onDelete = (id: string) => {
    setIncome(income.filter((inc: any) => inc.incomeID !== id));
  };

  const filteredIncome = income.filter((inc: any) => {
    const matchesSearch =
      inc.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
      inc.amount.toString().includes(debouncedSearchText);
    const matchesType =
      filterType === "" || inc.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="income">
      <div className="income_header">
        <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          Income List
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
          {incomeTypes.map((type: any) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>

        <Button type="primary" onClick={onAddClick}>
          Add Income
        </Button>
      </div>

      <div className="income_list">
        {filteredIncome.length === 0 && <p>No income data.</p>}
        {filteredIncome.map((inc: any) => (
          <div key={inc.incomeID} className="income_item">
            <div>{inc.name}</div>
            <div>{inc.type}</div>
            <div>
              {inc.date} {inc.time}
            </div>
            <div className="income_item-amount">
              {currency} {inc.amount}
            </div>
            <div className="income_item-action">
              <Button type="primary" onClick={() => onEdit(inc)}>
                Edit
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => onDelete(inc.incomeID)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <IncomeDrawer
        drawerOpen={drawerOpen}
        onDrawerClose={onDrawerClose}
        incomeDetails={incomeDetails}
        setIncomeDetails={setIncomeDetails}
        onIncomeAdd={onIncomeAdd}
        incomeTypes={incomeTypes}
        setIncomeTypes={setIncomeTypes}
      />
    </div>
  );
}

export default Income;
