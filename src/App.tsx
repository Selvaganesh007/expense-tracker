import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Base from "./Base";
import Auth from "./views/Auth/Auth";
import NotFound from "./views/Auth/NotFound/NotFound";
import ProductedRoute from "./views/Auth/NotFound/ProductedRoute";
import Collection from "./Sections/Collection/Collection";
import Dashboard from "./Sections/Dashboard/Dashboard";
import History from "./Sections/History/History";
import Settings from "./Sections/SettingsModule/Settings";
import CashFlow from "./views/Auth/CashFlow/CashFlow";
import CashFlowForm from "./containers/CashFlowForm";
import Transaction from "./Sections/Transaction/Transaction";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to sign-in */}
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        {/* Protected Base Layout */}
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
          <Route path="collection" element={<Collection />}>
            <Route index element={<Collection />} />
            <Route path="transaction" element={<Transaction />} />
          </Route>
          <Route path="cash-flow">
            <Route index element={<CashFlow />} />
            <Route path=":id" element={<CashFlowForm />} />
          </Route>
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/sign-in" element={<Auth />} />
        <Route path="/sign-up" element={<Auth />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
