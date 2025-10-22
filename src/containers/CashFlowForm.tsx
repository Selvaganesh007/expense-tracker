import React, { useContext, useState } from "react";
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
} from "antd";
import { typeOptions } from "../Constents/common";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import { DB_COLLECTION_NAMES } from "../Constents/DB_COLLECTION_CONST";
import { db } from "../../firebase";
import { AppContext } from "../Context/AppContext";
import { useParams } from "react-router-dom";

const { Item } = Form;
interface ExpenseFormValues {
  name: string;
  type: string;
  cashFlowType: "income" | "expense";
  amount: number;
  date: Dayjs;
  time: Dayjs;
}

const ExpenseForm: React.FC = () => {
  const { id } = useParams();
  console.log(id);

  const { profileDetails } = useContext(AppContext);
  const [form] = Form.useForm();

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
      amount: values.amount,
      datetime: firestoreTimestamp,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      collection_id: id,
      user_id: profileDetails.user_id,
    };
    console.log("Saved Data:", payload);
    await addDoc(collection(db, DB_COLLECTION_NAMES.CASH_FLOW), payload);
    form.resetFields();
  };

  const handleError = () => {
    message.error("Please fill all required fields correctly.");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: "1.5rem" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Add Expense / Income
        </h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={handleError}
          autoComplete="off"
        >
          <Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Enter name" size="large" />
          </Item>
          <Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Please select a type" }]}
          >
            <Select
              placeholder="Select type"
              size="large"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {typeOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Item>

          <Item
            label="Cash Flow Type"
            name="cashFlowType"
            rules={[
              { required: true, message: "Please select cash flow type" },
            ]}
          >
            <Radio.Group size="large" style={{ display: "flex", gap: "1rem" }}>
              <Radio.Button
                value="expense"
                style={{ flex: 1, textAlign: "center" }}
              >
                Expense
              </Radio.Button>
              <Radio.Button
                value="income"
                style={{ flex: 1, textAlign: "center" }}
              >
                Income
              </Radio.Button>
            </Radio.Group>
          </Item>
          <Form.Item
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
          </Form.Item>

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
          <Item style={{ marginTop: "1.5rem" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{
                borderRadius: 8,
                transition: "opacity 0.3s ease",
              }}
            >
              Submit
            </Button>
          </Item>
        </Form>
      </Card>
    </div>
  );
};

export default ExpenseForm;
