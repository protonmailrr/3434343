import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, Search, ArrowUpRight, Star, Bell, Activity, Shield,
  Info, X, ChevronUp, ChevronDown, Check, AlertTriangle, Zap,
  TrendingUp, TrendingDown
} from 'lucide-react';
import Header from '../components/Header';
import SearchInput from '../components/shared/SearchInput';
import BehaviorFingerprint from '../components/BehaviorFingerprint';
import AdvancedRiskFlags from '../components/AdvancedRiskFlags';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  WalletCard,
  WalletIntelligencePanel,
  WalletMetrics,
  topWallets,
  walletIntelligenceData,
  defaultIntelligence,
  walletAlertTypes,
} from '../components/wallets';

export default function WalletsPage() {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTracked, setIsTracked] = useState(false);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [showRiskDeepDive, setShowRiskDeepDive] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showSignalsModal, setShowSignalsModal] = useState(false);

  const walletIntelligence = selectedWallet 
    ? walletIntelligenceData[selectedWallet] || defaultIntelligence 
    : defaultIntelligence;

  const selectedWalletData = topWallets.find(w => w.address === selectedWallet);

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet.address);
    setSearchQuery(wallet.label);
  };

  const filteredWallets = useMemo(() => {
    if (!searchQuery) return topWallets;
    const query = searchQuery.toLowerCase();
    return topWallets.filter(w => 
      w.label.toLowerCase().includes(query) || 
      w.address.toLowerCase().includes(query) ||
      w.type.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50" data-testid="wallets-page">
        <Header />
        
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by wallet address, ENS, or label..."
              testId="wallet-search-input"
              className="max-w-2xl"
            />
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* LEFT: Main Analysis Panel */}
            <div className="flex-1 min-w-0">
              {selectedWallet && selectedWalletData ? (
                <>
                  {/* Wallet Intelligence Panel */}
                  <WalletIntelligencePanel
                    intelligence={walletIntelligence}
                    walletData={selectedWalletData}
                    selectedWallet={selectedWallet}
                    isTracked={isTracked}
                    onTrack={() => setIsTracked(!isTracked)}
                    onShowSignals={() => setShowSignalsModal(true)}
                    onShowAlerts={() => setShowAlertModal(true)}
                  />

                  {/* Core Metrics */}
                  <WalletMetrics intelligence={walletIntelligence} />

                  {/* Advanced Details - EXPANDABLE */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      data-testid="advanced-details-toggle"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">Advanced Analysis</h2>
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">MODEL</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {showAdvancedDetails ? 'Hide' : 'Show'}
                        {showAdvancedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {showAdvancedDetails && (
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Token Alignment */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <Activity className="w-4 h-4 text-gray-500" />
                            Token Alignment
                          </h3>
                          <div className="space-y-2 mb-3">
                            {walletIntelligence.tokenOverlap?.map((token, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-gray-700" />
                                  <span className="text-sm font-medium text-gray-900">{token}</span>
                                  <span className="text-xs text-gray-500">Accumulation</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Aligned</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-600">
                              <span className="font-semibold">Model insight:</span> This wallet is accumulating tokens with confirmed bullish structure
                            </div>
                          </div>
                        </div>

                        {/* Strategy Suitability */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-gray-500" />
                            Strategy Suitability
                          </h3>
                          <div className="space-y-2 mb-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">Smart Money Follow</span>
                                <Check className="w-4 h-4 text-gray-700" />
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-semibold">Highly aligned</span> — Consistent accumulation patterns
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">Narrative Rider</span>
                                <AlertTriangle className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-semibold">Partial alignment</span> — Some late entries detected
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed Analytics */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Detailed Analytics</h2>
                    <div className="mb-4">
                      <BehaviorFingerprint address={selectedWallet} />
                    </div>

                    {/* Risk Deep Dive */}
                    <div>
                      <button
                        onClick={() => setShowRiskDeepDive(!showRiskDeepDive)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-4"
                        data-testid="risk-deep-dive-toggle"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-700" />
                          <h3 className="text-sm font-semibold text-gray-900">Risk Deep Dive</h3>
                          <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">FACT</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {showRiskDeepDive ? 'Hide Details' : 'Show Details'}
                          {showRiskDeepDive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                      {showRiskDeepDive && (
                        <div className="mb-4">
                          <AdvancedRiskFlags address={selectedWallet} />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* EMPTY STATE */
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-10 h-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Wallet to Analyze</h2>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Use the search bar above to find a wallet by address, ENS, or label. 
                    Or choose from suggested wallets on the right.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Search className="w-4 h-4" />
                      Search by address
                    </span>
                    <span>•</span>
                    <span>ENS names supported</span>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Suggested Wallets Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Suggested Wallets</h3>
                      <p className="text-xs text-gray-500">High-confidence wallets to follow</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredWallets.map((wallet) => (
                      <WalletCard
                        key={wallet.address}
                        wallet={wallet}
                        isSelected={selectedWallet === wallet.address}
                        onSelect={() => handleSelectWallet(wallet)}
                      />
                    ))}
                  </div>

                  <Link 
                    to="/entities" 
                    className="flex items-center justify-center gap-2 w-full mt-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Discover more wallets
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAlertModal(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-bold text-gray-900">Create Wallet Alert</h3>
                </div>
                <button onClick={() => setShowAlertModal(false)} className="p-1 hover:bg-gray-100 rounded-lg" data-testid="close-alert-modal">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {walletAlertTypes.map((alert) => (
                  <div key={alert.id} className="p-4 border border-gray-200 rounded-xl hover:border-gray-900 transition-colors cursor-pointer group">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{alert.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      {alert.triggers.slice(0, 2).map((trigger, i) => (
                        <li key={i}>• {trigger}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Signals Modal */}
        {showSignalsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSignalsModal(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-bold text-gray-900">Copy Signals</h3>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">Read-only</span>
                </div>
                <button onClick={() => setShowSignalsModal(false)} className="p-1 hover:bg-gray-100 rounded-lg" data-testid="close-signals-modal">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Theoretical entry points based on wallet recent actions. These are historical signals — not recommendations.
              </p>

              <div className="space-y-3 mb-4">
                {[
                  { token: 'ARB', type: 'Entry', time: '2h ago', price: '$1.42', change: '+4.2%', size: '$45K' },
                  { token: 'OP', type: 'Accumulation', time: '6h ago', price: '$2.18', change: '+1.8%', size: '$120K' },
                  { token: 'PEPE', type: 'Exit', time: '1d ago', price: '$0.0000089', change: '-2.1%', size: '$28K', isExit: true }
                ].map((signal, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${signal.isExit ? 'bg-gray-500' : 'bg-gray-900'}`}>
                          {signal.isExit ? <TrendingDown className="w-4 h-4 text-white" /> : <TrendingUp className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{signal.token} {signal.type}</div>
                          <div className="text-xs text-gray-500">{signal.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{signal.price}</div>
                        <div className={`text-xs ${signal.change.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>{signal.change} since</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">Size: {signal.size}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Important:</span> These signals show what the wallet did, not what you should do.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
