---
page: DashboardOverview
---
A premium dark-themed Dashboard for logged-in users. It serves as a control center showing active jobs, overall metrics (Earnings/Spending), and recent messages. The layout is optimized for an ultra-modern marketplace application.

**DESIGN SYSTEM (REQUIRED):**
# Design System: n8nExperts Pro Max

## 1. Visual Theme & Atmosphere
The platform embraces a "Pro Max" premium dark aesthetic. It feels immersive, deep, and sophisticated, leveraging glassmorphism, subtle glowing effects, and a layered background grid. The atmosphere is highly technical yet inviting, perfect for a high-end expert marketplace. It balances deep blacks and slate grays with vibrant, glowing accent colors to guide the user's focus.

## 2. Color Palette & Roles
- Platform: Web, Desktop-first
- Theme: Dark, premium, technical
- Background: Abyssal Dark (#05080e rounded to #08111c)
- Surface/Card Background: Translucent Glass (rgba(30, 19, 22, 0.7)) with backdrop-blur
- Primary Accent: Neon Pink (#f42559) for glowing buttons, progress bars, active focuses
- Secondary Accent: Success Emerald (#10b981) for completed metrics, online indicators
- Text Primary: Pristine White (#ffffff) for headings / emphases
- Text Secondary: Slate Light (#f1f5f9) and Slate Dim (#94a3b8) for secondary info / bodies
- Card Borders: Soft Divider (rgba(255, 255, 255, 0.1))

## 3. Typography & Structure
- Buttons: Solid Primary Neon Pink, white text, bold typography, subtly rounded (lg), glowing drop shadow (shadow-lg shadow-primary/20).
- Cards: Heavy glassmorphism. Background is mostly bg-[#1e1316]/70 with backdrop blur, 1px border-white/10 stroke, and rounded (xl).
- Whitespace: Generous breathing room, typically large gaps (gap-8) and padding (p-6 or py-8) inside containers.

**Page Structure:**
1. **Header Section:** Greeting ("Welcome back, [Name]") and role-aware toggle or high-level status indicator.
2. **Key Metrics Row:** Top stats (Earnings this month $4500, Active Jobs 3, Completion Rate 98%).
3. **Main Content Split (2 columns / 1 column):**
   - **Active Projects Overview (Main Column):** Grid or list of high-level ongoing jobs, each showing progress bars and next milestone due.
   - **Recent Notifications & Communications (Side Column):** Recent messages feed and system alerts.
4. **Quick Actions:** Row of action buttons (Find Talent, Post a Project, Withdraw Funds).
