import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowUpRight, Users, Info, ChevronLeft, ChevronRight, Link2, X, Eye, Bell, Check } from 'lucide-react';
import Header from '../components/Header';
import SearchInput from '../components/shared/SearchInput';
import AlertModal from '../components/AlertModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

// Mock entities data with cluster assignments
const entitiesData = [
  // Exchanges
  { id: 'binance', name: 'Binance', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png', holdings: '$28.4B', netflow24h: '+$125M', marketShare: 14.2, addresses: 1247, activity: 'accumulating', confidence: 82, cluster: 'A' },
  { id: 'coinbase', name: 'Coinbase', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/89.png', holdings: '$18.9B', netflow24h: '-$45M', marketShare: 9.4, addresses: 892, activity: 'distributing', confidence: 68, cluster: 'B' },
  { id: 'kraken', name: 'Kraken', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/24.png', holdings: '$8.2B', netflow24h: '+$23M', marketShare: 4.1, addresses: 456, activity: 'accumulating', confidence: 74, cluster: 'A' },
  
  // Smart Money Funds
  { id: 'a16z', name: 'a16z Crypto', type: 'Smart Money', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$4.5B', netflow24h: '+$156M', marketShare: 2.2, addresses: 234, activity: 'accumulating', confidence: 82, cluster: 'A' },
  { id: 'paradigm', name: 'Paradigm', type: 'Smart Money', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$3.2B', netflow24h: '+$12M', marketShare: 1.6, addresses: 156, activity: 'holding', confidence: 67, cluster: null },
  { id: 'pantera', name: 'Pantera Capital', type: 'Smart Money', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$3.5B', netflow24h: '+$23M', marketShare: 1.7, addresses: 189, activity: 'rotating', confidence: 75, cluster: null },
  { id: 'jump', name: 'Jump Trading', type: 'Smart Money', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$1.2B', netflow24h: '-$67M', marketShare: 0.6, addresses: 67, activity: 'distributing', confidence: 71, cluster: 'B' },
  { id: 'galaxy', name: 'Galaxy Digital', type: 'Smart Money', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$1.8B', netflow24h: '+$78M', marketShare: 0.9, addresses: 134, activity: 'accumulating', confidence: 76, cluster: 'A' },
  
  // Funds
  { id: 'grayscale', name: 'Grayscale', type: 'Fund', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png', holdings: '$21.5B', netflow24h: '+$234M', marketShare: 10.7, addresses: 45, activity: 'accumulating', confidence: 88, cluster: 'A' },
  
  // Market Makers
  { id: 'wintermute', name: 'Wintermute', type: 'Market Maker', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$890M', netflow24h: '+$34M', marketShare: 0.4, addresses: 89, activity: 'rotating', confidence: 65, cluster: null },
  
  // Additional entities
  { id: 'ftx', name: 'FTX Estate', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/524.png', holdings: '$3.2B', netflow24h: '-$89M', marketShare: 1.6, addresses: 234, activity: 'distributing', confidence: 45, cluster: 'B' },
  { id: 'polychain', name: 'Polychain Capital', type: 'Smart Money', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$2.1B', netflow24h: '+$34M', marketShare: 1.0, addresses: 167, activity: 'accumulating', confidence: 79, cluster: null },
  { id: 'multicoin', name: 'Multicoin Capital', type: 'Smart Money', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$1.5B', netflow24h: '+$23M', marketShare: 0.7, addresses: 98, activity: 'accumulating', confidence: 74, cluster: null },
  { id: 'alameda', name: 'Alameda Research', type: 'Smart Money', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$890M', netflow24h: '-$156M', marketShare: 0.4, addresses: 456, activity: 'distributing', confidence: 32, cluster: 'B' },
  { id: 'genesis', name: 'Genesis Trading', type: 'Market Maker', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', holdings: '$2.3B', netflow24h: '+$45M', marketShare: 1.1, addresses: 78, activity: 'rotating', confidence: 61, cluster: null },
  { id: 'bitfinex', name: 'Bitfinex', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/37.png', holdings: '$5.6B', netflow24h: '+$67M', marketShare: 2.8, addresses: 345, activity: 'accumulating', confidence: 71, cluster: null },
  { id: 'okx', name: 'OKX', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/294.png', holdings: '$9.8B', netflow24h: '+$89M', marketShare: 4.9, addresses: 567, activity: 'accumulating', confidence: 77, cluster: null },
  { id: 'bybit', name: 'Bybit', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/521.png', holdings: '$4.2B', netflow24h: '+$34M', marketShare: 2.1, addresses: 289, activity: 'holding', confidence: 69, cluster: 'C' },
  { id: 'kucoin', name: 'KuCoin', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/311.png', holdings: '$2.8B', netflow24h: '-$12M', marketShare: 1.4, addresses: 234, activity: 'rotating', confidence: 64, cluster: null },
  { id: 'deribit', name: 'Deribit', type: 'Exchange', logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/281.png', holdings: '$1.9B', netflow24h: '+$18M', marketShare: 0.9, addresses: 156, activity: 'holding', confidence: 72, cluster: 'C' },
];

// Bridge Clusters data
const bridgeClusters = [
  {
    clusterId: 'A',
    timeframe: '24h',
    token: 'ETH',
    direction: 'accumulating',
    entities: ['binance', 'kraken', 'a16z', 'galaxy', 'grayscale'],
    strength: 85,
    confidenceBoost: 12,
    color: 'bg-gray-900',
    reasons: ['Net flow alignment (+$600M combined)', 'Similar timing window', 'Shared accumulation direction']
  },
  {
    clusterId: 'B',
    timeframe: '24h',
    token: 'BTC',
    direction: 'distributing',
    entities: ['coinbase', 'jump', 'ftx', 'alameda'],
    strength: 72,
    confidenceBoost: 8,
    color: 'bg-gray-600',
    reasons: ['Coordinated outflows', 'Distribution pattern match', '24h timing overlap']
  },
  {
    clusterId: 'C',
    timeframe: '7d',
    token: 'USDT',
    direction: 'holding',
    entities: ['bybit', 'deribit'],
    strength: 45,
    confidenceBoost: 3,
    color: 'bg-gray-400',
    reasons: ['Stablecoin reserve buildup', 'Similar reserve strategy']
  }
];

const activityConfig = {
  'accumulating': { label: 'Accumulating', color: 'bg-gray-900 text-white' },
  'distributing': { label: 'Distributing', color: 'bg-gray-100 text-gray-600' },
  'rotating': { label: 'Rotating', color: 'bg-gray-200 text-gray-700' },
  'holding': { label: 'Holding', color: 'bg-gray-100 text-gray-600' },
};

const ITEMS_PER_PAGE = 9;

// Pagination Component
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between mt-6 py-4 border-t border-gray-100">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-teal-500 hover:bg-teal-50'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-teal-400 text-sm">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                currentPage === page ? 'bg-teal-500 text-white' : 'text-teal-500 hover:bg-teal-50'
              }`}
            >
              {page}
            </button>
          )
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-teal-500 hover:bg-teal-50'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{startItem} - {endItem}</span> out of <span className="font-semibold text-gray-700">{totalItems}</span>
      </div>
    </div>
  );
};

// Bridge Clusters Block
const BridgeClustersBlock = ({ clusters, activeCluster, onClusterClick, onClearCluster }) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-gray-700" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Bridge Clusters</h3>
          <span className="px-2 py-0.5 bg-gray-200 rounded text-xs font-medium text-gray-600">24h / 7d</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-0.5 hover:bg-gray-200 rounded">
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white max-w-sm border border-white/20">
              <p className="text-xs">Bridge detects coordinated behavior: entities acting on the same token, in the same direction, within similar timeframes. Click a cluster to filter.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {activeCluster && (
          <button 
            onClick={onClearCluster}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {clusters.map(cluster => {
          const isActive = activeCluster === cluster.clusterId;
          return (
            <button
              key={cluster.clusterId}
              onClick={() => onClusterClick(cluster.clusterId)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isActive 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span className="font-semibold">{cluster.token}</span>
              <span className={`capitalize ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                {cluster.direction}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                {cluster.entities.length}
              </span>
              <span className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                {cluster.strength >= 70 ? 'High' : cluster.strength >= 40 ? 'Medium' : 'Low'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active cluster description */}
      {activeCluster && (
        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
          {(() => {
            const cluster = clusters.find(c => c.clusterId === activeCluster);
            if (!cluster) return null;
            return (
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  This cluster represents coordinated <span className="font-semibold text-gray-900">{cluster.token} {cluster.direction}</span> by {cluster.entities.length} entities within a {cluster.timeframe} window.
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Confidence boost: <span className="font-semibold text-gray-700">+{cluster.confidenceBoost}%</span></span>
                  <span>•</span>
                  <span>Strength: <span className="font-semibold text-gray-700">{cluster.strength}/100</span></span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// Entity Card with Bridge badge
const EntityCard = ({ entity, cluster, isInActiveCluster, isDimmed, bridgeMode, onAddToWatchlist, onCreateAlert, isInWatchlist }) => {
  const clusterData = cluster ? bridgeClusters.find(c => c.clusterId === cluster) : null;
  
  return (
    <div className={`bg-white border rounded-xl p-4 transition-all relative ${
      isDimmed 
        ? 'border-gray-100 opacity-40' 
        : isInActiveCluster 
          ? 'border-gray-900 ring-2 ring-gray-900/20' 
          : 'border-gray-200 hover:border-gray-900'
    }`}>
      {/* Bridge badge */}
      {bridgeMode && cluster && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${clusterData?.color || 'bg-gray-500'} text-white`}>
                <Link2 className="w-3 h-3" />
                <span className="text-xs font-bold">{cluster}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white max-w-xs border border-white/20">
              <p className="text-xs mb-1">
                Aligned with {(clusterData?.entities.length || 1) - 1} entities on {clusterData?.token} {clusterData?.direction}
              </p>
              <p className="text-xs text-gray-400">Confidence +{clusterData?.confidenceBoost}%</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <Link to={`/entity/${entity.id}`} className="block">
        <div className="flex items-center gap-3 mb-4">
          <img src={entity.logo} alt={entity.name} className="w-12 h-12 rounded-2xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">{entity.name}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                {entity.type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{entity.addresses} addresses</span>
            </div>
          </div>
        </div>

        {/* Activity & Confidence */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${activityConfig[entity.activity]?.color || 'bg-gray-100 text-gray-600'}`}>
            {activityConfig[entity.activity]?.label || entity.activity}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-gray-500 cursor-help">
                {entity.confidence}% confidence
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white max-w-xs border border-white/20">
              <p className="text-xs">Confidence based on net flow consistency, holdings stability, and historical patterns</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </Link>
      
      {/* Quick Actions Row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Link to={`/entity/${entity.id}`} className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          View details →
        </Link>
        
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToWatchlist && onAddToWatchlist(entity);
                }}
                className={`p-1.5 rounded transition-colors ${
                  isInWatchlist 
                    ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                }`}
                data-testid={`watchlist-btn-${entity.id}`}
              >
                {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCreateAlert && onCreateAlert(entity);
                }}
                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                data-testid={`alert-btn-${entity.id}`}
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Create Alert</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default function EntitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [bridgeMode, setBridgeMode] = useState(false);
  const [activeCluster, setActiveCluster] = useState(null);
  
  // Watchlist & Alerts state
  const [watchlist, setWatchlist] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEntity, setAlertEntity] = useState('');

  const filteredEntities = entitiesData.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || entity.type === filterType;
    const matchesCluster = !activeCluster || entity.cluster === activeCluster;
    return matchesSearch && matchesType && matchesCluster;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEntities = filteredEntities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Watchlist & Alert handlers
  const handleAddToWatchlist = (entity) => {
    setWatchlist(prev => {
      if (prev.includes(entity.id)) {
        return prev.filter(id => id !== entity.id);
      }
      return [...prev, entity.id];
    });
  };

  const handleCreateAlert = (entity) => {
    setAlertEntity(entity.name);
    setShowAlertModal(true);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClusterClick = (clusterId) => {
    setActiveCluster(activeCluster === clusterId ? null : clusterId);
    setCurrentPage(1);
  };

  const handleClearCluster = () => {
    setActiveCluster(null);
    setCurrentPage(1);
  };

  const toggleBridgeMode = () => {
    setBridgeMode(!bridgeMode);
    setActiveCluster(null);
    setCurrentPage(1);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="px-4 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Entities</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Info className="w-4 h-4 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white max-w-xs border border-white/20">
                  <p className="text-xs">Entity = group of addresses controlled by single actor. Track exchanges, funds, and market makers — their aggregate influence on the market.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-gray-500">Track exchanges, funds, and market makers — their holdings, flows, and market impact</p>
          </div>

          {/* Filters + View Mode Toggle */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search entities..."
                className="max-w-md"
                testId="entities-search-input"
              />
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                {['all', 'Exchange', 'Smart Money', 'Fund', 'Market Maker'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterType === type ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <span className="text-xs text-gray-500 px-2">View:</span>
              <button
                onClick={() => { setBridgeMode(false); setActiveCluster(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !bridgeMode ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-white'
                }`}
              >
                Default
              </button>
              <button
                onClick={toggleBridgeMode}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  bridgeMode ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-white'
                }`}
              >
                <Link2 className="w-3 h-3" />
                Bridge
              </button>
            </div>
          </div>

          {/* Bridge Clusters (only in Bridge Mode) */}
          {bridgeMode && (
            <BridgeClustersBlock 
              clusters={bridgeClusters}
              activeCluster={activeCluster}
              onClusterClick={handleClusterClick}
              onClearCluster={handleClearCluster}
            />
          )}

          {/* Entities Grid - 3x3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEntities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                cluster={entity.cluster}
                isInActiveCluster={activeCluster && entity.cluster === activeCluster}
                isDimmed={bridgeMode && activeCluster && entity.cluster !== activeCluster}
                bridgeMode={bridgeMode}
                onAddToWatchlist={handleAddToWatchlist}
                onCreateAlert={handleCreateAlert}
                isInWatchlist={watchlist.includes(entity.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredEntities.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      
      {/* Alert Modal */}
      <AlertModal 
        isOpen={showAlertModal} 
        onClose={() => setShowAlertModal(false)}
        defaultEntity={alertEntity}
      />
    </TooltipProvider>
  );
}
