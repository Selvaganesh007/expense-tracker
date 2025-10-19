import React, { useContext, useState } from "react";
import "./Settings.scss";
import {
  Button,
  Select,
  Switch,
  message,
  Upload,
  DatePicker,
  Input,
  Tag,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { AppContext } from "../../Context/AppContext";

const { Option } = Select;
const CURRENCIES = ["₹", "$", "€", "£", "¥"];

function Settings() {
  const {
    settings,
    setSettings,
    expenseTypes,
    setExpenseTypes,
    incomeTypes,
    setIncomeTypes,
  } = useContext(AppContext);

  const [date, setDate] = useState(null);
  const [dataType, setDataType] = useState("both");
  const [newExpenseType, setNewExpenseType] = useState("");
  const [newIncomeType, setNewIncomeType] = useState("");

  const currency = settings.currency || "₹";
  const theme = settings.theme || "light";

  const updateSettings = (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem("settings", JSON.stringify(updated));
    if (key === "theme") {
      document.body.setAttribute("data-theme", value);
    }
  };

  const addExpenseType = () => {
    if (newExpenseType && !expenseTypes.includes(newExpenseType)) {
      const updated = [...expenseTypes, newExpenseType];
      setExpenseTypes(updated);
      localStorage.setItem("expenseTypes", JSON.stringify(updated));
      setNewExpenseType("");
    }
  };

  const removeExpenseType = (type: string) => {
    const updated = expenseTypes.filter((t: any) => t !== type);
    setExpenseTypes(updated);
    localStorage.setItem("expenseTypes", JSON.stringify(updated));
  };

  const addIncomeType = () => {
    if (newIncomeType && !incomeTypes.includes(newIncomeType)) {
      const updated = [...incomeTypes, newIncomeType];
      setIncomeTypes(updated);
      localStorage.setItem("incomeTypes", JSON.stringify(updated));
      setNewIncomeType("");
    }
  };

  const removeIncomeType = (type: string) => {
    const updated = incomeTypes.filter((t: any) => t !== type);
    setIncomeTypes(updated);
    localStorage.setItem("incomeTypes", JSON.stringify(updated));
  };

  const handleExport = () => {
    const expenses =
      JSON.parse(localStorage.getItem("expenses") as string) || [];
    const income = JSON.parse(localStorage.getItem("income") as string) || [];
    let exportData: any[] = [];

    if (dataType === "expense" || dataType === "both") {
      exportData = exportData.concat(
        expenses
          .filter((e: any) =>
            date ? e.date.startsWith(dayjs(date).format("YYYY-MM")) : true
          )
          .map((e: any) => ({ ...e, type: "Expense" }))
      );
    }

    if (dataType === "income" || dataType === "both") {
      exportData = exportData.concat(
        income
          .filter((i: any) =>
            date ? i.date.startsWith(dayjs(date).format("YYYY-MM")) : true
          )
          .map((i: any) => ({ ...i, type: "Income" }))
      );
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, "finance_data.xlsx");
    message.success("Exported successfully!");
  };

  // const handleImport = (file) => {
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const data = JSON.parse(e.target.result);
  //     if (data.expenses)
  //       localStorage.setItem("expenses", JSON.stringify(data.expenses));
  //     if (data.income)
  //       localStorage.setItem("income", JSON.stringify(data.income));
  //     message.success("Data imported successfully!");
  //   };
  //   reader.readAsText(file);
  //   return false;
  // };

  const handleReset = () => {
    localStorage.clear();
    setSettings({ currency: "₹", theme: "light" });
    setExpenseTypes(["Travel", "Food", "Shopping"]);
    setIncomeTypes(["Salary", "Bonus"]);
    document.body.setAttribute("data-theme", "light");
    message.success("All data reset!");
  };

  return (
    <div className="settings glass-card">
      <h2>Settings</h2>

      <div className="settings_item">
        <label>Currency:</label>
        <Select
          value={currency}
          onChange={(val) => updateSettings("currency", val)}
          style={{ width: 120 }}
        >
          {CURRENCIES.map((cur) => (
            <Option key={cur} value={cur}>
              {cur}
            </Option>
          ))}
        </Select>
      </div>

      <div className="settings_item">
        <label>Theme:</label>
        <Switch
          checked={theme === "dark"}
          onChange={(checked) =>
            updateSettings("theme", checked ? "dark" : "light")
          }
          checkedChildren="Dark"
          unCheckedChildren="Light"
        />
      </div>

      <div className="settings_item">
        <label>Expense Types:</label>
        <div>
          {expenseTypes.map((type: any) => (
            <Tag
              key={type}
              closable
              onClose={() => removeExpenseType(type)}
              style={{ marginBottom: "5px" }}
            >
              {type}
            </Tag>
          ))}
          <Input
            placeholder="New expense type"
            value={newExpenseType}
            onChange={(e) => setNewExpenseType(e.target.value)}
            style={{ width: 200, marginRight: "8px" }}
          />
          <Button icon={<PlusOutlined />} onClick={addExpenseType}>
            Add
          </Button>
        </div>
      </div>

      <div className="settings_item">
        <label>Income Types:</label>
        <div>
          {incomeTypes.map((type: any) => (
            <Tag
              key={type}
              closable
              onClose={() => removeIncomeType(type)}
              style={{ marginBottom: "5px" }}
            >
              {type}
            </Tag>
          ))}
          <Input
            placeholder="New income type"
            value={newIncomeType}
            onChange={(e) => setNewIncomeType(e.target.value)}
            style={{ width: 200, marginRight: "8px" }}
          />
          <Button icon={<PlusOutlined />} onClick={addIncomeType}>
            Add
          </Button>
        </div>
      </div>

      <div className="settings_item">
        <label>Export:</label>
        <DatePicker
          picker="month"
          value={date}
          onChange={(d) => setDate(d)}
          style={{ marginRight: "1rem" }}
        />
        <Select
          value={dataType}
          onChange={setDataType}
          style={{ width: 120, marginRight: "1rem" }}
        >
          <Option value="expense">Expense</Option>
          <Option value="income">Income</Option>
          <Option value="both">Both</Option>
        </Select>
        <Button type="primary" onClick={handleExport}>
          Export Excel
        </Button>
      </div>

      <div className="settings_item">
        <label>Import:</label>
        <Upload beforeUpload={() => {}} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Upload JSON</Button>
        </Upload>
      </div>

      <div className="settings_item">
        <Button danger onClick={handleReset}>
          Reset All Data
        </Button>
      </div>
    </div>
  );
}

export default Settings;
