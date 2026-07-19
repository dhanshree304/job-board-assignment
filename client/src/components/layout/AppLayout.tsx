import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-white !text-slate-900 dark:!bg-slate-800 dark:!text-slate-100",
          duration: 3500,
        }}
      />
    </div>
  );
}
