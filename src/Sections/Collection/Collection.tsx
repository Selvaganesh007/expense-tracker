import { useState, useEffect } from "react";
import "./Collection.scss";
import { Button, Input, Modal, Dropdown } from "antd";
import type { MenuProps } from "antd";
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
import { LuNotebookPen } from "react-icons/lu";
import { CiMenuKebab } from "react-icons/ci";

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
  const profileDetails: UserState = useAppSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [collectionDetails, setCollectionDetails] =
    useState<CollectionType>(DEFAULT_COLLECTION);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [collectionList, setCollectionList] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (profileDetails.currentUser.user_id) getCollectionList();
  }, [profileDetails.currentUser.user_id, debouncedSearchText]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  /* ---------------- Handlers ---------------- */

  const onDrawerClose = () => {
    setDrawerOpen(false);
    setCollectionDetails(DEFAULT_COLLECTION);
    setIsEdit(false);
    setEditId(null);
  };

  const onAddClick = () => {
    setDrawerOpen(true);
    setIsEdit(false);
    setEditId(null);
    setCollectionDetails(DEFAULT_COLLECTION);
  };

  const onCollectionAdd = async () => {
    if (!collectionDetails.name.trim()) {
      return alert("Please enter collection name");
    }

    if (isEdit && editId) {
      await updateDoc(
        doc(db, DB_COLLECTION_NAMES.COLLECTION, editId),
        {
          ...collectionDetails,
          updated_at: serverTimestamp(),
        }
      );
    } else {
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

  const onEditClick = (item: any) => {
    setCollectionDetails({
      name: item.name,
      user_id: profileDetails.currentUser.user_id,
    });
    setIsEdit(true);
    setEditId(item.id);
    setDrawerOpen(true);
  };

  const onDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      await deleteDoc(doc(db, DB_COLLECTION_NAMES.COLLECTION, id));
      getCollectionList();
    }
  };

  const handleChange = (field: string, value: any) => {
    setCollectionDetails({ ...collectionDetails, [field]: value });
  };

  /* ---------------- Firebase ---------------- */

  const getCollectionList = async () => {
    setLoading(true);
    const ref = collection(db, DB_COLLECTION_NAMES.COLLECTION);
    const q = query(ref, where("user_id", "==", profileDetails.currentUser.user_id));
    const snap = await getDocs(q);

    const collections = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data();
        const balance = await getCollectionBalance(d.id);

        return {
          id: d.id,
          name: data.name,
          balance,
          updated_at: data.updated_at?.seconds
            ? new Date(data.updated_at.seconds * 1000).toLocaleString()
            : "-",
        };
      })
    );

    const filtered = collections.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
    );

    setCollectionList(filtered);
    setLoading(false);
  };

  const getCollectionBalance = async (collectionId: string) => {
    const ref = collection(db, DB_COLLECTION_NAMES.TRANSACTION);
    const q = query(ref, where("collection_id", "==", collectionId));
    const snap = await getDocs(q);

    let income = 0;
    let expense = 0;

    snap.forEach((d) => {
      const data = d.data();
      const amount = Number(data.amount) || 0;
      if (data.cashFlowType === "income") income += amount;
      if (data.cashFlowType === "expense") expense += amount;
    });

    return income - expense;
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="collection">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="collection_header">
            <h2>Collection List</h2>
            <Search
              placeholder="Search by collection name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={onAddClick} size="large">
              Add collection
            </Button>
          </div>
          <div className="collection_list">
            {collectionList.map((value) => {
              const menuItems: MenuProps["items"] = [
                {
                  key: "edit",
                  label: "Edit",
                  icon: <MdEditSquare />,
                  onClick: ({ domEvent }) => {
                    domEvent.stopPropagation();
                    onEditClick(value);
                  },
                },
                {
                  key: "delete",
                  label: "Delete",
                  icon: <MdDelete />,
                  danger: true,
                  onClick: ({ domEvent }) => {
                    domEvent.stopPropagation();
                    onDeleteClick(value.id);
                  },
                },
              ];

              return (
                <div
                  key={value.id}
                  className="collection_item"
                  onClick={() =>
                    navigate(`/collection/${encodeURIComponent(value.id)}`)
                  }
                >
                  <div className="collection_icons">
                    <LuNotebookPen size="50px" />
                    <Dropdown
                      menu={{ items: menuItems }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <CiMenuKebab
                        size="22px"
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: "pointer" }}
                      />
                    </Dropdown>
                  </div>
                  <div className="collection_item_header">
                    <h4 className="collection_name">{value.name}</h4>
                    <h4>
                      Balance: ₹
                      {value.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </h4>
                    <h4>Updated on: {value.updated_at}</h4>
                  </div>
                </div>
              );
            })}
          </div>

          <Modal
            title={isEdit ? "Edit Collection" : "Add New Collection"}
            open={drawerOpen}
            onOk={onCollectionAdd}
            onCancel={onDrawerClose}
            maskClosable={false}
          >
            <label>Name</label>
            <Input
              placeholder="Collection name"
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
