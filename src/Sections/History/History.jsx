import React, { useEffect, useState } from "react";
import "./History.scss";
import { Table, Input, Select } from "antd";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

function History() {
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const income = JSON.parse(localStorage.getItem("income")) || [];
    const all = [
      ...expenses.map((e) => ({
        ...e,
        id: e.expenseID || e.id || Math.floor(1000 + Math.random() * 9000),
        source: "Expense",
      })),
      ...income.map((i) => ({
        ...i,
        id: i.incomeID || i.id || Math.floor(1000 + Math.random() * 9000),
        source: "Income",
      })),
    ];
    all.sort((a, b) =>
      dayjs(`${b.date} ${b.time}`).diff(dayjs(`${a.date} ${a.time}`))
    );
    setTransactions(all);
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
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
      render: (amount) => (
        <>
          {JSON.parse(localStorage.getItem("settings"))?.currency || "₹"} {amount}
        </>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
  ];

  const filteredData = transactions.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.amount.toString().includes(searchText) ||
      item.type.toLowerCase().includes(searchText.toLowerCase());
    const matchesType =
      filterType === "" || item.source === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="history">
      <div className="history_header">
        <div className="title">All Transactions</div>
        <Search
          placeholder="Search by name, type or amount"
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          style={{ width: 200, marginRight: 16 }}
        />
        <Select
          placeholder="Filter by Source"
          allowClear
          value={filterType || undefined}
          onChange={(value) => setFilterType(value || "")}
          style={{ width: 180 }}
        >
          <Option value="Income">Income</Option>
          <Option value="Expense">Expense</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default History;
