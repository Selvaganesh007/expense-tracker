import { useContext, useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Button,
  Card,
  Radio,
  Select,
  message,
  InputNumber,
  Spin,
} from "antd";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import { DB_COLLECTION_NAMES } from "../Utils/DB_COLLECTION_CONST";
import { db } from "../../firebase";
import { AppContext } from "../Context/AppContext";
import { useNavigate, useParams } from "react-router-dom";

const { Item } = Form;

interface OptionItem {
  label: string;
  value: string;
}

interface ExpenseFormValues {
  name: string;
  type: string;
  cashFlowType: "income" | "expense";
  transactionMode: string;
  amount: number;
  date: Dayjs;
  time: Dayjs;
}

const TransactionForm = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { id, mode } = useParams();
  const { profileDetails } = useContext(AppContext);
  const [docId, setDocId] = useState<string>("");
  const [selectedCashFlow, setSelectedCashFlow] = useState<string | null>(null);
  const [form] = Form.useForm();
  const isNew = mode === "new";

  // 🔹 State for dropdown data from Firebase
  const [incomeTypes, setIncomeTypes] = useState<OptionItem[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<OptionItem[]>([]);
  const [transactionModes, setTransactionModes] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Fetch user settings (income, expense, transactionMode)
  const fetchUserSettings = async () => {
    if (!profileDetails?.user_id) return;
    try {
      const usersRef = collection(db, DB_COLLECTION_NAMES.USERS);
      const q = query(usersRef, where("user_id", "==", profileDetails.user_id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const settings = userDoc.data().settings || {};
        setIncomeTypes(settings.income || []);
        setExpenseTypes(settings.expense || []);
        setTransactionModes(settings.transactionMode || []);
      }
    } catch (err) {
      console.error("Error fetching user settings:", err);
      messageApi.error("Failed to load settings from Firebase.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch existing transaction (for edit mode)
  const getExpenseById = async (transactionId: string) => {
    try {
      const docRef = doc(db, DB_COLLECTION_NAMES.TRANSACTION, transactionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const dateValue = dayjs(data.datetime.toDate());
        const timeValue = dayjs(data.datetime.toDate());
        form.setFieldsValue({
          name: data.name,
          type: data.type,
          cashFlowType: data.cashFlowType,
          transactionMode: data.transactionMode,
          amount: data.amount,
          date: dateValue,
          time: timeValue,
        });
        setSelectedCashFlow(data.cashFlowType);
        setDocId(docSnap.id);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  // 🔹 Add/Edit Transaction
  const handleSubmit = async (values: ExpenseFormValues) => {
    const combinedDateTime = dayjs(values.date)
      .hour(values.time.hour())
      .minute(values.time.minute())
      .second(0);
    const firestoreTimestamp = Timestamp.fromDate(combinedDateTime.toDate());
    const payload = {
      name: values.name,
      type: values.type,
      cashFlowType: values.cashFlowType,
      transactionMode: values.transactionMode,
      amount: values.amount,
      datetime: firestoreTimestamp,
      updated_at: serverTimestamp(),
      ...(isNew && {
        created_at: serverTimestamp(),
        user_id: profileDetails.user_id,
        collection_id: id,
      }),
    };

    try {
      if (isNew) {
        await addDoc(collection(db, DB_COLLECTION_NAMES.TRANSACTION), payload);
      } else {
        const docRef = doc(db, DB_COLLECTION_NAMES.TRANSACTION, docId);
        await updateDoc(docRef, payload);
      }
      form.resetFields();
      setDocId("");
      navigate(`/collection/${id}`);
      messageApi.success(
        `Transaction ${isNew ? "added" : "updated"} successfully.`
      );
    } catch (err) {
      console.error("Error submitting transaction:", err);
      messageApi.error(`Failed to ${isNew ? "add" : "update"} transaction.`);
    }
  };

  const handleError = () => {
    messageApi.error("Please fill all required fields correctly.");
  };

  useEffect(() => {
    fetchUserSettings();
  }, [profileDetails.user_id]);

  useEffect(() => {
    if (!isNew && mode) getExpenseById(mode);
  }, [isNew, mode]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Spin size="large" tip="Loading Settings..." />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {contextHolder}
      <Card
        style={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          {isNew ? "Add Transaction" : "Edit Transaction"}
        </h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={handleError}
          autoComplete="off"
          initialValues={{
            date: isNew ? dayjs() : undefined,
            time: isNew ? dayjs() : undefined,
          }}
        >
          {/* Name */}
          <Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Enter name" size="large" />
          </Item>

          {/* Cash Flow Type */}
          <Item
            label="Cash Flow Type"
            name="cashFlowType"
            rules={[
              { required: true, message: "Please select cash flow type" },
            ]}
          >
            <Radio.Group
              size="large"
              style={{ display: "flex", gap: "1rem" }}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCashFlow(value);
                form.setFieldValue("type", undefined);
              }}
            >
              <Radio.Button
                value="income"
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor:
                    selectedCashFlow === "income" ? "#16a34a" : "#fff",
                  color: selectedCashFlow === "income" ? "#fff" : "#16a34a",
                }}
              >
                Income
              </Radio.Button>
              <Radio.Button
                value="expense"
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor:
                    selectedCashFlow === "expense" ? "#dc2626" : "#fff",
                  color: selectedCashFlow === "expense" ? "#fff" : "#dc2626",
                }}
              >
                Expense
              </Radio.Button>
            </Radio.Group>
          </Item>

          {/* Type Dropdown */}
          <Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Please select a type" }]}
          >
            <Select
              placeholder={
                selectedCashFlow ? "Select type" : "Select cash flow type first"
              }
              size="large"
              disabled={!selectedCashFlow}
              allowClear
              showSearch
              optionFilterProp="label"
              options={(selectedCashFlow === "income"
                ? incomeTypes
                : selectedCashFlow === "expense"
                ? expenseTypes
                : []
              ).map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </Item>
          {/* Transaction Mode */}
          <Item label="Transaction Mode" name="transactionMode">
            <Select
              placeholder="Select transaction mode"
              size="large"
              allowClear
              showSearch
              optionFilterProp="label"
              options={transactionModes.map((item) => {
                return {
                  label: item,
                  value: item,
                };
              })}
            />
          </Item>

          {/* Amount */}
          <Item
            label="Amount"
            name="amount"
            rules={[
              { required: true, message: "Please enter an amount" },
              {
                type: "number",
                min: 0.01,
                message: "Amount must be greater than 0",
              },
            ]}
          >
            <InputNumber
              placeholder="Enter amount"
              size="large"
              style={{ width: "100%" }}
              min={0}
              step={0.01}
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: any) => value?.replace(/₹\s?|(,*)/g, "") ?? ""}
            />
          </Item>

          {/* Date */}
          <Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              size="large"
            />
          </Item>

          {/* Time */}
          <Item
            label="Time"
            name="time"
            rules={[{ required: true, message: "Please select a time" }]}
          >
            <TimePicker
              use12Hours
              format="h:mm a"
              minuteStep={5}
              style={{ width: "100%" }}
              showNow={false}
              size="large"
            />
          </Item>

          {/* Submit Button */}
          <Item style={{ marginTop: "1.5rem" }}>
            <Button type="primary" htmlType="submit" size="large" block>
              Submit
            </Button>
          </Item>
        </Form>
      </Card>
    </div>
  );
};

export default TransactionForm;
