import { useEffect } from "react";
import "./App.css";
import Base from "./Base";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { app, db } from "../firebase";

function App() {
  console.log("app", app);

  const test = async () => {
    await addDoc(collection(db, "test"), {
      name: "test123",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  };
  useEffect(() => {
    test();
  }, []);

  return (
    <div>
      <Base />
    </div>
  );
}

export default App;
