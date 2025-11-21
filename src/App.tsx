import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Base from "./Base";
import Auth from "./views/Auth/Auth";
import NotFound from "./views/Auth/NotFound/NotFound";
import ProductedRoute from "./views/Auth/NotFound/ProductedRoute";
import Collection from "./Sections/Collection/Collection";
import Dashboard from "./Sections/Dashboard/Dashboard";
import History from "./Sections/History/History";
import Settings from "./Sections/SettingsModule/Settings";
import Transaction from "./Sections/Transaction/Transaction";
import ExpenseForm from "./containers/TransactionForm";
import Logout from "./views/Auth/log-out/Logout";
import ForgotPassword from "./views/Auth/forgot-password/ForgotPassword";
import { useAppDispatch } from "./redux/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  clearUserInfo,
  setInfoLoader,
  setUserInfo,
} from "./redux/auth/authSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setInfoLoader(true));
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setUserInfo({
            user_id: user.uid!,
            email: user.email!,
            display_name: user.displayName!,
            photoURL: user.photoURL!,
            emailVerified: user.emailVerified!,
          })
        );
      } else {
        dispatch(clearUserInfo());
      }
      dispatch(setInfoLoader(false));
    });

    return unsubscribe;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/sign-in" element={<Auth />} />
        <Route path="/sign-up" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProductedRoute>
              <Base />
            </ProductedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="collection" element={<Collection />} />
          <Route path="collection/:id" element={<Transaction />} />
          <Route path="collection/:id/:mode" element={<ExpenseForm />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
          <Route path="log-out" element={<Logout />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
