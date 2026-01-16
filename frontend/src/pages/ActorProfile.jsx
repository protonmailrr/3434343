import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Bell, Eye, Check, AlertTriangle, 
  Shield, Users, Wallet, Copy, ArrowUpRight, ChevronDown, X, Gauge
} from 'lucide-react';
import Header from '../components/Header';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

// Import data and configs
import { 
  actorDetailedData, 
  defaultActor, 
  chainConfig, 
  getEdgeScoreColor, 
  getConfidenceColor,
  alertTypes 
} from '../data/actors';

// Import actor components
import {
  ActionablePlaybook,
  ActorCorrelation,
  CopyFeed,
  DoNotFollowIf,
  EdgeDecayIndicator,
  ExitConditions,
  FollowerRealityCheck,
  SimulatedPortfolio,
  StrategyFingerprint,
  TimingEdge,
} from '../components/actor';

export default function ActorProfile() {
  const { actorId } = useParams();
  const [isFollowed, setIsFollowed] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showClusterDetails, setShowClusterDetails] = useState(false);
  const [feedTimeframe, setFeedTimeframe] = useState('24h');
  const [copiedAddress, setCopiedAddress] = useState(null);
  
  // HYBRID Identity Toggle: Default = Strategy names (anonymized)
  const [showRealNames, setShowRealNames] = useState(false);

  const actor = actorDetailedData[actorId] || defaultActor;
  const confidenceColor = getConfidenceColor(actor.confidence);
  const chain = chainConfig[actor.primaryChain] || { color: 'bg-gray-500', label: actor.primaryChain };
  
  // HYBRID identity: show strategy_name by default, real_name when toggle is on
  const displayName = showRealNames ? actor.real_name : actor.strategy_name;
  const secondaryName = showRealNames ? actor.strategy_name : (actor.identity_confidence >= 0.8 ? actor.real_name : null);

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="px-4 py-6 max-w-[1400px] mx-auto">
          {/* Back link */}
          <Link 
            to="/actors" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Actors
          </Link>

          {/* Actor Header */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {actor.avatar ? (
                    <img src={actor.avatar} alt={actor.label} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                    {/* Secondary name hint */}
                    {secondaryName && (
                      <span className="text-sm text-gray-400">({secondaryName})</span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">{actor.type}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${chain.color}`} />
                      <span className="text-xs text-gray-500">{chain.label}</span>
                    </div>
                    {/* EDGE SCORE BADGE */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-bold ${getEdgeScoreColor(actor.edgeScore)}`}>
                          <Gauge className="w-3.5 h-3.5" />
                          {actor.edgeScore}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white max-w-xs">
                        <p className="text-xs font-semibold mb-1">Edge Score: {actor.edgeScore}/100</p>
                        <p className="text-xs text-gray-300">Timing (30%) + ROI Adjusted (25%) + Stability (20%) + Risk (15%) + Signals (10%)</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* IDENTITY TOGGLE */}
                    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 ml-2">
                      <button
                        onClick={() => setShowRealNames(false)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          !showRealNames ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Strategy
                      </button>
                      <button
                        onClick={() => setShowRealNames(true)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          showRealNames ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Real Name
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Strategy: <span className="font-semibold text-gray-900">{actor.strategy}</span></span>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${confidenceColor.bg}`} />
                      <span className={`font-semibold ${confidenceColor.text}`}>{actor.confidence}%</span>
                      <span className="text-gray-500">confidence</span>
                    </div>
                    {/* Identity confidence indicator */}
                    {actor.identity_confidence && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-gray-500">
                          ID: <span className={`font-semibold ${actor.identity_confidence >= 0.8 ? 'text-emerald-600' : actor.identity_confidence >= 0.5 ? 'text-amber-600' : 'text-red-500'}`}>
                            {(actor.identity_confidence * 100).toFixed(0)}%
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                  {/* Cluster info teaser */}
                  <button 
                    onClick={() => setShowClusterDetails(!showClusterDetails)}
                    className="mt-2 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Cluster of <span className="font-semibold text-gray-700">{actor.cluster.size} wallets</span> ({actor.cluster.confidence}% confidence)</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showClusterDetails ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFollowed(!isFollowed)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isFollowed ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFollowed ? 'fill-current' : ''}`} />
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Alerts
                </button>
                <Link
                  to="/watchlist"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Watchlist
                </Link>
              </div>
            </div>

            {/* Cluster Details - Expandable */}
            {showClusterDetails && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Known Wallets (Source of Truth)</h3>
                  <span className="text-xs text-gray-500">{actor.cluster.linkReason}</span>
                </div>
                <div className="space-y-2">
                  {actor.cluster.wallets.map((wallet, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-gray-900">{wallet.address}</code>
                            <button onClick={() => handleCopyAddress(wallet.address)} className="p-1 hover:bg-gray-200 rounded">
                              {copiedAddress === wallet.address ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-medium text-gray-600">{wallet.role}</span>
                            <span className="text-xs text-gray-500">Last active: {wallet.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{wallet.confidence}% conf</span>
                        <Link to={`/wallets?address=${wallet.address}`} className="p-1 hover:bg-gray-200 rounded">
                          <ArrowUpRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* ACTIONABLE PLAYBOOK */}
              <ActionablePlaybook playbook={actor.playbook} />

              {/* FOLLOWER REALITY CHECK */}
              <FollowerRealityCheck followerReality={actor.followerReality} />

              {/* EDGE DECAY INDICATOR */}
              <EdgeDecayIndicator edgeDecay={actor.edgeDecay} />

              {/* CORRELATION & INFLUENCE */}
              <ActorCorrelation 
                correlation={actor.correlation} 
                influenceScore={actor.influenceScore}
                showRealNames={showRealNames}
              />

              {/* DO NOT FOLLOW IF */}
              <DoNotFollowIf doNotFollowIf={actor.doNotFollowIf} />

              {/* EXIT CONDITIONS */}
              <ExitConditions exitConditions={actor.exitConditions} />

              {/* TIMING EDGE */}
              <TimingEdge timingEdge={actor.timingEdge} />

              {/* SIMULATED PORTFOLIO */}
              <SimulatedPortfolio simulatedPortfolio={actor.simulatedPortfolio} />

              {/* COPY FEED - Recent Trades */}
              <CopyFeed 
                copyFeed={actor.copyFeed} 
                feedTimeframe={feedTimeframe}
                setFeedTimeframe={setFeedTimeframe}
              />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Current State */}
              <div className="bg-gray-900 text-white rounded-2xl p-5">
                <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Current State</h3>
                <div className="text-2xl font-bold mb-1">{actor.currentBehavior}</div>
                <div className="text-sm text-gray-400 mb-4">{actor.behaviorTrend}</div>
                
                {/* Top Exposures - Lite Positions */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Top Exposures</h4>
                  <div className="space-y-2">
                    {actor.topExposures?.map((exp, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="font-medium">{exp.token}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${
                            exp.direction === 'Increasing' ? 'text-emerald-400' :
                            exp.direction === 'Decreasing' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {exp.direction === 'Increasing' ? '↑' : exp.direction === 'Decreasing' ? '↓' : '→'} {exp.change}
                          </span>
                          <span className="text-sm text-gray-400">{exp.allocation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strategy Fingerprint */}
              <StrategyFingerprint 
                fingerprint={actor.strategyFingerprint}
                strategies={actor.strategies}
              />

              {/* Active Alerts */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Alerts</h3>
                  <button onClick={() => setShowAlertModal(true)} className="text-sm text-gray-500 hover:text-gray-900">Configure</button>
                </div>
                
                {actor.activeAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {actor.activeAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-gray-900">{alert.type}</span>
                        </div>
                        <span className="text-xs text-emerald-600 font-medium uppercase">Active</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active alerts</p>
                )}
                
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  + Add Alert
                </button>
              </div>

              {/* Why Follow - compact in sidebar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Why follow</h3>
                <div className="space-y-1.5">
                  {actor.whyFollow.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {item.positive ? (
                        <Check className="w-3.5 h-3.5 text-[#16C784] mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#F5A524] mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${item.positive ? 'text-gray-900' : 'text-gray-500'}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance - compact in sidebar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Performance</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">PnL</div>
                    <div className={`text-sm font-bold ${actor.performance.realizedPnl.startsWith('+') ? 'text-[#16C784]' : 'text-[#EF4444]'}`}>
                      {actor.performance.realizedPnl}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Win</div>
                    <div className="text-sm font-bold text-gray-900">{actor.performance.winRate}</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Hold</div>
                    <div className="text-sm font-bold text-gray-900">{actor.performance.avgHoldTime}</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">DD</div>
                    <div className="text-sm font-bold text-gray-900">{actor.performance.avgDrawdown}</div>
                  </div>
                </div>
              </div>

              {/* What Actor Trades - compact in sidebar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Trades</h3>
                <div className="space-y-1.5">
                  {actor.assetBehavior.slice(0, 4).map((asset, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900">{asset.token}</span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600">{asset.behavior}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        asset.bias.includes('Bullish') ? 'bg-emerald-100 text-emerald-700' :
                        asset.bias === 'Neutral' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {asset.bias}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk - compact in sidebar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900">Risk</h3>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    actor.riskFlags.overallRisk < 30 ? 'bg-emerald-100 text-emerald-700' :
                    actor.riskFlags.overallRisk < 60 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {actor.riskFlags.overallRisk}/100
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-1.5 bg-gray-50 rounded flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Sanctions</span>
                    {!actor.riskFlags.sanctions ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-500" />}
                  </div>
                  <div className="p-1.5 bg-gray-50 rounded flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Mixers</span>
                    {!actor.riskFlags.mixers ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-500" />}
                  </div>
                  <div className="p-1.5 bg-gray-50 rounded flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Approvals</span>
                    <span className={`text-[10px] font-semibold ${actor.riskFlags.riskyApprovals > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{actor.riskFlags.riskyApprovals}</span>
                  </div>
                  <div className="p-1.5 bg-gray-50 rounded flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Unverified</span>
                    <span className={`text-[10px] font-semibold ${actor.riskFlags.unverifiedContracts > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{actor.riskFlags.unverifiedContracts}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAlertModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900">Actor Alerts</h3>
                </div>
                <button onClick={() => setShowAlertModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-4">
                  Select events for <span className="font-semibold text-gray-900">{displayName}</span>
                </p>
                
                <div className="space-y-2">
                  {alertTypes.map(alert => (
                    <label key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{alert.name}</div>
                        <div className="text-xs text-gray-500">{alert.description}</div>
                      </div>
                      <input type="checkbox" defaultChecked={actor.activeAlerts.some(a => a.type === alert.name)} className="w-4 h-4 text-gray-900 rounded" />
                    </label>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
                >
                  Save Alert Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
