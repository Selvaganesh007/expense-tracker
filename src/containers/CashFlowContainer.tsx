import React, { useContext, useEffect, useState } from "react";
import { DB_COLLECTION_NAMES } from "../Constents/DB_COLLECTION_CONST";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { AppContext } from "../Context/AppContext";
import { Button, Card, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";

function CashFlowContainer() {
  const { Text, Title } = Typography;
  const navigate = useNavigate();
  const { profileDetails } = useContext(AppContext);
  const [collectionList, setCollectionList] = useState<Record<string, any>[]>(
    []
  );
  const getCollectionList = async () => {
    const collectionRef = collection(db, DB_COLLECTION_NAMES.COLLECTION);
    const q = query(
      collectionRef,
      where("user_id", "==", profileDetails.user_id)
    );
    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs.map((doc) => {
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
    setCollectionList(result);
  };

  useEffect(() => {
    if (profileDetails.user_id) getCollectionList();
  }, [profileDetails.user_id]);

  return (
    <Flex style={{ width: "100%", flexDirection: "column" }} gap={10}>
      <Title>Collection List</Title>
      <Flex gap={5} align="center" wrap style={{ width: "100%" }}>
        {collectionList.map((item: any) => {
          return (
            <Flex
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "AppWorkspace",
                padding: "10px",
                borderRadius: "5px",
              }}
              gap={5}
            >
              <Text>name - {item.name}</Text>
              <Button
                type="primary"
                onClick={() => navigate(`/home/cash-flow/${item.id}`)}
              >
                {" "}
                Add Income / Expense
              </Button>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}

export default CashFlowContainer;
