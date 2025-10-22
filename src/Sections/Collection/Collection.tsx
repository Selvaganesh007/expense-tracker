import React, { useState, useEffect, useContext } from "react";
import "./Collection.scss";
import { Button, Input, Modal } from "antd";
import { AppContext } from "../../Context/AppContext";
import { addDoc, deleteDoc, doc, getDocs, serverTimestamp, updateDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase";
import { DB_COLLECTION_CONST } from "../../Constents/DB_COLLECTION_CONST";

const { Search } = Input;

const DEFAULT_COLLECTION = {
  name: "",
  user_id: "",
};

export interface CollectionType {
  name: string;
  user_id: string,
}

function Collection() {
  const { profileDetails } = useContext(AppContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collectionDetails, setCollectionDetails] = useState<CollectionType>(DEFAULT_COLLECTION);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

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
    console.log("profileDetails", profileDetails);
    await addDoc(collection(db, DB_COLLECTION_CONST.collection), {
      ...collectionDetails,
      user_id: profileDetails.user_id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    onDrawerClose();

    // if (!collectionDetails.id) {
    //   await addDoc(collection(db, DB_COLLECTION_CONST.collection, collectionDetails.id), {
    //     ...collectionDetails,
    //     created_at: serverTimestamp(),
    //     updated_at: serverTimestamp(),
    //   });
    //   const querySnapshot = await getDocs(collection(db, DB_COLLECTION_CONST.collection));
    //   querySnapshot.forEach((doc) => {
    //     console.log(doc.id, " => ", doc.data());
    //   });
    // } else {
    //   const expenseRef = doc(db, DB_COLLECTION_CONST.collection);
    //   await updateDoc(expenseRef, {
    //     ...collectionDetails,
    //     updated_at: serverTimestamp(),
    //   });
    // }
    // onDrawerClose();
  };

  const onEdit = (expense: any) => {
    setCollectionDetails(expense);
    setDrawerOpen(true);
  };

  // const onDelete = async (id: string) => {
  //   if (!window.confirm("Are you sure you want to delete this collection?"))
  //     return;
  //   try {
  //     await deleteDoc(collection(db, DB_COLLECTION_CONST.collection, id));
  //     // fetchExpenses(); // refresh the table
  //   } catch (error) {
  //     console.error("Error deleting expense:", error);
  //   }
  // };

  // const filteredCollection = collection.filter((exp: any) => {
  //   const matchesSearch =
  //     exp.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
  //     exp.amount.toString().includes(debouncedSearchText);
  //   return matchesSearch;
  // });

  const handleChange = (field: string, value: any) => {
    setCollectionDetails({
      ...collectionDetails,
      [field]: value,
    });
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
      {/* <div className="collection_list">
        {filteredCollection.length === 0 && (
          <p>No collection name match your search.</p>
        )}
        {filteredCollection.map((exp: any) => (
          <div key={exp.id} className="colletion_item">
            <div>{exp.name}</div>
            <div>{exp.type}</div>
            <div className="collection_item-action">
              <Button type="primary" onClick={() => onEdit(exp)}>
                Edit
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => onDelete(exp.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div> */}
      <Modal
        title="Add New Collection"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={drawerOpen}
        onOk={() => onCollectionAdd()}
        onCancel={onDrawerClose}
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
