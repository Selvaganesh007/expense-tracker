import { useEffect } from "react";
import "./App.css";
import Base from "./Base";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { app, db } from "../firebase";

function App() {
  return (
    <div>
      <Base />
    </div>
  );
}

export default App;
