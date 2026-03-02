# Design System: n8nExperts Pro Max
**Project ID:** 17246086582472751706

## 1. Visual Theme & Atmosphere
The n8nExperts design system embodies a "High-Tech Professional" atmosphere. It is cinematic, dark-themed, and utilizes depth through glassmorphism and subtle glowing accents. The vibe is sophisticated, enterprise-ready, and energetic.

## 2. Color Palette & Roles
* **Primary Vibrancy (#f4258c):** A bold, energetic pink used for primary calls to action, highlights, and status indicators.
* **Deep Space Black (#0a0a0a):** The core background color providing a clean, dark canvas.
* **Surface Overlay (#161616):** Used for cards and secondary sections to create layered depth.
* **Ethereal White (#ffffff/opacity):** Used for high-contrast text and subtle borders.
* **Muted Slate (#64748b):** Used for secondary text and descriptions to maintain hierarchy.

## 3. Typography Rules
* **Manrope (Sans-serif):** The primary font family.
* **Headers:** Black (900) or Extra Bold (800) weights with tight letter-spacing for a modern, impactful look.
* **Body:** Medium (500) or Regular (400) weights for optimal readability on dark backgrounds.

## 4. Component Stylings
* **Buttons:**
    * **Primary:** High-vibrancy pink background, white text, 12px (xl) rounded corners, subtle shadow glow.
    * **Secondary:** Outlined or translucent background with thin borders, high-contrast text.
* **Cards/Containers:**
    * **Glassmorphism:** 70% opacity surface-dark background with 12px backdrop blur.
    * **Borders:** Thin (1px) borders with 10% primary color opacity.
    * **Roundness:** Generous 16px (xl) or 12px (lg) corners.
* **Inputs/Forms:**
    * **Style:** Dark background with thin borders, focus states using primary pink glow.

## 5. Layout Principles
* **Whitespace:** Generous padding (py-24, px-6) to allow components to breathe.
* **Grid Alignment:** Standard 7xl (1280px) container for balanced distribution.
* **Visual Effects:** 
    * **Radial Glows:** Subtle pink glows (blur-3xl) in section backgrounds to create focal points.
    * **Grid Patterns:** Faint radial dot patterns (opacity 0.1) for technical texture.

## 6. Design System Notes for Stitch Generation (FOR PROMPTS)
When prompting Stitch, always include this block:
"Apply the n8nExperts Pro Max design system: Premium dark mode canvas (#0a0a0a). Primary accents in Vibrancy Pink (#f4258c). Use Manrope typography with bold headers. All components should use glassmorphism effects (backdrop-filter: blur(12px)) and 16px rounded corners. Borders should be thin and translucent white/pink. Use high-quality Lucide/Material icons and maintain a spacious, professional enterprise layout."
