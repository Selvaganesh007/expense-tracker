import React, { useEffect, useState } from "react";
import "./History.scss";
import { Table, Input } from "antd";
import dayjs from "dayjs";

const { Search } = Input;

function History() {
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const expenses =
      JSON.parse(localStorage.getItem("expenses") as string) || [];
    const income = JSON.parse(localStorage.getItem("income") as string) || [];
    const all = [
      ...expenses.map((e: any) => ({
        ...e,
        id: e.expenseID || e.id || Math.floor(1000 + Math.random() * 9000),
        source: "Expense",
      })),
      ...income.map((i: any) => ({
        ...i,
        id: i.incomeID || i.id || Math.floor(1000 + Math.random() * 9000),
        source: "Income",
      })),
    ];
    all.sort((a, b) =>
      dayjs(`${b.date} ${b.time}`).diff(dayjs(`${a.date} ${a.time}`))
    );
    setTransactions(all as any);
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
      render: (amount: string) => (
        <>
          {JSON.parse(localStorage.getItem("settings") as string)?.currency ||
            "₹"}{" "}
          {amount}
        </>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
  ];

  const filteredData = transactions.filter((item: any) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.amount.toString().includes(searchText) ||
      item.type.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
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
