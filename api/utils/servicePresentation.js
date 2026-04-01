const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const cleanString = (value) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

const clamp = (value, maxLength) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
};

export const normalizeServiceFeatures = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanString(String(item)))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => cleanString(item))
      .filter(Boolean);
  }

  return [];
};

export const deriveShortTitle = (title) => clamp(cleanString(title), 70);

export const deriveShortDesc = ({ shortDesc, bestFor, desc, features }) => {
  const preferred = cleanString(shortDesc) || cleanString(bestFor);
  if (preferred) {
    return clamp(preferred, 160);
  }

  const firstFeature = Array.isArray(features) ? cleanString(features[0]) : "";
  if (firstFeature) {
    return clamp(`Includes ${firstFeature.toLowerCase()}.`, 160);
  }

  return clamp(cleanString(desc), 160);
};

export const buildServiceDescription = ({ desc, features, bestFor }) => {
  const cleanDesc = cleanString(desc);
  if (cleanDesc) {
    return cleanDesc;
  }

  const normalizedFeatures = normalizeServiceFeatures(features);
  const cleanBestFor = cleanString(bestFor);
  const sections = [];

  if (normalizedFeatures.length > 0) {
    sections.push(["Included:", ...normalizedFeatures.map((item) => `- ${item}`)].join("\n"));
  }

  if (cleanBestFor) {
    sections.push(`Best for:\n${cleanBestFor}`);
  }

  return sections.join("\n\n").trim();
};

export const normalizeServicePayload = (payload, existing = {}) => {
  const titleSource = hasOwn(payload, "title") ? payload.title : existing.title;
  const featuresSource = hasOwn(payload, "features") ? payload.features : existing.features;
  const bestForSource = hasOwn(payload, "bestFor") ? payload.bestFor : existing.bestFor;
  const descSource = hasOwn(payload, "desc") ? payload.desc : existing.desc;
  const shortTitleSource = hasOwn(payload, "shortTitle") ? payload.shortTitle : existing.shortTitle;
  const shortDescSource = hasOwn(payload, "shortDesc") ? payload.shortDesc : existing.shortDesc;
  const coverSource = hasOwn(payload, "cover") ? payload.cover : existing.cover;
  const serviceTypeSource = hasOwn(payload, "serviceType") ? payload.serviceType : existing.serviceType;
  const priceSource = hasOwn(payload, "price") ? payload.price : existing.price;
  const deliveryTimeSource = hasOwn(payload, "deliveryTime") ? payload.deliveryTime : existing.deliveryTime;
  const revisionNumberSource = hasOwn(payload, "revisionNumber") ? payload.revisionNumber : existing.revisionNumber;

  const title = cleanString(titleSource);
  const features = normalizeServiceFeatures(featuresSource);
  const bestFor = cleanString(bestForSource);
  const desc = buildServiceDescription({ desc: descSource, features, bestFor });
  const shortTitle = cleanString(shortTitleSource) || deriveShortTitle(title);
  const shortDesc = deriveShortDesc({ shortDesc: shortDescSource, bestFor, desc, features });
  const cover = cleanString(coverSource);

  return {
    ...(hasOwn(payload, "title") || existing.title !== undefined ? { title } : {}),
    ...(hasOwn(payload, "desc") || existing.desc !== undefined || features.length > 0 || bestFor ? { desc } : {}),
    ...(hasOwn(payload, "features") || existing.features !== undefined ? { features } : {}),
    ...(hasOwn(payload, "bestFor") || existing.bestFor !== undefined ? { bestFor: bestFor || undefined } : {}),
    ...(hasOwn(payload, "shortTitle") || existing.shortTitle !== undefined || title ? { shortTitle } : {}),
    ...(hasOwn(payload, "shortDesc") || existing.shortDesc !== undefined || desc ? { shortDesc } : {}),
    ...(hasOwn(payload, "cover") || existing.cover !== undefined ? { cover: cover || undefined } : {}),
    ...(serviceTypeSource !== undefined ? { serviceType: serviceTypeSource } : {}),
    ...(priceSource !== undefined ? { price: priceSource } : {}),
    ...(deliveryTimeSource !== undefined ? { deliveryTime: deliveryTimeSource } : {}),
    ...(revisionNumberSource !== undefined ? { revisionNumber: revisionNumberSource } : {}),
  };
};
