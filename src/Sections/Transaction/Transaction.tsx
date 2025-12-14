import React, { useState, useEffect } from "react";
import "./Transaction.scss";
import { Button, Input, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { DB_COLLECTION_NAMES } from "../../Utils/DB_COLLECTION_CONST";
import { db } from "../../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Loader from "../../helpers/Loader";
import { useAppSelector } from "../../redux/store";
import { UserState } from "../../redux/auth/authSlice";
import { MdDelete, MdEditSquare } from "react-icons/md";
import { CiMenuKebab } from "react-icons/ci";

const { Search } = Input;

function Transaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const profileDetails: UserState = useAppSelector((state) => state.auth);

  const [transactionList, setTransactionList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [collectionName, setCollectionName] = useState("My Collection");
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);

  useEffect(() => {
    if (profileDetails.currentUser.user_id) {
      getTransactionList();
      getCollectionName();
    }
  }, [profileDetails.currentUser.user_id]);

  const getCollectionName = async () => {
    const snap = await getDocs(
      query(
        collection(db, DB_COLLECTION_NAMES.COLLECTION),
        where("__name__", "==", id)
      )
    );
    if (!snap.empty) setCollectionName(snap.docs[0].data().name);
  };

  const getTransactionList = async () => {
    setLoading(true);
    const ref = collection(db, DB_COLLECTION_NAMES.TRANSACTION);

    const q = query(
      ref,
      where("user_id", "==", profileDetails.currentUser.user_id),
      where("collection_id", "==", id),
      orderBy("datetime", "desc")
    );

    const snap = await getDocs(q);

    let income = 0;
    let expense = 0;

    const list = snap.docs.map((d) => {
      const data = d.data();
      if (data.cashFlowType === "income") income += data.amount;
      if (data.cashFlowType === "expense") expense += data.amount;

      return {
        id: d.id,
        ...data,
        updated_at: data.updated_at?.seconds
          ? new Date(data.updated_at.seconds * 1000).toLocaleString()
          : "-",
      };
    });

    setIncomeTotal(income);
    setExpenseTotal(expense);
    setTransactionList(list);
    setLoading(false);
  };

  const onDelete = async (tid: string) => {
    if (window.confirm("Delete this transaction?")) {
      await deleteDoc(doc(db, DB_COLLECTION_NAMES.TRANSACTION, tid));
      setTransactionList((prev) => prev.filter((t) => t.id !== tid));
    }
  };

  const filtered = transactionList.filter(
    (t) =>
      t.name.toLowerCase().includes(searchText.toLowerCase()) ||
      t.amount.toString().includes(searchText)
  );

  const getMenu = (exp: any): MenuProps["items"] => [
    {
      key: "edit",
      label: "Edit",
      icon: <MdEditSquare />,
      onClick: () => navigate(`/collection/${id}/${exp.id}`),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <MdDelete />,
      danger: true,
      onClick: () => onDelete(exp.id),
    },
  ];

  return (
    <div className="expense">
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* ================= HEADER ================= */}
          <div className="expense_header">
            <div className="header_top">
              <div className="header_title">
                <h2>{collectionName}</h2>
                <span>Transaction overview</span>
              </div>

              <div className="header_actions">
                <Search
                  placeholder="Search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button
                  type="primary"
                  onClick={() => navigate(`/collection/${id}/new`)}
                >
                  + Add
                </Button>
              </div>
            </div>

            <div className="header_stats">
              <div className="stat income">
                <label>Total Income</label>
                <p>₹ {incomeTotal.toLocaleString()}</p>
              </div>

              <div className="stat expense">
                <label>Total Expense</label>
                <p>₹ {expenseTotal.toLocaleString()}</p>
              </div>

              <div className="stat balance">
                <label>Balance</label>
                <p>
                  ₹ {(incomeTotal - expenseTotal).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ================= TABLE VIEW (DESKTOP) ================= */}
          <div className="transaction_table_wrapper">
            <table className="transaction_table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Mode</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.name}</td>
                    <td>
                      <span className="txn-tag tag-type">{exp.type}</span>
                    </td>

                    <td>
                      <span className="txn-tag tag-mode">{exp.transactionMode}</span>
                    </td>
                    <td>{exp.updated_at}</td>
                    <td
                      className={`amount ${exp.cashFlowType === "income"
                        ? "income"
                        : "expense"
                        }`}
                    >
                      {exp.cashFlowType === "income" ? "+" : "-"} ₹{exp.amount}
                    </td>
                    <td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => navigate(`/collection/${id}/${exp.id}`)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => onDelete(exp.id)}
                        >
                          Delete
                        </button>
                      </td>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= CARD VIEW (MOBILE) ================= */}
          <div className="expense_list">
            {filtered.map((exp) => (
              <div
                key={exp.id}
                className="expense_item"
                data-type={exp.cashFlowType}
              >
                <div className="transaction_name">{exp.name}</div>

                <Dropdown
                  menu={{ items: getMenu(exp) }}
                  trigger={["click"]}
                >
                  <CiMenuKebab className="transaction_menu" />
                </Dropdown>

                <div
                  className={`expense_item-amount ${exp.cashFlowType === "income"
                    ? "income"
                    : "expense"
                    }`}
                >
                  ₹ {exp.amount}
                  {exp.cashFlowType === "income" ? "+" : "-"}
                </div>

                <div className="transaction_updatedat">
                  {exp.updated_at}
                </div>

                <div className="transaction_types">
                  <span>{exp.type}</span>
                  <span>{exp.transactionMode}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Transaction;
