import React, { useContext, useEffect, useState } from "react";
import "./Settings.scss";
import { Button, Select, Switch, message, Upload, Input, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { AppContext } from "../../Context/AppContext";
import { DB_COLLECTION_NAMES } from "../../Utils/DB_COLLECTION_CONST";
import { db } from "../../../firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

const { Option } = Select;

interface TypeItem {
  label: string;
  value: string;
}

interface SettingsData {
  currency: string[];
  expense: string[];
  income: string[];
  isDarkTheme: boolean;
  transactionMode: string[];
}

function Settings() {
  const { profileDetails } = useContext(AppContext);

  const [newExpenseType, setNewExpenseType] = useState("");
  const [newIncomeType, setNewIncomeType] = useState("");
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<SettingsData>();

  // 🔹 Selected current theme/currency
  const [selectedCurrency, setSelectedCurrency] = useState<string>("₹");
  const [selectedTheme, setSelectedTheme] = useState<boolean>(false);

  // 🔹 Fetch user's settings
  useEffect(() => {
    if (!profileDetails.user_id) return;

    const fetchCollections = async () => {
      const colRef = collection(db, DB_COLLECTION_NAMES.COLLECTION);
      const q = query(colRef, where("user_id", "==", profileDetails.user_id));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCollections(list);
      if (list.length > 0) setSelectedCollection(list[0].id);
    };

    const fetchUserSettings = async () => {
      const colRef = collection(db, DB_COLLECTION_NAMES.USERS);
      const q = query(colRef, where("user_id", "==", profileDetails.user_id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const data = userDoc.data().settings;
        setSettingsData(data);
        setSelectedCurrency(data.currency?.[0] || "₹");
        setSelectedTheme(data.isDarkTheme || false);
      }
    };
    fetchCollections();
    fetchUserSettings();
  }, [profileDetails.user_id]);

  // 🔹 Fetch transactions
  useEffect(() => {
    if (!selectedCollection) return;
    const fetchTransactions = async () => {
      const txRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
      const q = query(txRef, where("collection_id", "==", selectedCollection));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(list);
    };
    fetchTransactions();
  }, [selectedCollection]);

  // 🔹 Update Firebase user settings
  const updateUserSettingsInDB = async (updatedSettings: SettingsData) => {
    try {
      const usersRef = collection(db, DB_COLLECTION_NAMES.USERS);
      const q = query(usersRef, where("user_id", "==", profileDetails.user_id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userDocRef = doc(db, DB_COLLECTION_NAMES.USERS, userDoc.id);
        await updateDoc(userDocRef, { settings: updatedSettings });
        setSettingsData(updatedSettings);
        message.success("Settings updated successfully!");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update settings in Firebase.");
    }
  };

  // 🔹 Update currency/theme in Firebase
  const updateSettings = async (field: "currency" | "isDarkTheme", value: string | boolean) => {
    if (!settingsData) return;
    const updated = { ...settingsData, [field]: [value] };
    if (field === "currency") setSelectedCurrency(value as string);
    if (field === "isDarkTheme") setSelectedTheme(value as boolean);
    await updateUserSettingsInDB(updated);
  };

  // 🔹 Expense / Income Type handlers
  const addExpenseType = async () => {
    if (!newExpenseType.trim() || !settingsData) return;
    const updated = {
      ...settingsData,
      expense: [...settingsData.expense, newExpenseType.trim()],
    };
    await updateUserSettingsInDB(updated);
    setNewExpenseType("");
  };

  const removeExpenseType = async (value: string) => {
    if (!settingsData) return;
    const updated = {
      ...settingsData,
      expense: settingsData.expense.filter((t) => t !== value),
    };
    await updateUserSettingsInDB(updated);
  };

  const addIncomeType = async () => {
    if (!newIncomeType.trim() || !settingsData) return;
    const updated = {
      ...settingsData,
      income: [...settingsData.income, newIncomeType.trim()],
    };
    await updateUserSettingsInDB(updated);
    setNewIncomeType("");
  };

  const removeIncomeType = async (value: string) => {
    if (!settingsData) return;
    const updated = {
      ...settingsData,
      income: settingsData.income.filter((t) => t !== value),
    };
    await updateUserSettingsInDB(updated);
  };

  const handleExport = () => {
    if (!transactions) return;
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "finance_data.xlsx");
    message.success("Exported successfully!");
  };

  return (
    <div className="settings glass-card">
      <h2>Settings</h2>

      {/* Currency */}
      <div className="settings_item">
        <label>Currency:</label>
        <Select
          value={selectedCurrency}
          onChange={(val) => updateSettings("currency", val)}
          style={{ width: 120 }}
        >
          {(settingsData?.currency || []).map((cur) => (
            <Option key={cur} value={cur}>
              {cur}
            </Option>
          ))}
        </Select>
      </div>
      {/* Theme */}
      <div className="settings_item">
        <label>Theme:</label>
        <Switch
          checked={selectedTheme}
          onChange={(checked) => updateSettings("isDarkTheme", checked)}
          checkedChildren="Dark"
          unCheckedChildren="Light"
        />
      </div>

      {/* Expense Types */}
      <div className="settings_item">
        <label>Expense Types:</label>
        <div>
          {(settingsData?.expense || []).map((type) => {
            const typeObj = typeof type === "string" ? { label: type, value: type } : type;
            return (
              <Tag
                key={typeObj.value}
                closable
                onClose={() => removeExpenseType(typeObj.value)}
                style={{ marginBottom: "5px" }}
              >
                {typeObj.label}
              </Tag>
            );
          })}
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

      {/* Income Types */}
      <div className="settings_item">
        <label>Income Types:</label>
        <div>
          {(settingsData?.income || []).map((type) => {
            const typeObj = typeof type === "string" ? { label: type, value: type } : type;
            return (
              <Tag
                key={typeObj.value}
                closable
                onClose={() => removeIncomeType(typeObj.value)}
                style={{ marginBottom: "5px" }}
              >
                {typeObj.label}
              </Tag>
            );
          })}
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

      {/* Export */}
      <div className="settings_item">
        <label>Export:</label>
        <Select
          style={{ width: 250, marginTop: 8 }}
          value={selectedCollection || undefined}
          onChange={(val) => setSelectedCollection(val)}
          placeholder="Select Collection"
        >
          {collections.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={handleExport}>
          Export Excel
        </Button>
      </div>
    </div>
  );
}

export default Settings;
