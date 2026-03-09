export default function Header() {
  return (
    <header className="bg-[#4a2200] border-b border-[#6a3210] py-6 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Mark Twain's Outgoing Letters: An Interactive History
        </h1>
        <p className="text-[#f4d4aa] mt-1 text-sm md:text-base">
          A visual exploration of ~12,722 outgoing letters drawn from the Mark Twain Project Online's catalogue of letters (1853–1910)
        </p>
      </div>
    </header>
  );
}
