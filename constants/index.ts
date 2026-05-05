export const navLinks = [
  { label: "Home", route: "/", icon: "🏠" },
  { label: "Image Restore", route: "/transformations/add/restore", icon: "🖼️" },
  { label: "Generative Fill", route: "/transformations/add/fill", icon: "✨" },
  { label: "Object Remove", route: "/transformations/add/remove", icon: "🗑️" },
  { label: "Object Recolor", route: "/transformations/add/recolor", icon: "🎨" },
  { label: "Background Remove", route: "/transformations/add/removeBackground", icon: "📷" },
  { label: "Generative Replace", route: "/transformations/add/replace", icon: "🔄" },
  { label: "Smart Crop", route: "/transformations/add/smartcrop", icon: "✂️" },
  { label: "Text to Image", route: "/ai/text-to-image", icon: "🎨" },
  { label: "Image Analyzer", route: "/ai/image-analyzer", icon: "🔍" },
  { label: "Profile", route: "/profile", icon: "👤" },
  { label: "Buy Credits", route: "/credits", icon: "💳" },
];

// Prices in INR (₹)
export const plans = [
  {
    _id: 1,
    name: "Free",
    icon: "⚡",
    price: 0,
    credits: 20,
    inclusions: [
      { label: "20 Free Credits", isIncluded: true },
      { label: "Basic Access to Services", isIncluded: true },
      { label: "Priority Customer Support", isIncluded: false },
      { label: "Priority Updates", isIncluded: false },
    ],
  },
  {
    _id: 2,
    name: "Pro Package",
    icon: "⚡",
    price: 1999,
    credits: 120,
    inclusions: [
      { label: "120 Credits", isIncluded: true },
      { label: "Full Access to Services", isIncluded: true },
      { label: "Priority Customer Support", isIncluded: true },
      { label: "Priority Updates", isIncluded: false },
    ],
  },
  {
    _id: 3,
    name: "Premium Package",
    icon: "⚡",
    price: 9999,
    credits: 2000,
    inclusions: [
      { label: "2000 Credits", isIncluded: true },
      { label: "Full Access to Services", isIncluded: true },
      { label: "Priority Customer Support", isIncluded: true },
      { label: "Priority Updates", isIncluded: true },
    ],
  },
];

export const transformationTypes = {
  restore: {
    type: "restore",
    title: "Restore Image",
    subTitle: "Refine images by removing noise and imperfections",
    config: { restore: true },
    icon: "🖼️",
  },
  removeBackground: {
    type: "removeBackground",
    title: "Background Remove",
    subTitle: "Removes the background of the image using AI",
    config: { removeBackground: true },
    icon: "📷",
  },
  fill: {
    type: "fill",
    title: "Generative Fill",
    subTitle: "Enhance an image's dimensions using AI outpainting",
    config: { fillBackground: true },
    icon: "✨",
  },
  remove: {
    type: "remove",
    title: "Object Remove",
    subTitle: "Identify and eliminate objects from images",
    config: { remove: { prompt: "", removeShadow: true, multiple: true } },
    icon: "🗑️",
  },
  recolor: {
    type: "recolor",
    title: "Object Recolor",
    subTitle: "Identify and recolor objects from the image",
    config: { recolor: { prompt: "", to: "", multiple: true } },
    icon: "🎨",
  },
  replace: {
  type: "replace",
  title: "Generative Replace",
  subTitle: "Replace any object in your image with AI-generated content",
  config: { replace: { from: "", to: "" } },
  icon: "🔄",
  },
  smartcrop: {
    type: "smartcrop",
    title: "Smart Crop",
    subTitle: "AI automatically crops and focuses on the most important subject",
    config: { smartCrop: true },
    icon: "✂️",
  },
};  

export const aspectRatioOptions = {
  "1:1": { aspectRatio: "1:1", label: "Square (1:1)", width: 1000, height: 1000 },
  "3:4": { aspectRatio: "3:4", label: "Standard Portrait (3:4)", width: 1000, height: 1334 },
  "9:16": { aspectRatio: "9:16", label: "Phone Portrait (9:16)", width: 1000, height: 1778 },
  "16:9": { aspectRatio: "16:9", label: "Landscape (16:9)", width: 1778, height: 1000 },
  "4:3": { aspectRatio: "4:3", label: "Standard Landscape (4:3)", width: 1334, height: 1000 },
};

export const smartCropAspectRatios = {
  "1:1": { label: "Square (1:1)", width: 800, height: 800 },
  "16:9": { label: "Landscape (16:9)", width: 1280, height: 720 },
  "4:3": { label: "Standard (4:3)", width: 1024, height: 768 },
  "9:16": { label: "Portrait (9:16)", width: 720, height: 1280 },
  "3:4": { label: "Portrait (3:4)", width: 768, height: 1024 },
};

export const defaultValues = {
  title: "",
  aspectRatio: "",
  color: "",
  prompt: "",
  publicId: "",
};

export const creditFee = -1;
