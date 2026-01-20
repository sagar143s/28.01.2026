"use client";
import ReduxProvider from "@/lib/ReduxProvider";
import Navbar from "@/components/Navbar";
import TopBarNotification from "@/components/TopBarNotification";
import Footer from "@/components/Footer";
import SupportBar from "@/components/SupportBar";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }) {
  return (
    <ReduxProvider>
      {/* <TopBarNotification /> */}
      <Navbar />
      <Toaster />
      {children}
      <SupportBar />
      <Footer />
    </ReduxProvider>
  );
}
