const tabs = ['Overview', 'People Explorer', 'Correspondence Progression', 'Individual Lookup', 'Network Graphs'];

export default function NavBar({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-white border-b border-[#ddd] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto gap-1 py-2">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === i
                  ? 'bg-[#4a2200] text-white'
                  : 'text-[#555] hover:text-[#4a2200] hover:bg-[#f0e8de]'
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
