import { NavLink } from "react-router-dom";
import {
  GitBranch,
  Settings,
  Workflow,
} from "lucide-react";

const links = [
  { to: "/", label: "Pipelines", icon: Workflow },
  { to: "/workflows/new", label: "New Pipeline", icon: GitBranch },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="flex w-56 flex-col border-r border-gray-800 bg-gray-900 p-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Workflow className="h-6 w-6 text-indigo-400" />
        <span className="text-lg font-semibold">Patchbay</span>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
