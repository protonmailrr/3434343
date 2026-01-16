import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Filter,
  Link2,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  X,
  Wallet,
  Menu,
  Clock,
  Zap
} from 'lucide-react';
import Header from '../components/Header';
import { PageHeader, SectionHeader } from '../components/PageHeader';
import { InfoIcon } from '../components/Tooltip';
import SmartMoneyRadar from '../components/SmartMoneyRadar';
import FlowHeatmap from '../components/FlowHeatmap';
import NarrativeDetection from '../components/NarrativeDetection';
import DEXvsCEXPressure from '../components/DEXvsCEXPressure';
import MarketSignalCard from '../components/MarketSignalCard';
import MarketDislocationCard from '../components/MarketDislocationCard';
import AnomaliesList from '../components/AnomaliesList';
import SmartMoneySnapshot from '../components/SmartMoneySnapshot';
import NarrativesSidebar from '../components/NarrativesSidebar';
import StrategyTemplates from '../components/StrategyTemplates';
import QuickActions from '../components/QuickActions';
import SmartMoneyComparison from '../components/SmartMoneyComparison';
import FlowAnomaliesChart from '../components/FlowAnomaliesChart';

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// ============ COMPONENTS ============

// Glass Card Component (Telegram 2026 style)
const GlassCard = ({ children, className = "", hover = true }) => (
  <div className={`
    bg-white/70 backdrop-blur-xl 
    border border-white/50 
    rounded-3xl 
    shadow-[0_8px_32px_rgba(0,0,0,0.06)]
    ${hover ? 'hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] hover:bg-white/80 transition-all duration-300' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// Market Ticker
const MarketTicker = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/market-stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return null;

  return (
    <div className="mx-6 mb-4 overflow-x-auto">
      <div className="flex items-center gap-6 text-xs whitespace-nowrap py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-medium">Market Cap:</span>
          <span className="font-bold text-gray-900">{stats.total_market_cap}</span>
          <span className={`font-semibold ${stats.market_cap_change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.market_cap_change}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-medium">BTC Dom:</span>
          <span className="font-bold text-gray-900">{stats.btc_dominance}</span>
          <span className={`font-semibold ${stats.btc_change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.btc_change}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-medium">ETH Dom:</span>
          <span className="font-bold text-gray-900">{stats.eth_dominance}</span>
          <span className={`font-semibold ${stats.eth_change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.eth_change}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-medium">24H Volume:</span>
          <span className="font-bold text-gray-900">{stats.volume_24h}</span>
          <span className={`font-semibold ${stats.volume_change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.volume_change}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-medium">Fear & Greed:</span>
          <span className="font-bold text-gray-900">{stats.fear_greed}/100</span>
        </div>
      </div>
    </div>
  );
};

// Search Bar
const SearchBar = () => (
  <div className="mx-6 mb-6">
    <GlassCard className="p-4" hover={false}>
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search for tokens, addresses, entities..."
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>
    </GlassCard>
  </div>
);

// EntitiesCarousel removed per Product Vision v2 - Decision Feed focus

// Exchange Token Card
const ExchangeTokenCard = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/tokens/btc`)
      .then(res => setToken(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!token) return null;

  return (
    <Link to={`/token/${token.id}`} className="block">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">EXCHANGE TOKENS</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded-2xl hover:bg-blue-50 transition-colors">
            Trade Now on Exchange
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex items-start gap-4">
          <img src={token.logo} alt={token.symbol} className="w-16 h-16 rounded-full" />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{token.symbol}</h3>
              <span className={`text-lg font-semibold ${token.change_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {token.change_24h >= 0 ? '+' : ''}{token.change_24h}%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">${token.price.toLocaleString()}</p>
            
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-gray-500 mb-1">24H VOLUME</p>
                <p className="font-bold text-gray-900">${(token.volume_24h / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">MARKET CAP</p>
                <p className="font-bold text-gray-900">${(token.market_cap / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">ALL TIME HIGH</p>
                <p className="font-bold text-gray-900">${token.ath.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">ALL TIME LOW</p>
                <p className="font-bold text-gray-900">${token.atl.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};

// Exchange Flows Table
const ExchangeFlowsTable = () => {
  const [flows, setFlows] = useState([]);
  const [activeFilter, setActiveFilter] = useState('CEX+DEX');
  const [sortBy, setSortBy] = useState(null);

  useEffect(() => {
    fetchFlows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const fetchFlows = () => {
    const params = sortBy ? { sort_by: sortBy } : {};
    axios.get(`${API_BASE}/exchange-flows`, { params })
      .then(res => setFlows(res.data.flows))
      .catch(err => console.error(err));
  };

  const handleSort = (field) => {
    setSortBy(field === sortBy ? null : field);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">EXCHANGE FLOWS</h2>
        <div className="flex items-center gap-1.5">
          {['CEX+DEX', 'MARKET CAP', 'VOLUME'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-2xl transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-500 text-white'
                  : 'border border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white/70 backdrop-blur-xl">
              <tr className="border-b border-gray-100/50">
                <th className="py-3 px-3 text-left">
                  <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase font-semibold">
                    <Filter className="w-2 h-2" /> ASSET
                  </div>
                </th>
                <th 
                  className="py-3 px-2 text-center cursor-pointer hover:bg-gray-50/50"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-center gap-1 text-[9px] text-gray-500 uppercase font-semibold">
                    <Filter className="w-2 h-2" /> PRICE
                    {sortBy === 'price' && <ChevronDown className="w-2.5 h-2.5" />}
                  </div>
                </th>
                <th 
                  className="py-3 px-2 text-center cursor-pointer hover:bg-gray-50/50"
                  onClick={() => handleSort('volume')}
                >
                  <div className="flex items-center justify-center gap-1 text-[9px] text-gray-500 uppercase font-semibold">
                    <Filter className="w-2 h-2" /> VOLUME
                    {sortBy === 'volume' && <ChevronDown className="w-2.5 h-2.5" />}
                  </div>
                </th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-gray-50/50"
                  onClick={() => handleSort('netflow')}
                >
                  <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 uppercase font-semibold">
                    <Filter className="w-2 h-2" /> NETFLOW
                    {sortBy === 'netflow' && <ChevronDown className="w-2.5 h-2.5" />}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {flows.map((row, i) => (
                <tr key={i} className="border-b border-gray-50/50 hover:bg-gray-50/50 cursor-pointer transition-colors">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <img src={row.logo} alt={row.asset} className="w-5 h-5 rounded-full" />
                      <span className="text-xs font-bold text-gray-900">{row.asset}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="text-xs font-semibold text-gray-900">{row.price}</span>
                    <span className={`ml-1 text-[10px] ${row.price_change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {row.price_change >= 0 ? '+' : ''}{row.price_change}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="text-xs font-semibold text-gray-900">{row.volume}</span>
                    <span className={`ml-1 text-[10px] ${row.volume_change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {row.volume_change >= 0 ? '+' : ''}{row.volume_change}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={`text-xs font-semibold ${row.netflow.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {row.netflow}
                    </span>
                    <span className={`ml-1 text-[10px] ${row.netflow_change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {row.netflow_change >= 0 ? '+' : ''}{row.netflow_change}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

// Transfers Table with Filters
const TransfersTable = () => {
  const [transfers, setTransfers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usdFilter, setUsdFilter] = useState(null);
  const [sortBy, setSortBy] = useState('time');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, usdFilter, sortBy]);

  const fetchTransfers = () => {
    const params = { page, sort_by: sortBy };
    if (usdFilter) params.min_usd = usdFilter;
    
    axios.get(`${API_BASE}/transfers`, { params })
      .then(res => {
        setTransfers(res.data.transfers);
        setTotalPages(res.data.total_pages);
      })
      .catch(err => console.error(err));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransfers();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">FILTER FOR TRANSFERS</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setUsdFilter(null)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-2xl transition-colors ${
              !usdFilter ? 'bg-blue-500 text-white' : 'border border-blue-400 text-blue-600 bg-blue-50'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setUsdFilter(1)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-2xl transition-colors ${
              usdFilter === 1 ? 'bg-purple-500 text-white' : 'border border-purple-400 text-purple-600 bg-purple-50'
            }`}
          >
            USD ≥ $1
          </button>
          <button
            onClick={() => setSortBy(sortBy === 'time' ? 'usd' : 'time')}
            className="px-2.5 py-1 text-[10px] font-bold rounded-2xl border border-blue-400 text-blue-600 bg-blue-50"
          >
            SORT BY {sortBy === 'time' ? 'TIME' : 'USD'}
          </button>
        </div>
      </div>
      
      <GlassCard className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-center gap-3 py-2 border-b border-gray-100/50 flex-shrink-0">
          <span className="text-xs text-gray-500">TRANSFERS</span>
          <div className="flex items-center gap-1.5">
            <ChevronLeft 
              className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={() => setPage(p => Math.max(1, p - 1))}
            />
            <span className="text-xs font-semibold text-gray-900">{page} / {totalPages}</span>
            <ChevronRight 
              className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            />
          </div>
          <RefreshCw 
            className={`w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
            onClick={handleRefresh}
          />
        </div>
        
        <div className="flex items-center px-3 py-2 border-b border-gray-100/50 text-[9px] text-gray-500 uppercase font-semibold flex-shrink-0">
          <div className="w-8 flex items-center gap-0.5">
            <Filter className="w-2 h-2" />
            <Link2 className="w-2 h-2" />
          </div>
          <div className="w-14">TIME</div>
          <div className="flex-1 min-w-0">FROM</div>
          <div className="flex-1 min-w-0">TO</div>
          <div className="w-16 text-right">VALUE</div>
          <div className="w-14 text-right">TOKEN</div>
          <div className="w-16 text-right">USD</div>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {transfers.map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center px-3 py-2 border-b border-gray-50/50 hover:bg-gray-50/50 cursor-pointer transition-colors text-xs"
            >
              <div className="w-8 flex-shrink-0">
                <div 
                  className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px]"
                  style={{ backgroundColor: tx.chain_color }}
                >
                  {tx.chain_icon}
                </div>
              </div>
              
              <div className="w-14 flex-shrink-0">
                <span className="text-blue-600 font-medium text-[11px]">{tx.time}</span>
              </div>
              
              <div className="flex-1 min-w-0 flex items-center gap-1 pr-2">
                {tx.from_logo && <img src={tx.from_logo} alt="" className="w-4 h-4 rounded-full" />}
                <span className="text-blue-600 truncate text-[11px]">{tx.from_label || tx.from_address}</span>
              </div>
              
              <div className="flex-1 min-w-0 flex items-center gap-1 pr-2">
                {tx.to_logo && <img src={tx.to_logo} alt="" className="w-4 h-4 rounded-full" />}
                <span className="text-blue-600 truncate text-[11px]">{tx.to_label || tx.to_address}</span>
              </div>
              
              <div className="w-16 text-right font-semibold text-gray-900 text-[11px] flex-shrink-0">
                {tx.value}
              </div>
              
              <div className="w-14 text-right flex-shrink-0 flex items-center justify-end gap-1">
                <img src={tx.token_logo} alt={tx.token} className="w-3 h-3 rounded-full" />
                <span className="text-[9px] font-bold text-gray-700">{tx.token}</span>
              </div>
              
              <div className="w-16 text-right text-gray-500 font-medium text-[11px] flex-shrink-0">
                {tx.usd}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// ============ MAIN PAGE ============

// Market Regime Layer - STATUS BAR (Минималистичный стиль)
const MarketRegimeLayer = () => {
  const regime = {
    state: 'Risk-On',
    confidence: 78,
    implication: 'Trend-following strategies have higher probability',
    drivers: [
      { text: 'Smart money net inflow', value: '+$234M', positive: true },
      { text: 'Low distribution from exchanges', value: '-18%', positive: true },
      { text: 'Narrative breadth expanding', value: '+3 sectors', positive: true }
    ]
  };

  const getRegimeColor = () => {
    if (regime.state === 'Risk-On') return 'text-emerald-600';
    if (regime.state === 'Risk-Off') return 'text-red-600';
    return 'text-gray-600';
  };

  const color = getRegimeColor();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 font-medium">Market Context</div>
          <div className={`text-base font-bold ${color}`}>{regime.state}</div>
          <span className="text-xs text-gray-400">{regime.confidence}%</span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-600">
          {regime.drivers.map((driver, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className={driver.positive ? 'text-emerald-600' : 'text-red-600'}>
                {driver.positive ? '↑' : '↓'}
              </span>
              <span>{driver.text}</span>
              <span className="font-medium">{driver.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ArkhamHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30" data-testid="flow-intel-home">
      <Header />
      
      <PageHeader 
        title="Market Overview"
        description="Real-time on-chain flows, smart money activity, and market trends"
      />
      
      <div className="px-4 mb-8">
        
        {/* 1. MARKET REGIME - Status Bar (Контекст) */}
        <MarketRegimeLayer />
        
        {/* 2. TWO COLUMN GRID: 50% / 50% */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* LEFT COLUMN - DECISION FLOW + CHART (50%) */}
          <div className="space-y-3">
            {/* Market Signal Card */}
            <MarketSignalCard 
              state="bullish"
              confidence={57}
              scoreBreakdown={{ smartMoney: 75, regime: 99, anomalies: 25, risk: 20 }}
            />
            
            {/* FLOW ANOMALIES CHART */}
            <FlowAnomaliesChart />
          </div>
          
          {/* RIGHT COLUMN - CONTEXT (50%) */}
          <div className="space-y-3">
            {/* Edge Detected */}
            <MarketDislocationCard />
            
            {/* Smart Money и Top Narratives - ГОРИЗОНТАЛЬНО */}
            <div className="grid grid-cols-2 gap-3">
              <SmartMoneySnapshot />
              <NarrativesSidebar />
            </div>
            
            {/* Quick Actions */}
            <QuickActions />
          </div>
          
        </div>
      </div>
      
      <div className="h-8" />
    </div>
  );
}
