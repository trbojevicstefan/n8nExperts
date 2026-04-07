# Design System: n8nExperts Pro Max
**Project ID:** 17246086582472751706

## 1. Visual Theme & Atmosphere
The platform embraces a "Pro Max" premium dark aesthetic. It feels immersive, deep, and sophisticated, leveraging glassmorphism, subtle glowing effects, and a layered background grid. The atmosphere is highly technical yet inviting, perfect for a high-end expert marketplace. It balances deep blacks and slate grays with vibrant, glowing accent colors to guide the user's focus.

## 2. Color Palette & Roles

**Backgrounds & Surfaces:**
* **Abyssal Dark** (#05080e to #08111c): Used for the main body gradient background and deep base layers.
* **Glass Surface** (rgba(30, 19, 22, 0.7)): Used for glass-morphic cards with `backdrop-blur-md`, giving a translucent, dark reddish-brown tint that contrasts subtly.
* **Translucent Accent** (rgba(255, 255, 255, 0.05)): Used for secondary inner containers, hover states, and input backgrounds.
* **Soft Divider** (rgba(255, 255, 255, 0.1)): Used for borders on glass cards and dividers between content.

**Interactive & Accents:**
* **Primary Neon Pink** (#f42559): The core brand color. Used for primary buttons, active states, progress bars, and glowing shadows (`shadow-[0_0_15px_rgba(244,37,89,0.5)]`).
* **Success Emerald** (#10b981): Used for positive indicators, completed milestones, and online status dots.
* **Cool Cyan** (#84d8ff): Used for subtle hero glows and secondary accent "eyebrows".
* **Alert Rose** (#fb7185): Used for destructive actions or reporting issues.

**Typography Colors:**
* **Pristine White** (#ffffff): Used for primary headings, active tabs, and high-emphasis data points.
* **Slate Light** (#f1f5f9): Used for primary body text.
* **Slate Dim** (#94a3b8): Used for secondary body text, timestamps, labels, and less important information.

## 3. Typography Rules
* **Headings (Display / Heading):** Uses `Sora` (sans-serif). Features tight letter-spacing (`tracking-tight`), heavy weights (`font-black` or `font-bold`), and bright white color.
* **Body (Sans-serif):** Uses `Manrope` (sans-serif). Highly readable, used for all paragraphs, descriptions, and UI labels.
* **Eyebrows / Badges:** Often uppercase, very small (`text-[10px]`), heavily tracking/spaced, and bold, to denote status or categories.

## 4. Component Stylings
* **Buttons (Primary):** Solid `Primary Neon Pink` background, white text, bold typography, subtly rounded (`rounded-lg`), with a glowing drop shadow (`shadow-lg shadow-primary/20`).
* **Buttons (Secondary):** Translucent glass (`bg-white/5`), thin border (`border-white/10`), bold white text, subtly rounded (`rounded-lg`).
* **Cards / Containers:** Heavy glassmorphism. Background is mostly `bg-[#1e1316]/70` with `backdrop-blur-md`, a 1px `border-white/10` stroke, and gently rounded (`rounded-xl`).
* **Inputs / Chat Boxes:** Dark background (`bg-background-dark/50`), subtle 1px border (`border-white/10`), rounded (`rounded-lg`), focusing to a primary ring (`focus:ring-primary focus:border-primary`).
* **Badges / Status Pills:** Very small (`text-[10px]`), uppercase, bold, with a translucent background matching the text color (e.g., `text-emerald-500 bg-emerald-500/10`).

## 5. Layout Principles
* **Whitespace:** Generous breathing room. Main containers use `py-8` to `py-12`, with `gap-8` between main grid columns.
* **Structure:** Desktop-first focus with responsive stacking. Typically uses a large max-width container (`max-width-main`) centered with auto margins.
* **Visual Hierarchy:** Glows (using box-shadow) and high-contrast white text draw the eye to critical information, while deep backgrounds suppress secondary data.
