import { useEffect } from "react";

type PageMetaInput = {
  title: string;
  description?: string;
};

const ensureMetaTag = (nameOrProperty: string, value: string, mode: "name" | "property") => {
  const selector = mode === "name" ? `meta[name="${nameOrProperty}"]` : `meta[property="${nameOrProperty}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    if (mode === "name") {
      element.setAttribute("name", nameOrProperty);
    } else {
      element.setAttribute("property", nameOrProperty);
    }
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
};

export function usePageMeta({ title, description }: PageMetaInput) {
  useEffect(() => {
    document.title = title;
    if (description) {
      ensureMetaTag("description", description, "name");
      ensureMetaTag("og:title", title, "property");
      ensureMetaTag("og:description", description, "property");
    }
  }, [title, description]);
}

