import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { processData } from './utils/dataUtils';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Overview from './components/Overview';
import PeopleExplorer from './components/PeopleExplorer';
import CorrespondenceProgression from './components/CorrespondenceProgression';
import IndividualLookup from './components/IndividualLookup';
import NetworkGraphs from './components/NetworkGraphs';

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
      <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4a2200] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#4a2200] text-lg font-medium">Loading letters…</p>
          <p className="text-[#888] text-sm mt-1">Parsing ~12,722 records</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white border border-red-300 rounded-lg shadow-sm">
          <p className="text-red-700 text-lg font-medium">Error</p>
          <p className="text-[#555] text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#222]">
      <Header />
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 0 && <Overview data={data} />}
        {activeTab === 1 && <PeopleExplorer data={data} />}
        {activeTab === 2 && <CorrespondenceProgression data={data} />}
        {activeTab === 3 && <IndividualLookup data={data} />}
        {activeTab === 4 && <NetworkGraphs data={data} />}
      </main>
    </div>
  );
}
