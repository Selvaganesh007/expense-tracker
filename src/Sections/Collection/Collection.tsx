import React, { useState, useEffect, useContext } from "react";
import "./Collection.scss";
import { Button, Input, Modal, Table } from "antd";
import { AppContext } from "../../Context/AppContext";
import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  DB_COLLECTION_CONST,
  DB_COLLECTION_NAMES,
} from "../../Constents/DB_COLLECTION_CONST";

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
  const { profileDetails } = useContext(AppContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collectionDetails, setCollectionDetails] =
    useState<CollectionType>(DEFAULT_COLLECTION);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [collectionList, setCollectionList] = useState<Record<string, any>[]>(
    []
  );

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

  const onAddClick = () => {
    setCollectionDetails({ ...DEFAULT_COLLECTION });
    setDrawerOpen(true);
  };

  const onCollectionAdd = async () => {
    if (collectionDetails.name.trim() === "" || !collectionDetails.name) {
      return window.alert("Please enter collection name");
    }
    await addDoc(collection(db, DB_COLLECTION_NAMES.COLLECTION), {
      ...collectionDetails,
      user_id: profileDetails.user_id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    onDrawerClose();
  };

  const handleChange = (field: string, value: any) => {
    setCollectionDetails({
      ...collectionDetails,
      [field]: value,
    });
  };

  const getCollectionList = async () => {
    const usersRef = collection(db, DB_COLLECTION_NAMES.COLLECTION);
    const q = query(usersRef, where("user_id", "==", profileDetails.user_id));
    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs.map((doc) => {
      const d = doc.data();

      // convert Firestore timestamp to readable date
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
    setCollectionList(result);
  };

  useEffect(() => {
    if (profileDetails.user_id) getCollectionList();
  }, [profileDetails.user_id]);

  const columns = [
    {
      title: "Collection Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
    },
  ];
  console.log("collectionList", collectionList);

  return (
    <div className="collection">
      <div className="collection_header">
        <div>
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
        <div>
          <Table
            columns={columns}
            dataSource={collectionList}
            loading={false}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </div>
      </div>
      <Modal
        title="Add New Collection"
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
