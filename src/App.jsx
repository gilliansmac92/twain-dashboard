import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { processData } from './utils/dataUtils';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Overview from './components/Overview';
import PeopleExplorer from './components/PeopleExplorer';
import CorrespondenceProgression from './components/CorrespondenceProgression';
import IndividualLookup from './components/IndividualLookup';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Papa.parse('/experiments/twainletterscsv.txt', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processed = processData(results.data);
          setData(processed);
        } catch (e) {
          setError('Failed to process data: ' + e.message);
        }
        setLoading(false);
      },
      error: (err) => {
        setError('Failed to load data: ' + err.message);
        setLoading(false);
      },
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-400 text-lg font-medium">Loading letters…</p>
          <p className="text-gray-500 text-sm mt-1">Parsing ~12,722 records</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-zinc-900 border border-red-800 rounded-lg">
          <p className="text-red-400 text-lg font-medium">Error</p>
          <p className="text-gray-400 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 0 && <Overview data={data} />}
        {activeTab === 1 && <PeopleExplorer data={data} />}
        {activeTab === 2 && <CorrespondenceProgression data={data} />}
        {activeTab === 3 && <IndividualLookup data={data} />}
      </main>
    </div>
  );
}
