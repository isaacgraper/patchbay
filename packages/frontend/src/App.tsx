import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import WorkflowEditor from "./pages/WorkflowEditor";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="workflows/:id" element={<WorkflowEditor />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
