import { useState } from 'react';
import { Bell, BellRing, Check, X, Filter, Trash2, Settings, TrendingUp, TrendingDown, AlertTriangle, Coins, ShieldAlert } from 'lucide-react';
import Header from '../components/Header';
import { PageHeader, SectionHeader } from '../components/PageHeader';

const GlassCard = ({ children, className = "", hover = false }) => (
  <div className={`glass-card ${hover ? 'glass-card-hover cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

// Mock alerts data with action context (Vision v2)
const alertsData = [
  { 
    id: 1, 
    type: 'cex_deposit', 
    title: 'Large CEX Deposit', 
    message: 'Vitalik.eth deposited 500 ETH ($1.67M) to Coinbase', 
    time: '2 min ago', 
    severity: 'danger',
    read: false,
    whatItMeans: 'Large holder moving tokens to exchange - potential sell signal',
    whatToDo: 'Monitor price action, consider taking profits if you hold ETH'
  },
  { 
    id: 2, 
    type: 'buy_spike', 
    title: 'Buy Spike Detected', 
    message: 'Wintermute accumulated $4.2M worth of ARB in the last hour', 
    time: '15 min ago', 
    severity: 'info',
    read: false,
    whatItMeans: 'Market maker accumulating - bullish signal for short-term',
    whatToDo: 'Consider ARB position, track Wintermute for follow-up moves'
  },
  { 
    id: 3, 
    type: 'new_token', 
    title: 'New Token Purchase', 
    message: 'a16z wallet bought EIGEN for the first time ($890K)', 
    time: '32 min ago', 
    severity: 'info',
    read: false,
    whatItMeans: 'Top VC entering new position - early alpha signal',
    whatToDo: 'Research EIGEN fundamentals, consider early position'
  },
  { 
    id: 4, 
    type: 'risky_approval', 
    title: 'Risky Approval', 
    message: 'Watched wallet approved unlimited USDC to unverified contract', 
    time: '1h ago', 
    severity: 'danger',
    read: true,
    whatItMeans: 'Security risk - wallet exposed to potential exploit',
    whatToDo: 'DO NOT interact with this contract, warn wallet owner if known'
  },
  { 
    id: 5, 
    type: 'sell_spike', 
    title: 'Sell Pressure', 
    message: 'Jump Trading distributed $12M worth of SOL to CEXes', 
    time: '2h ago', 
    severity: 'warning',
    read: true,
    whatItMeans: 'Market maker distributing - potential price drop incoming',
    whatToDo: 'Reduce SOL exposure, set stop-losses if holding'
  },
  { 
    id: 6, 
    type: 'buy_spike', 
    title: 'Accumulation Alert', 
    message: 'Unknown whale accumulated $8.9M in LINK over 24h', 
    time: '3h ago', 
    severity: 'info',
    read: true,
    whatItMeans: 'Large unknown player accumulating - bullish mid-term signal',
    whatToDo: 'Monitor for continuation, consider LINK position'
  },
  { 
    id: 7, 
    type: 'cex_deposit', 
    title: 'CEX Deposit', 
    message: 'Binance Hot Wallet received 1,200 BTC from unknown address', 
    time: '5h ago', 
    severity: 'warning',
    read: true,
    whatItMeans: 'Large BTC movement to exchange - potential sell pressure',
    whatToDo: 'Watch BTC price action, consider hedging if exposed'
  },
];

const alertTypeIcons = {
  cex_deposit: TrendingUp,
  buy_spike: TrendingUp,
  sell_spike: TrendingDown,
  new_token: Coins,
  risky_approval: ShieldAlert,
};

const severityColors = {
  warning: 'border-l-orange-500 bg-orange-50',
  info: 'border-l-blue-500 bg-blue-50',
  danger: 'border-l-red-500 bg-red-50',
};

const severityBadges = {
  warning: 'badge-orange',
  info: 'badge-blue',
  danger: 'badge-red',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(alertsData);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  const unreadCount = alerts.filter(a => !a.read).length;

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'unread' && !alert.read) || 
                       (filterRead === 'read' && alert.read);
    return matchesSeverity && matchesRead;
  });

  const markAsRead = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      
      <PageHeader 
        title="Alerts"
        description="Real-time notifications for your watchlist — deposits, spikes, and risk events"
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={markAllAsRead}
              className="btn btn-secondary btn-sm"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
            <button className="btn btn-secondary btn-sm">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-hint">Total Alerts</div>
                <div className="text-value-md">{alerts.length}</div>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-hint">Unread</div>
                <div className="text-value-md text-orange-600">{unreadCount}</div>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-hint">High Priority</div>
                <div className="text-value-md text-red-600">{alerts.filter(a => a.severity === 'danger').length}</div>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-hint">Read</div>
                <div className="text-value-md">{alerts.filter(a => a.read).length}</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-6">
        <GlassCard className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <span className="text-hint">Severity:</span>
              {['all', 'danger', 'warning', 'info'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`tab-btn ${filterSeverity === sev ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                >
                  {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-hint">Status:</span>
              {['all', 'unread', 'read'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterRead(status)}
                  className={`tab-btn ${filterRead === status ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Alerts List */}
      <div className="px-4 pb-8">
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <div className="text-body text-gray-500">No alerts match your filters</div>
            </GlassCard>
          ) : (
            filteredAlerts.map((alert) => {
              const Icon = alertTypeIcons[alert.type];
              return (
                <GlassCard 
                  key={alert.id} 
                  className={`p-4 border-l-4 ${severityColors[alert.severity]} ${!alert.read ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        alert.severity === 'danger' ? 'bg-red-100' :
                        alert.severity === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          alert.severity === 'danger' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-body font-semibold text-gray-900">{alert.title}</span>
                          <span className={`badge ${severityBadges[alert.severity]}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          {!alert.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-description mb-3">{alert.message}</p>
                        
                        {/* Vision v2: What it means + What to do */}
                        <div className="space-y-2 mb-2">
                          <div className="flex items-start gap-2 text-sm">
                            <span className="font-bold text-gray-700">💡 What it means:</span>
                            <span className="text-gray-600">{alert.whatItMeans}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="font-bold text-cyan-700">→ What to do:</span>
                            <span className="text-gray-900 font-medium">{alert.whatToDo}</span>
                          </div>
                        </div>
                        
                        <div className="text-hint mt-2">{alert.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.read && (
                        <button 
                          onClick={() => markAsRead(alert.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
