import { useState, useEffect, useContext } from "react";
import "./Collection.scss";
import { Button, Input, Modal } from "antd";
import { AppContext } from "../../Context/AppContext";
import {
  addDoc,
  getDocs,
  serverTimestamp,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { MdDelete, MdEditSquare } from "react-icons/md";
import { db } from "../../../firebase";
import { DB_COLLECTION_NAMES } from "../../Utils/DB_COLLECTION_CONST";
import { useNavigate } from "react-router-dom";
import Loader from "../../helpers/Loader";
import { useAppSelector } from "../../redux/store";
import { UserState } from "../../redux/auth/authSlice";

import { CollectionType } from "../../types";

const { Search } = Input;

const DEFAULT_COLLECTION = {
  name: "",
  user_id: "",
};

function Collection() {
  const navigate = useNavigate();
  const profileDetails: UserState = useAppSelector((state) => state.auth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [collectionDetails, setCollectionDetails] =
    useState<Pick<CollectionType, "name" | "user_id">>(DEFAULT_COLLECTION);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [collectionList, setCollectionList] = useState<CollectionType[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profileDetails.currentUser.user_id) getCollectionList();
  }, [profileDetails.currentUser.user_id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const onDrawerClose = () => {
    setDrawerOpen(false);
    setCollectionDetails(DEFAULT_COLLECTION);
    return true;
  };

  useEffect(() => {
    if (profileDetails.currentUser.user_id) getCollectionList();
  }, [profileDetails.currentUser.user_id, debouncedSearchText]);

  const getCollectionList = async () => {
    setLoading(true);
    const usersRef = collection(db, DB_COLLECTION_NAMES.COLLECTION);
    const q = query(
      usersRef,
      where("user_id", "==", profileDetails.currentUser.user_id)
    );
    const querySnapshot = await getDocs(q);

    // Fetch all collections
    const rawCollections = querySnapshot.docs.map((doc) => {
      const d = doc.data();
      const createdAt = d.created_at?.seconds
        ? new Date(d.created_at.seconds * 1000).toLocaleString()
        : "-";
      const updatedAt = d.updated_at?.seconds
        ? new Date(d.updated_at.seconds * 1000).toLocaleString()
        : "-";

      return {
        id: doc.id,
        name: d.name,
        user_id: d.user_id,
        created_at: createdAt,
        updated_at: updatedAt,
      };
    });

    // Filter by search text (debounced)
    const filtered = rawCollections.filter((col) =>
      col.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
    );

    // Fetch balance for each collection
    const withBalances = await Promise.all(
      filtered.map(async (col) => {
        const balance = await getCollectionBalance(col.id);
        return { ...col, balance };
      })
    );

    setCollectionList(withBalances);
    setLoading(false);
  };

  const getCollectionBalance = async (collectionId: string) => {
    try {
      const transactionRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
      const q = query(
        transactionRef,
        where("collection_id", "==", collectionId)
      );
      const querySnapshot = await getDocs(q);

      let income = 0;
      let expense = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const amount = Number(data.amount) || 0;
        if (data.cashFlowType === "income") income += amount;
        if (data.cashFlowType === "expense") expense += amount;
      });

      return income - expense; // ✅ balance = income - expense
    } catch (err) {
      console.error("Error fetching balance:", err);
      return 0;
    }
  };

  const onAddClick = () => {
    setCollectionDetails({ ...DEFAULT_COLLECTION });
    setIsEdit(false);
    setEditId(null);
    setDrawerOpen(true);
  };

  const onCollectionAdd = async () => {
    if (collectionDetails.name.trim() === "") {
      return window.alert("Please enter collection name");
    }

    if (isEdit && editId) {
      const docRef = doc(db, DB_COLLECTION_NAMES.COLLECTION, editId);
      await updateDoc(docRef, {
        ...collectionDetails,
        updated_at: serverTimestamp(),
      });
    } else {
      console.log(profileDetails);

      debugger;
      await addDoc(collection(db, DB_COLLECTION_NAMES.COLLECTION), {
        ...collectionDetails,
        user_id: profileDetails.currentUser.user_id,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }

    onDrawerClose();
    getCollectionList();
  };

  const onEditClick = (item: CollectionType) => {
    setCollectionDetails({
      name: item.name,
      user_id: profileDetails.currentUser.user_id,
    });
    setIsEdit(true);
    setEditId(item.id);
    setDrawerOpen(true);
  };

  const handleChange = (field: string, value: any) => {
    setCollectionDetails({
      ...collectionDetails,
      [field]: value,
    });
  };

  const onDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      await deleteDoc(doc(db, DB_COLLECTION_NAMES.COLLECTION, id));
      getCollectionList();
    }
  };

  return (
    <div className="collection">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="collection_header">
            <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
              Collection List
            </div>
            <Search
              placeholder="Search by collection name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200, marginRight: 16 }}
            />
            <Button type="primary" onClick={onAddClick}>
              Add collection
            </Button>
          </div>
          <div className="collection_list">
            {collectionList.map((value: CollectionType, id) => {
              return (
                <div
                  key={id}
                  className="collection_item"
                  onClick={() => {
                    navigate(`/collection/${encodeURIComponent(value.id)}`);
                  }}
                >
                  <div className="card_header">
                    <h4 className="collection_name" title={value.name}>
                      {value.name}
                    </h4>
                    <div className="collection_actions">
                      <Button
                        type="text"
                        className="action_btn edit_btn"
                        icon={<MdEditSquare />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(value);
                        }}
                      />
                      <Button
                        type="text"
                        className="action_btn delete_btn"
                        icon={<MdDelete />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(value.id);
                        }}
                        danger
                      />
                    </div>
                  </div>

                  <div className="card_body">
                    <span className="balance_label">Total Balance</span>
                    <div className="balance_amount">
                      ₹
                      {(value.balance ?? 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="card_footer">
                    <span className="updated_text">
                      Updated: {value.updated_at}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <Modal
            title={isEdit ? "Edit Collection" : "Add New Collection"}
            closable={{ "aria-label": "Custom Close Button" }}
            open={drawerOpen}
            onOk={() => onCollectionAdd()}
            onCancel={onDrawerClose}
            maskClosable={false}
          >
            <label>Name</label>
            <Input
              placeholder="Expense name"
              value={collectionDetails.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </Modal>
        </>
      )}
    </div>
  );
}

export default Collection;
