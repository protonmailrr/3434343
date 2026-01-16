import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Bell, Info, Check, AlertTriangle, Users, ArrowRightLeft, 
  ExternalLink, TrendingUp, TrendingDown, Building, Eye, X
} from 'lucide-react';
import Header from '../components/Header';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  TokenSelector,
  TokenIntelligence,
  RecentChanges,
  TradeSizeTable,
  topTokens,
  tokenData,
  alertTypes,
  strategyLogic,
} from '../components/tokens';

export default function TokensPage() {
  const [selectedToken, setSelectedToken] = useState('eth');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const token = tokenData[selectedToken] || tokenData.eth;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50" data-testid="tokens-page">
        <Header />
        
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          {/* Token Selector */}
          <div className="mb-4">
            <TokenSelector 
              tokens={topTokens} 
              selectedToken={selectedToken} 
              onSelect={setSelectedToken} 
            />
          </div>

          {/* Token Intelligence Hero */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold">{token.symbol}</span>
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {token.intelligence.structureStatus}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    token.marketSignal.type === 'Bullish' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {token.marketSignal.type} ({token.marketSignal.confidence}%)
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="text-2xl font-bold text-white">${token.price.toLocaleString()}</span>
                  <span className={`flex items-center gap-1 ${token.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {token.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(token.change)}% (24h)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Intelligence</div>
                <div className="text-lg font-bold text-emerald-400">{token.intelligence.marketAlignment}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span>
                Confirmed for <span className="text-white font-medium">{token.intelligence.confirmedDays} days</span>
              </span>
              <span>•</span>
              <span>
                Expected: <span className="text-white font-medium">{token.intelligence.duration}</span>
              </span>
              <span>•</span>
              <span>
                Confidence: <span className="text-white font-medium">{token.intelligence.confidence}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400 mb-2">Primary Drivers</div>
                {token.intelligence.primaryDrivers.map((driver, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm mb-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-gray-300">{driver}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Primary Risk</div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-gray-300">{token.intelligence.primaryRisk}</span>
                </div>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <button 
                onClick={() => setShowAlertModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
                data-testid="create-alert-btn"
              >
                <Bell className="w-4 h-4" />
                Create Token Alert
              </button>
              <Link to="/entities" className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
                <Building className="w-4 h-4" />
                View Entities
              </Link>
            </div>
          </div>

          {/* Two Columns */}
          <div className="flex gap-4">
            {/* LEFT COLUMN (60%) */}
            <div className="w-[60%] space-y-4">
              {/* Flow → Price Confirmation */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    Flow → Price Confirmation
                  </h3>
                  <div className="text-xs text-gray-500">7D</div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Accumulation Confirmed</div>
                      <div className="text-xs text-gray-500">Net Flow ↑ + Price ↑</div>
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 px-2 py-1 bg-emerald-50 rounded">Active</div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg opacity-40">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-500">Absorption</div>
                      <div className="text-xs text-gray-400">Net Flow ↑ + Price ↓</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600">
                  <span className="font-semibold">Flow supports price:</span> Capital inflow aligned with price increase.
                </div>
              </div>
              
              {/* Holder Composition */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Holder Composition
                  </h3>
                  <Link to="/entities" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    View Activity <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-2">
                  <div>
                    <div className="text-xs text-gray-500">Strong Hands ({">"}30d)</div>
                    <div className="text-lg font-bold text-gray-900">{token.holders.strongHands}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Trend</div>
                    <div className="text-sm font-semibold text-emerald-600">{token.holders.trend}</div>
                  </div>
                </div>
                
                <div className="space-y-0.5 mb-2">
                  {token.holders.composition.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-gray-600">{item.type}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{item.pct}%</span>
                        <span className={`text-xs w-10 text-right font-medium ${item.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Structure Insight:</span> {token.holders.interpretation}
                  </div>
                </div>
              </div>

              {/* Supply Flow */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                  Supply Flow Map
                </h3>
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Mint/Burn</div>
                    <div className="text-sm font-bold text-gray-900">{token.supplyFlow.mintBurn.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-0.5">ETH</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <div className="text-xs text-gray-500 mb-0.5">LP Flow</div>
                    <div className="text-sm font-bold text-emerald-600">+${(token.supplyFlow.lpFlow / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Bridge Flow</div>
                    <div className="text-sm font-bold text-emerald-600">+${(token.supplyFlow.bridgeFlow / 1000000).toFixed(1)}M</div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600">
                  {token.supplyFlow.netEffect}
                </div>
              </div>

              {/* Trade Size Table */}
              <TradeSizeTable tradeSize={token.tradeSize} />
            </div>

            {/* RIGHT COLUMN (40%) */}
            <div className="w-[40%] space-y-4">
              {/* Recent Changes */}
              <RecentChanges changes={token.recentChanges} />
              
              {/* Buy/Sell Pressure */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Buy/Sell Pressure</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${token.pressure.buyPct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{token.pressure.buyPct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Buy Pressure</span>
                  <span>Net Flow: ${token.pressure.netFlow}M</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                  {token.pressure.interpretation}
                </div>
              </div>

              {/* Suggested Strategies */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggested Strategies</h3>
                <div className="space-y-2">
                  {token.suggestedStrategies.strategies.map((strategy, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedStrategy(strategy.name);
                        setShowStrategyModal(true);
                      }}
                      className="w-full p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                      data-testid={`strategy-btn-${i}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{strategy.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="text-xs text-gray-600">{strategy.why}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAlertModal(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Create Token Alert</h3>
                <button onClick={() => setShowAlertModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                {alertTypes.map((alert) => (
                  <div key={alert.id} className="p-4 border border-gray-200 rounded-xl hover:border-gray-900 transition-colors cursor-pointer">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{alert.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      {alert.triggers.map((trigger, i) => (
                        <li key={i}>• {trigger}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Strategy Modal */}
        {showStrategyModal && selectedStrategy && strategyLogic[selectedStrategy] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowStrategyModal(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{selectedStrategy}</h3>
                <button onClick={() => setShowStrategyModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">{strategyLogic[selectedStrategy].description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Entry Conditions</h4>
                  <ul className="space-y-1">
                    {strategyLogic[selectedStrategy].entryConditions.map((cond, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Invalidation</h4>
                  <ul className="space-y-1">
                    {strategyLogic[selectedStrategy].invalidation.map((inv, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        {inv}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="text-sm font-semibold text-gray-900">{strategyLogic[selectedStrategy].typicalDuration}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Risk Level</div>
                  <div className="text-sm font-semibold text-gray-900">{strategyLogic[selectedStrategy].riskLevel}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Best For</div>
                  <div className="text-xs font-medium text-gray-700">{strategyLogic[selectedStrategy].bestFor}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
