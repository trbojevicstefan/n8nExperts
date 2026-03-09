import { useEffect } from "react";

type PageMetaInput = {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  noIndex?: boolean;
};

const ensureMetaTag = (nameOrProperty: string, value: string, mode: "name" | "property") => {
  const selector = mode === "name" ? `meta[name="${nameOrProperty}"]` : `meta[property="${nameOrProperty}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(mode, nameOrProperty);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
};

const ensureLinkTag = (rel: string, href: string) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

export function usePageMeta({ title, description, canonicalPath, ogImage, noIndex = false }: PageMetaInput) {
  useEffect(() => {
    document.title = title;

    if (description) {
      ensureMetaTag("description", description, "name");
      ensureMetaTag("og:title", title, "property");
      ensureMetaTag("og:description", description, "property");
      ensureMetaTag("twitter:title", title, "name");
      ensureMetaTag("twitter:description", description, "name");
    }

    ensureMetaTag("og:type", "website", "property");
    ensureMetaTag("twitter:card", ogImage ? "summary_large_image" : "summary", "name");
    ensureMetaTag("robots", noIndex ? "noindex,nofollow" : "index,follow", "name");

    if (ogImage) {
      ensureMetaTag("og:image", ogImage, "property");
      ensureMetaTag("twitter:image", ogImage, "name");
    }

    if (canonicalPath && typeof window !== "undefined") {
      const canonicalUrl = new URL(canonicalPath, window.location.origin).toString();
      ensureLinkTag("canonical", canonicalUrl);
      ensureMetaTag("og:url", canonicalUrl, "property");
    }
  }, [title, description, canonicalPath, ogImage, noIndex]);
}
