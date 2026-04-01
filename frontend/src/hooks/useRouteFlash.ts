import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type RouteFlash = {
  tone: "success" | "error" | "info";
  text: string;
};

type RouteFlashState = {
  flash?: RouteFlash;
};

export function useRouteFlash() {
  const location = useLocation();
  const navigate = useNavigate();

  const flash = useMemo(() => {
    const state = location.state as RouteFlashState | null;
    return state?.flash || null;
  }, [location.state]);

  useEffect(() => {
    if (!flash) return;

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  }, [flash, location.pathname, location.search, navigate]);

  return flash;
}
