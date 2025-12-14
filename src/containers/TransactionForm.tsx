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
  Row,
  Col,
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
import "./TransactionForm.scss"; // Import custom styles
import { 
  FaMoneyBillWave, 
  FaTag, 
  FaCalendarAlt, 
  FaClock, 
  FaCreditCard 
} from "react-icons/fa";
import { BiCategory, BiArrowBack } from "react-icons/bi";

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
    <div className="transaction-form-container">
      {contextHolder}
      <Card
        className="glass-form-card"
        bordered={false}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
          <Button 
            type="text" 
            icon={<BiArrowBack style={{ fontSize: "1.5rem", color: "#fff" }} />} 
            onClick={() => navigate(`/collection/${id}`)}
            style={{ marginRight: "1rem" }}
          />
          <h2 style={{ margin: 0, flex: 1, textAlign: "center", paddingRight: "2.5rem" }}>
            {isNew ? "Add Transaction" : "Edit Transaction"}
          </h2>
        </div>

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
          {/* Cash Flow Type */}
          <Item
            name="cashFlowType"
            rules={[
              { required: true, message: "Please select cash flow type" },
            ]}
          >
            <Radio.Group
              className="custom-radio-group"
              size="large"
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCashFlow(value);
                form.setFieldValue("type", undefined);
              }}
            >
              <Radio.Button
                value="income"
                className={selectedCashFlow === "income" ? "income-active" : ""}
              >
                Income
              </Radio.Button>
              <Radio.Button
                value="expense"
                className={selectedCashFlow === "expense" ? "expense-active" : ""}
              >
                Expense
              </Radio.Button>
            </Radio.Group>
          </Item>

          <Row gutter={16}>
             {/* Name */}
             <Col xs={24} md={12}>
              <Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter a name" }]}
              >
                <Input 
                  placeholder="What is this for?" 
                  size="large" 
                  className="custom-input"
                  prefix={<FaTag style={{ color: "rgba(255,255,255,0.5)" }} />}
                />
              </Item>
            </Col>

            {/* Amount */}
            <Col xs={24} md={12}>
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
                  className="custom-input"
                  style={{ width: "100%",  }}
                  min={0}
                  step={0.01}
                  prefix={<FaMoneyBillWave style={{ color: "rgba(255,255,255,0.5)", marginRight: "8px" }} />}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value: any) => value?.replace(/₹\s?|(,*)/g, "") ?? ""}
                />
              </Item>
            </Col>
          </Row>

          <Row gutter={16}>
             {/* Type Dropdown */}
             <Col xs={24} md={12}>
              <Item
                label="Category"
                name="type"
                rules={[{ required: true, message: "Please select a category" }]}
              >
                <Select
                  placeholder={
                    selectedCashFlow ? "Select category" : "Select cash flow type first"
                  }
                  size="large"
                  disabled={!selectedCashFlow}
                  allowClear
                  showSearch
                  className="custom-input"
                  optionFilterProp="label"
                  suffixIcon={<BiCategory />}
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
            </Col>

            {/* Transaction Mode */}
            <Col xs={24} md={12}>
              <Item 
                label="Transaction Mode" 
                name="transactionMode"
                rules={[{ required: true, message: "Please select a transaction mode" }]}
              >
                <Select
                  placeholder="Select mode"
                  size="large"
                  allowClear
                  showSearch
                  className="custom-input"
                  optionFilterProp="label"
                  suffixIcon={<FaCreditCard />}
                  options={transactionModes.map((item) => {
                    return {
                      label: item,
                      value: item,
                    };
                  })}
                />
              </Item>
            </Col>
          </Row>

          <Row gutter={16}>
             {/* Date */}
             <Col xs={24} md={12}>
              <Item
                label="Date"
                name="date"
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  size="large"
                  className="custom-input"
                  suffixIcon={<FaCalendarAlt />}
                />
              </Item>
            </Col>

            {/* Time */}
            <Col xs={24} md={12}>
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
                  className="custom-input"
                  suffixIcon={<FaClock />}
                />
              </Item>
            </Col>
          </Row>

          {/* Submit Button */}
          <Item style={{ marginTop: "1rem" }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              className="submit-btn"
            >
              {isNew ? "Add Transaction" : "Update Transaction"}
            </Button>
          </Item>
        </Form>
      </Card>
    </div>
  );
};

export default TransactionForm;
