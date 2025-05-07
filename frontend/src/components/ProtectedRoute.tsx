"use client";

import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAuthenticated } from "@/utils/auth";

const ProtectedRoute = () => {
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isAuthenticated();
      setAuth(result);
    };

    checkAuth();
  }, []);

  if (auth === null) return <p>Loading...</p>;

  return auth ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;