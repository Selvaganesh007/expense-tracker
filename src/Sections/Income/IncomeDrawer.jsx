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

const { Option } = Select;

function IncomeDrawer({
  drawerOpen,
  onDrawerClose,
  incomeDetails,
  setIncomeDetails,
  onIncomeAdd,
  incomeTypes,
  setIncomeTypes,
}) {
  const handleChange = (field, value) => {
    setIncomeDetails({
      ...incomeDetails,
      [field]: value,
    });
  };

  const handleTypeChange = (value) => {
    if (value && !incomeTypes.includes(value)) {
      const updatedTypes = [...incomeTypes, value];
      setIncomeTypes(updatedTypes);
      localStorage.setItem("incomeTypes", JSON.stringify(updatedTypes)); // ✅ store immediately
    }
    handleChange("type", value);
  };

  return (
    <Drawer
      title={incomeDetails.incomeID ? "Edit Income" : "Add New Income"}
      placement="right"
      width={400}
      onClose={onDrawerClose}
      open={drawerOpen}
      extra={
        <Space>
          <Button onClick={onDrawerClose}>Cancel</Button>
          <Button type="primary" onClick={onIncomeAdd}>
            {incomeDetails.incomeID ? "Update" : "Add"}
          </Button>
        </Space>
      }
    >
      <label>Name</label>
      <Input
        placeholder="Income name"
        value={incomeDetails.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />

      <label style={{ marginTop: 16 }}>Type</label>
      <Select
        showSearch
        placeholder="Select or add type"
        value={incomeDetails.type || undefined}
        onChange={handleTypeChange}
        style={{ width: "100%" }}
      >
        {incomeTypes.map((type) => (
          <Option key={type} value={type}>
            {type}
          </Option>
        ))}
      </Select>

      <label style={{ marginTop: 16 }}>Amount</label>
      <Input
        type="number"
        placeholder="Amount"
        value={incomeDetails.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
      />

      <label style={{ marginTop: 16 }}>Date</label>
      <DatePicker
        style={{ width: "100%" }}
        value={incomeDetails.date ? dayjs(incomeDetails.date) : null}
        onChange={(date, dateString) => handleChange("date", dateString)}
      />

      <label style={{ marginTop: 16 }}>Time</label>
      <TimePicker
        style={{ width: "100%" }}
        value={incomeDetails.time ? dayjs(incomeDetails.time, "HH:mm") : null}
        onChange={(time, timeString) => handleChange("time", timeString)}
      />
    </Drawer>
  );
}

export default IncomeDrawer;
