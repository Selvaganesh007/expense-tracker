import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../../redux/store";

interface ProductedRouteProps {
  children: React.ReactElement;
}

function ProductedRoute({ children }: ProductedRouteProps) {
  const { currentUser, loading } = useAppSelector((state) => state.auth);

  if (loading) return;
  // redirect only after loading is finished
  if (!currentUser.email) return <Navigate to="/sign-in" replace />;

  return children;
}

export default ProductedRoute;
