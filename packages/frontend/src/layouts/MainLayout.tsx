import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
