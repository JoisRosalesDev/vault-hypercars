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
    <div className="min-h-screen bg-[#08080a] text-white font-sans relative overflow-hidden flex flex-col justify-between selection:bg-[#f5d061] selection:text-black">
      {/* Toast Notification Banner */}
      <ToastNotification />

      {/* Sticky Glassmorphism Header / Navbar */}
      <Navbar />

      {/* Hero Section with Video Background */}
      <Hero />

      {/* Catalog */}
      <Catalogo />

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
