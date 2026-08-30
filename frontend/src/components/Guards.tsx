import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "./ui";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, profile } = useAuth();
  if (loading) return <LoadingState label="Loading Career Guide AI…" />;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (profile && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export function RequireProfileOnly({ children }: { children: ReactNode }) {
  // Used for the onboarding route: must be signed in, but onboarding itself
  // is how onboarding_complete becomes true, so we don't redirect on that.
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingState label="Loading Career Guide AI…" />;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}
