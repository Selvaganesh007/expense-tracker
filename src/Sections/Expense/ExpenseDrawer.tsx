import React from "react";
import {
  Drawer,
  Space,
  Button,
  Input,
  DatePicker,
  TimePicker,
  Select,
} from "antd";
import dayjs from "dayjs";
import { ExpenseType } from "./Expense";

const { Option } = Select;

interface ExpenseDrawerProps {
  drawerOpen: boolean;
  onDrawerClose: () => void;
  expenseDetails: ExpenseType;
  setExpenseDetails: React.Dispatch<React.SetStateAction<ExpenseType>>;
  onExpenseAdd: () => void;
  expenseTypes: any;
  setExpenseTypes: any;
}

function ExpenseDrawer({
  drawerOpen,
  onDrawerClose,
  expenseDetails,
  setExpenseDetails,
  onExpenseAdd,
  expenseTypes,
  setExpenseTypes,
}: ExpenseDrawerProps) {
  const handleChange = (field: string, value: any) => {
    setExpenseDetails({
      ...expenseDetails,
      [field]: value,
    });
  };

  const handleTypeChange = (value: any) => {
    if (value && !expenseTypes.includes(value)) {
      const updatedTypes = [...expenseTypes, value];
      setExpenseTypes(updatedTypes);
      localStorage.setItem("expenseTypes", JSON.stringify(updatedTypes)); // ✅ store immediately
    }
    handleChange("type", value);
  };

  return (
    <Drawer
      title={expenseDetails.expenseID ? "Edit Expense" : "Add New Expense"}
      placement="right"
      width={400}
      onClose={onDrawerClose}
      open={drawerOpen}
      extra={
        <Space>
          <Button onClick={onDrawerClose}>Cancel</Button>
          <Button type="primary" onClick={onExpenseAdd}>
            {expenseDetails.expenseID ? "Update" : "Add"}
          </Button>
        </Space>
      }
    >
      <label>Name</label>
      <Input
        placeholder="Expense name"
        value={expenseDetails.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />

      <label style={{ marginTop: 16 }}>Type</label>
      <Select
        showSearch
        placeholder="Select or add type"
        value={expenseDetails.type || undefined}
        onChange={handleTypeChange}
        style={{ width: "100%" }}
      >
        {expenseTypes.map((type: any) => (
          <Option key={type} value={type}>
            {type}
          </Option>
        ))}
      </Select>

      <label style={{ marginTop: 16 }}>Amount</label>
      <Input
        type="number"
        placeholder="Amount"
        value={expenseDetails.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
      />

      <label style={{ marginTop: 16 }}>Date</label>
      <DatePicker
        style={{ width: "100%" }}
        value={expenseDetails.date ? dayjs(expenseDetails.date) : null}
        onChange={(date, dateString) => handleChange("date", dateString)}
      />

      <label style={{ marginTop: 16 }}>Time</label>
      <TimePicker
        style={{ width: "100%" }}
        value={expenseDetails.time ? dayjs(expenseDetails.time, "HH:mm") : null}
        onChange={(time, timeString) => handleChange("time", timeString)}
      />
    </Drawer>
  );
}

export default ExpenseDrawer;
