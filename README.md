# Skill-Hiive

> A full-stack freelance marketplace to connect buyers and sellers, manage gigs, payments, and messaging.  
> Built as a production-ready portfolio project.

## 🔥 Live Demo  
*(---)*

## 📌 Table of Contents  
- [About](#about)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Screenshots](#screenshots)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Environment Variables](#environment-variables)  
  - [Install & Run (Local)](#install--run-local)  
- [Project Structure](#project-structure)  
- [API Endpoints](#api-endpoints)  
- [Database & Seeding](#database--seeding)  
- [Authentication](#authentication)  
- [Payments](#payments)  
- [Testing](#testing)  
- [Deployment](#deployment)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## About  
Skill-Hiive is a full-stack freelance marketplace where you can register as a **buyer** or **seller**, post/search gigs, chat, pay securely, and complete orders.  
This project shows off real-world features hiring managers look for: authentication, role-based access, file uploads, payments, RESTful API, React front-end, Node/Express backend.

---

## Features  
- User authentication (JWT + bcrypt)  
- Buyer & Seller roles with different permissions  
- Create, edit, delete gigs (seller)  
- Search, browse, and purchase gigs (buyer)  
- Secure image uploads (via Cloudinary)  
- Messaging / chat between buyers & sellers (optional)  
- Payment integration with Stripe  
- Order management, ratings & reviews  
- Responsive UI using React & SCSS

---

## Tech Stack  

**Frontend:**  
- React  
- React Router  
- State management (React Context, Redux or React Query)  
- SCSS / CSS Modules  
- Axios or Fetch API  

**Backend:**  
- Node.js  
- Express  
- MongoDB (Mongoose ORM)  
- JWT for auth  
- bcrypt for password hashing  
- Cloudinary for media uploads  
- Stripe for payments  

**Deployment:**  
- Render API + Cloudflare Pages frontend

See `RENDER_DEPLOY.md` for the Render API setup and `CLOUDFLARE_PAGES_DEPLOY.md` for the frontend setup.

---
