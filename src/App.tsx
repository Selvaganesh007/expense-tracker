import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Base from "./Base";
import Auth from "./views/Auth/Auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<Auth />} />
        <Route path="/sign-up" element={<Auth />} />
        <Route path="/" element={<Base />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
