import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProductedRouteProps {
  children: React.ReactElement,
}

function ProductedRoute({ children }: ProductedRouteProps) {
  const token = localStorage.getItem("firebaseToken");
  if (token) {
    return children
  }
  return <Navigate to="/sign-in" replace />
}

export default ProductedRoute;