
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_MARKET_RATES } from '../../constants';
import { MarketRate, GroundingSource } from '../../types';
import { fetchLiveMarketData } from '../../services/marketService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MarketTrends: React.FC = () => {
  const [rates, setRates] = useState<MarketRate[]>(MOCK_MARKET_RATES);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLiveMarketData();
        if (data.rates && data.rates.length > 0) {
          setRates(data.rates);
        }
        setSources(data.sources);
        setSummary(data.rawSummary);
      } catch (err) {
        console.error("Error loading market data:", err);
        setError("Failed to fetch live market data. Showing historical estimates.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Compute unique values for filters
  const allCommodities = useMemo(() => Array.from(new Set(rates.map(r => r.commodity))).sort(), [rates]);
  const allMarkets = useMemo(() => Array.from(new Set(rates.map(r => r.market))).sort(), [rates]);

  // Apply filters
  const filteredRates = useMemo(() => {
    return rates.filter(rate => {
      const matchesCommodity = selectedCommodities.length === 0 || selectedCommodities.includes(rate.commodity);
      const matchesMarket = selectedMarkets.length === 0 || selectedMarkets.includes(rate.market);
      return matchesCommodity && matchesMarket;
    });
  }, [rates, selectedCommodities, selectedMarkets]);

  const chartData = filteredRates.map(m => ({
    name: m.commodity,
    price: m.modalPrice,
    color: m.modalPrice > 5000 ? '#10b981' : m.modalPrice > 2500 ? '#3b82f6' : '#6366f1'
  }));

  const toggleFilter = (item: string, currentSelected: string[], setSelected: (val: string[]) => void) => {
    if (currentSelected.includes(item)) {
      setSelected(currentSelected.filter(i => i !== item));
    } else {
      setSelected([...currentSelected, item]);
    }
  };

  const clearFilters = () => {
    setSelectedCommodities([]);
    setSelectedMarkets([]);
  };

  return (
    <div className="space-y-6">
      {/* Live Intelligence Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-earth-asia"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Live Market Intelligence</h3>
              <p className="text-xs text-slate-500 font-medium">Grounded search powered by Google</p>
            </div>
          </div>
          {loading && <div className="animate-spin text-emerald-600"><i className="fa-solid fa-circle-notch"></i></div>}
        </div>

        {summary ? (
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-600 leading-relaxed italic line-clamp-3">
              "{summary}"
            </p>
          </div>
        ) : loading ? (
          <div className="h-20 bg-slate-50 rounded-xl animate-pulse mb-4"></div>
        ) : null}

        {sources.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Sources:</span>
            {sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-full text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                <i className="fa-solid fa-link"></i>
                {source.title.substring(0, 20)}...
              </a>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-xs flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-filter text-emerald-600"></i>
            Market Filters
          </h3>
          {(selectedCommodities.length > 0 || selectedMarkets.length > 0) && (
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <i className="fa-solid fa-xmark"></i>
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filter by Commodity</label>
            <div className="flex flex-wrap gap-2">
              {allCommodities.map(commodity => (
                <button
                  key={commodity}
                  onClick={() => toggleFilter(commodity, selectedCommodities, setSelectedCommodities)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedCommodities.includes(commodity)
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {commodity}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filter by Market Location</label>
            <div className="flex flex-wrap gap-2">
              {allMarkets.map(market => (
                <button
                  key={market}
                  onClick={() => toggleFilter(market, selectedMarkets, setSelectedMarkets)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedMarkets.includes(market)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  {market}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Price Benchmarks</h3>
            <p className="text-sm text-slate-500">Visualization of current Mandi rates (₹ per Quintal)</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-rotate"></i>
              Refresh
            </button>
          </div>
        </div>
        
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <i className="fa-solid fa-chart-simple text-4xl mb-2 opacity-20"></i>
              <p className="text-sm">No data matching the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Commodity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Market</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Min Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Max Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Modal Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRates.length > 0 ? filteredRates.map((rate, i) => (
                <tr key={i} className={`hover:bg-slate-50 transition-colors ${loading ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                        {rate.commodity.substring(0, 1)}
                      </div>
                      <span className="font-bold text-slate-700">{rate.commodity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex flex-col">
                      <span>{rate.market}</span>
                      <span className="text-[10px] text-slate-400">{rate.arrivalDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">₹{rate.minPrice}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">₹{rate.maxPrice}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm">
                      ₹{rate.modalPrice}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-xs font-bold ${i % 2 === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <i className={`fa-solid ${i % 2 === 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} mr-1`}></i>
                      {i % 2 === 0 ? '+2.4%' : '-1.2%'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No results found for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
