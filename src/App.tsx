import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Base from "./Base";
import Auth from "./views/Auth/Auth";
import NotFound from "./views/Auth/NotFound/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<Auth />} />
        <Route path="/sign-up" element={<Auth />} />
        <Route path="/" element={<Base />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
