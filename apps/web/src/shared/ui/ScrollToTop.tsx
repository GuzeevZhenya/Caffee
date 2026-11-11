import { useEffect } from "react";
import { useLocation } from "react-router";

/** При смене маршрута мгновенно прокручивает окно к верху страницы. */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);

  return null;
}
