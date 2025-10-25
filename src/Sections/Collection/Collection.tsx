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

import { db } from "../../../firebase";
import { DB_COLLECTION_NAMES } from "../../Utils/DB_COLLECTION_CONST";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const DEFAULT_COLLECTION = {
  name: "",
  user_id: "",
};

export interface CollectionType {
  name: string;
  user_id: string;
}

function Collection() {
  const navigate = useNavigate();
  const { profileDetails } = useContext(AppContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [collectionDetails, setCollectionDetails] =
    useState<CollectionType>(DEFAULT_COLLECTION);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [collectionList, setCollectionList] = useState<Record<string, any>[]>(
    []
  );

  useEffect(() => {
    if (profileDetails.user_id) getCollectionList();
  }, [profileDetails.user_id]);

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
    if (profileDetails.user_id) getCollectionList();
  }, [profileDetails.user_id, debouncedSearchText]);


  const getCollectionList = async () => {
    const usersRef = collection(db, DB_COLLECTION_NAMES.COLLECTION);
    const q = query(usersRef, where("user_id", "==", profileDetails.user_id));
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
  };


  const getCollectionBalance = async (collectionId: string) => {
    try {
      const transactionRef = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
      const q = query(transactionRef, where("collection_id", "==", collectionId));
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
      await addDoc(collection(db, DB_COLLECTION_NAMES.COLLECTION), {
        ...collectionDetails,
        user_id: profileDetails.user_id,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }

    onDrawerClose();
    getCollectionList();
  };


  const onEditClick = (item: any) => {
    setCollectionDetails({
      name: item.name,
      user_id: profileDetails.user_id,
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
        {collectionList.map((value, id) => {
          return (
            <div
              key={id}
              className="collection_item"
              onClick={() => {
                navigate(`/collection/${encodeURIComponent(value.id)}`);
              }}
            >
              <h4>{value.name}</h4>
              <h4>Balance: ₹{value.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              <div className="collection_item-action">
                <Button
                  type="primary"
                  size={"small"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(value);
                  }}
                >
                  Edit
                </Button>
                <Button type="primary" size={"small"} onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(value.id);
                }} danger>
                  Delete
                </Button>
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
    </div>
  );
}

export default Collection;
