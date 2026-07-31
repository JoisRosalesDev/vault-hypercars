# OpenSpec Proposal: Vault Hypercars E-Commerce & Admin Platform

## Overview
Vault Hypercars is an ultra-luxury automotive platform for purchasing hypercars from three exclusive brands: Bugatti, Lamborghini, and Ferrari. The project features a high-end dark luxury UI with glassmorphism navbar, background video loop hero, interactive purchasing cart with multi-currency conversion (USD, EUR, GBP, AED), and a secure Admin Dashboard for product CRUD operations with double confirmation.

## Technical Scope & Target Architecture
- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS v4 with custom dark luxury design system (`#08080a`, matte gold `#d4af37`, glassmorphism backdrop-blur)
- **State Management**: React Context (`CartContext`) for shopping cart persistence, item counts, and live currency rates
- **Icons**: SVG vector icons based on Lucide design system (zero emojis)
- **Routes**:
  - `/` - Main Landing Page (Hero video loop, Bugatti/Lamborghini/Ferrari Purchasing Catalog, Sticky Glassmorphism Navbar with Mobile Hamburger Menu, Footer with Admin Login link)
  - `/admin/login` - Secure Admin Login Page
  - `/admin/dashboard` - Admin Dashboard (Sales Analytics, Full Item CRUD with File/URL image upload, Edit Modal, and Double Confirmation Modal)

## Requirements & Constraints
1. **Brand Focus**: Strictly limited to Bugatti, Lamborghini, and Ferrari.
2. **Commerce Flow**: Hypercars are purchased directly via the Shopping Cart drawer.
3. **Hero Video**: Background loop utilizing `/Futuristic Sports Car Racing Through Illuminated Tunnel.mp4`.
4. **Admin Security & Double Confirmation**: All administrative actions (create, edit, delete) require secondary modal confirmation.
5. **No Emojis**: Interface relies strictly on vector SVG icons for a professional luxury aesthetic.

## Task Breakdown
- [x] Phase 1: Core Layout & Hero Video Integration
- [x] Phase 2: Bugatti, Lamborghini, and Ferrari Catalog & Shopping Cart Drawer
- [x] Phase 3: Admin Authentication & Dashboard with Sales Analytics
- [x] Phase 4: Active Item Edit Modal & Double Confirmation System
- [x] Phase 5: Sticky Glassmorphism Navbar, Mobile Hamburger Menu & Responsiveness
