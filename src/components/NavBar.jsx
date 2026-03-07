const tabs = ['Overview', 'People Explorer', 'Correspondence Progression', 'Individual Lookup'];

export default function NavBar({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-zinc-900 border-b border-zinc-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto gap-1 py-2">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === i
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
