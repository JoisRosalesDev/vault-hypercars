"use client";

import React from "react";
import { CartProvider } from "./context/CartContext";
import { Navbar } from "./components/layout/Navbar";
import { Hero } from "./components/layout/Hero";
import { Catalogo } from "./components/catalog/Catalogo";
import { SiteFooter } from "./components/layout/SiteFooter";
import { CartDrawer } from "./components/cart/CartDrawer";
import { ToastNotification } from "./components/ui/ToastNotification";

function MainApp() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans relative overflow-hidden flex flex-col justify-between selection:bg-accent selection:text-accent-contrast">
      {/* Toast Notification Banner */}
      <ToastNotification />

      {/* Sticky Glassmorphism Header / Navbar */}
      <Navbar />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 flex flex-col">
        {/* Hero Section with Video Background */}
        <Hero />

        {/* Catalog */}
        <Catalogo />
      </main>

      {/* Footer */}
      <SiteFooter />

      {/* Shopping Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
