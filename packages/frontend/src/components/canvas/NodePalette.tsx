const categories = [
  { label: "Triggers", color: "border-l-green-500" },
  { label: "Context Skills", color: "border-l-yellow-500" },
  { label: "Models", color: "border-l-blue-500" },
  { label: "MCP Tools", color: "border-l-purple-500" },
];

export default function NodePalette() {
  return (
    <aside className="w-48 border-r border-gray-800 bg-gray-900 p-3">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Blocks</h2>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className={`cursor-grab rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-750 border-l-2 ${cat.color}`}
            draggable
          >
            {cat.label}
          </div>
        ))}
      </div>
    </aside>
  );
}
