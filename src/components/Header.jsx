export default function Header() {
  return (
    <header className="bg-black border-b border-yellow-400 py-6 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 tracking-tight">
          Mark Twain Letters
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">
          Exploring ~12,722 outgoing letters from the Mark Twain Project Online (1853–1910)
        </p>
      </div>
    </header>
  );
}
