import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function Settings() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-gray-400" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="space-y-6">
        <section className="rounded-lg border border-gray-800 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-300">
            MCP Server Connections
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Configure the MCP servers Patchbay can route to.
          </p>
          <div className="flex h-24 items-center justify-center rounded border border-dashed border-gray-700 text-sm text-gray-600">
            No servers configured yet.
          </div>
        </section>
        <section className="rounded-lg border border-gray-800 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-300">
            AI Model Providers
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            API keys and model preferences for cloud/local LLMs.
          </p>
          <div className="flex h-24 items-center justify-center rounded border border-dashed border-gray-700 text-sm text-gray-600">
            No providers configured yet.
          </div>
        </section>
        <div className="flex justify-end">
          <Button variant="secondary" disabled>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
