"""
Flow Intel Analytics API
========================
A FastAPI backend for the Flow Intel on-chain analytics platform.

Enhanced with filtering, sorting, and realistic mock data.
"""

from fastapi import FastAPI, APIRouter, Query, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Set
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="Flow Intel Analytics API",
    description="On-chain analytics platform for tracking liquidity movements",
    version="2.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ REALISTIC MOCK DATA WITH LOGOS ============

# Real crypto logos URLs (CoinMarketCap CDN - stable)
LOGOS = {
    # Exchanges
    "binance": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png",
    "bybit": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/521.png",
    "kraken": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/24.png",
    "okx": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/294.png",
    "htx": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/102.png",
    "coinbase": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/89.png",
    "kucoin": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/311.png",
    "gate_io": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/302.png",
    "bitget": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/507.png",
    "mexc": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/544.png",
    "upbit": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/368.png",
    "bithumb": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/75.png",
    
    # Tokens
    "btc": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
    "eth": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    "usdt": "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
    "usdc": "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
    "bnb": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    "sol": "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
    "xrp": "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
    "ada": "https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png",
    "doge": "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
    "trx": "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
    "avax": "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
    "matic": "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
    "link": "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
    "uni": "https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png",
    "atom": "https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png",
    "arb": "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
    "op": "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
}

# Top Entities for carousel with real logos
TOP_ENTITIES = [
    {"name": "Binance", "price": "$84.21B", "change": "+1.23%", "is_positive": True, "logo": LOGOS["binance"]},
    {"name": "Bybit", "price": "$28.41B", "change": "+0.38%", "is_positive": True, "logo": LOGOS["bybit"]},
    {"name": "Kraken", "price": "$12.4B", "change": "+0.12%", "is_positive": True, "logo": LOGOS["kraken"]},
    {"name": "OKX", "price": "$18.7B", "change": "-0.45%", "is_positive": False, "logo": LOGOS["okx"]},
    {"name": "Coinbase", "price": "$67.5B", "change": "+2.14%", "is_positive": True, "logo": LOGOS["coinbase"]},
    {"name": "HTX", "price": "$6.8B", "change": "-0.67%", "is_positive": False, "logo": LOGOS["htx"]},
    {"name": "KuCoin", "price": "$5.2B", "change": "+1.89%", "is_positive": True, "logo": LOGOS["kucoin"]},
    {"name": "Gate.io", "price": "$4.1B", "change": "-0.34%", "is_positive": False, "logo": LOGOS["gate_io"]},
]

# Featured tokens with real logos
FEATURED_TOKENS = {
    "btc": {
        "id": "btc",
        "name": "Bitcoin",
        "symbol": "BTC",
        "price": 94250.43,
        "change_24h": 2.14,
        "volume_24h": 42890000000,
        "market_cap": 1856420000000,
        "fdv": 1980000000000,
        "current_supply": "19,600,000",
        "max_supply": "21,000,000",
        "ath": 108200.00,
        "atl": 67.81,
        "logo": LOGOS["btc"],
        "color": "#F7931A"
    },
    "eth": {
        "id": "eth",
        "name": "Ethereum",
        "symbol": "ETH",
        "price": 3342.18,
        "change_24h": 1.87,
        "volume_24h": 18450000000,
        "market_cap": 401680000000,
        "fdv": 401680000000,
        "current_supply": "120,200,000",
        "max_supply": "∞",
        "ath": 4891.70,
        "atl": 0.43,
        "logo": LOGOS["eth"],
        "color": "#627EEA"
    },
    "sol": {
        "id": "sol",
        "name": "Solana",
        "symbol": "SOL",
        "price": 178.43,
        "change_24h": 4.56,
        "volume_24h": 5670000000,
        "market_cap": 84320000000,
        "fdv": 105800000000,
        "current_supply": "472,500,000",
        "max_supply": "593,000,000",
        "ath": 259.96,
        "atl": 0.50,
        "logo": LOGOS["sol"],
        "color": "#14F195"
    },
    "usdt": {
        "id": "usdt",
        "name": "Tether",
        "symbol": "USDT",
        "price": 1.00,
        "change_24h": -0.01,
        "volume_24h": 68900000000,
        "market_cap": 135600000000,
        "fdv": 135600000000,
        "current_supply": "135,600,000,000",
        "max_supply": "∞",
        "ath": 1.32,
        "atl": 0.57,
        "logo": LOGOS["usdt"],
        "color": "#26A17B"
    },
}

# Exchange flows data with real tokens
EXCHANGE_FLOWS_BASE = [
    {"asset": "BTC", "logo": LOGOS["btc"], "price": 94250.43, "price_change": 2.14, "volume": 42890000000, "volume_change": 12.45, "netflow": 245000000, "netflow_change": 8.34, "color": "#F7931A"},
    {"asset": "ETH", "logo": LOGOS["eth"], "price": 3342.18, "price_change": 1.87, "volume": 18450000000, "volume_change": -5.67, "netflow": -128000000, "netflow_change": -12.45, "color": "#627EEA"},
    {"asset": "SOL", "logo": LOGOS["sol"], "price": 178.43, "price_change": 4.56, "volume": 5670000000, "volume_change": 23.12, "netflow": 78500000, "netflow_change": 45.23, "color": "#14F195"},
    {"asset": "USDT", "logo": LOGOS["usdt"], "price": 1.00, "price_change": -0.01, "volume": 68900000000, "volume_change": 3.45, "netflow": 890000000, "netflow_change": 15.67, "color": "#26A17B"},
    {"asset": "BNB", "logo": LOGOS["bnb"], "price": 612.34, "price_change": 1.23, "volume": 2340000000, "volume_change": -8.90, "netflow": -45000000, "netflow_change": -23.45, "color": "#F3BA2F"},
    {"asset": "XRP", "logo": LOGOS["xrp"], "price": 2.87, "price_change": -2.34, "volume": 4560000000, "volume_change": 18.23, "netflow": 123000000, "netflow_change": 34.56, "color": "#23292F"},
    {"asset": "ADA", "logo": LOGOS["ada"], "price": 0.98, "price_change": 3.45, "volume": 1230000000, "volume_change": -12.34, "netflow": -23000000, "netflow_change": -45.67, "color": "#0033AD"},
    {"asset": "AVAX", "logo": LOGOS["avax"], "price": 38.67, "price_change": 2.89, "volume": 890000000, "volume_change": 15.67, "netflow": 34000000, "netflow_change": 28.90, "color": "#E84142"},
    {"asset": "DOGE", "logo": LOGOS["doge"], "price": 0.34, "price_change": -1.23, "volume": 1890000000, "volume_change": -23.45, "netflow": -67000000, "netflow_change": -34.56, "color": "#C2A633"},
    {"asset": "MATIC", "logo": LOGOS["matic"], "price": 0.87, "price_change": 1.56, "volume": 670000000, "volume_change": 8.90, "netflow": 12000000, "netflow_change": 12.34, "color": "#8247E5"},
    {"asset": "LINK", "logo": LOGOS["link"], "price": 23.45, "price_change": 2.67, "volume": 780000000, "volume_change": -5.67, "netflow": 23000000, "netflow_change": 18.90, "color": "#2A5ADA"},
    {"asset": "UNI", "logo": LOGOS["uni"], "price": 12.34, "price_change": -3.45, "volume": 560000000, "volume_change": 23.45, "netflow": -34000000, "netflow_change": -28.90, "color": "#FF007A"},
]

# Entity balance changes for token detail page
ENTITY_BALANCE_CHANGES_BASE = [
    {"name": "Binance", "type": "CEX", "logo": LOGOS["binance"], "value": 412810000, "value_change": 0.77, "usd": 23790000, "usd_change": 1.63},
    {"name": "Bybit", "type": "CEX", "logo": LOGOS["bybit"], "value": 178450000, "value_change": 2.34, "usd": 10280000, "usd_change": 3.21},
    {"name": "OKX", "type": "CEX", "logo": LOGOS["okx"], "value": 89200000, "value_change": 2.45, "usd": 5140000, "usd_change": 3.31},
    {"name": "Kraken", "type": "CEX", "logo": LOGOS["kraken"], "value": 15670000, "value_change": -0.12, "usd": 903500, "usd_change": 0.74},
    {"name": "Coinbase", "type": "CEX", "logo": LOGOS["coinbase"], "value": 234560000, "value_change": 1.89, "usd": 13500000, "usd_change": 2.76},
    {"name": "HTX", "type": "CEX", "logo": LOGOS["htx"], "value": 5150000, "value_change": 1.07, "usd": 296700, "usd_change": 1.93},
    {"name": "KuCoin", "type": "CEX", "logo": LOGOS["kucoin"], "value": 34560000, "value_change": 3.45, "usd": 1990000, "usd_change": 4.32},
    {"name": "Bithumb", "type": "CEX", "logo": LOGOS["bithumb"], "value": 28450000, "value_change": 1.28, "usd": 1640000, "usd_change": 2.14},
    {"name": "Upbit", "type": "CEX", "logo": LOGOS["upbit"], "value": 67890000, "value_change": -0.89, "usd": 3910000, "usd_change": 0.12},
    {"name": "Uniswap", "type": "DEX", "logo": LOGOS["uni"], "value": 45670000, "value_change": -0.45, "usd": 2630000, "usd_change": 0.41},
]

# Top holders for token detail page
TOP_HOLDERS_BASE = [
    {"name": "Binance: Cold Wallet", "address": "0xF977814e90dA44bFA03b6295A0616a897441aceC", "is_entity": True, "logo": LOGOS["binance"], "value": 398417870.95, "pct": 19.92, "usd": 22090000},
    {"name": "Bybit: Cold Wallet", "address": "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", "is_entity": True, "logo": LOGOS["bybit"], "value": 229965767.73, "pct": 11.5, "usd": 12750000},
    {"name": "Unknown Wallet", "address": "0xa2B741C8b4c840082c14A4aDEBFA3F2eAE45d022", "is_entity": False, "logo": None, "value": 293116664, "pct": 14.66, "usd": 16250000},
    {"name": "OKX: Hot Wallet", "address": "0x98C3d3183C4b8A650614ad179A1a98be0a8d6B8E", "is_entity": True, "logo": LOGOS["okx"], "value": 133362169.33, "pct": 6.67, "usd": 7390000},
    {"name": "Unknown Wallet", "address": "0x18051a9c643077DC1A14d49E1B804dC857750287", "is_entity": False, "logo": None, "value": 119638020.93, "pct": 5.98, "usd": 6630000},
    {"name": "Kraken: Cold Wallet", "address": "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0", "is_entity": True, "logo": LOGOS["kraken"], "value": 98450000, "pct": 4.92, "usd": 5460000},
]

# Chain configuration
CHAINS = {
    "ethereum": {"color": "#627EEA", "icon": "⟠", "name": "Ethereum"},
    "base": {"color": "#0052FF", "icon": "⟠", "name": "Base"},
    "polygon": {"color": "#8247E5", "icon": "⬡", "name": "Polygon"},
    "tron": {"color": "#FF0013", "icon": "◆", "name": "TRON"},
    "bsc": {"color": "#F3BA2F", "icon": "◈", "name": "BSC"},
    "arbitrum": {"color": "#28A0F0", "icon": "◆", "name": "Arbitrum"},
    "optimism": {"color": "#FF0420", "icon": "○", "name": "Optimism"},
}

# ============ HELPER FUNCTIONS ============

def format_number(num):
    """Format large numbers with K, M, B suffixes"""
    if num >= 1_000_000_000:
        return f"${num/1_000_000_000:.2f}B"
    elif num >= 1_000_000:
        return f"${num/1_000_000:.2f}M"
    elif num >= 1_000:
        return f"${num/1_000:.2f}K"
    else:
        return f"${num:.2f}"

def generate_address():
    """Generate a random Ethereum-style address"""
    return "0x" + "".join(random.choices("0123456789abcdef", k=40))

def generate_transfer(token_filter=None):
    """Generate a mock transfer transaction"""
    chain = random.choice(list(CHAINS.keys()))
    
    if token_filter:
        token = token_filter
        token_logo = LOGOS.get(token.lower(), LOGOS["eth"])
    else:
        tokens = list(FEATURED_TOKENS.keys())
        token = random.choice(tokens).upper()
        token_logo = FEATURED_TOKENS[token.lower()]["logo"]
    
    token_colors = {
        "BTC": "#F7931A", "ETH": "#627EEA", "SOL": "#14F195",
        "USDT": "#26A17B", "USDC": "#2775CA", "BNB": "#F3BA2F",
        "XRP": "#23292F", "TRX": "#FF0013", "ADA": "#0033AD"
    }
    
    times = ["just now", "1 min ago", "2 mins ago", "5 mins ago", "10 mins ago", "30 mins ago", "1 hour ago"]
    
    exchanges = [
        ("Binance Deposit", "Binance: Hot Wallet", LOGOS["binance"]),
        ("Bybit Deposit", "Bybit: Hot Wallet", LOGOS["bybit"]),
        ("Kraken Deposit", "Kraken: Hot Wallet", LOGOS["kraken"]),
        ("Coinbase Deposit", "Coinbase: Hot Wallet", LOGOS["coinbase"]),
        (None, None, None),
    ]
    label_data = random.choice(exchanges)
    
    value = random.randint(1, 100000)
    usd_value = value * random.uniform(0.5, 10000)
    
    return {
        "id": str(uuid.uuid4()),
        "chain": chain,
        "chain_color": CHAINS[chain]["color"],
        "chain_icon": CHAINS[chain]["icon"],
        "time": random.choice(times),
        "from_address": generate_address()[:25] + "...",
        "from_label": label_data[0],
        "from_logo": label_data[2],
        "to_address": generate_address()[:25] + "...",
        "to_label": label_data[1],
        "to_logo": label_data[2],
        "value": f"{value:,}",
        "token": token,
        "token_logo": token_logo,
        "token_color": token_colors.get(token, "#627EEA"),
        "usd": format_number(usd_value),
        "usd_raw": usd_value
    }

def generate_price_history(token_id, period="ALL"):
    """Generate realistic price history data"""
    token = FEATURED_TOKENS.get(token_id.lower(), FEATURED_TOKENS["btc"])
    base_price = token["price"]
    
    # Different data points based on period
    periods = {
        "1W": 7,
        "1M": 30,
        "3M": 90,
        "1Y": 365,
        "ALL": 365 * 3  # 3 years
    }
    
    days = periods.get(period, 365 * 3)
    data = []
    
    for i in range(days):
        # Create realistic price movement
        variation = random.uniform(-0.05, 0.05)  # ±5% daily variation
        price = base_price * (1 + variation * (days - i) / days)
        
        # Add some trend
        if period == "1W":
            date_str = f"Day {i+1}"
        elif period == "1M":
            date_str = f"Day {i+1}"
        elif period == "3M":
            date_str = f"Week {i//7 + 1}"
        elif period == "1Y":
            date_str = f"Month {i//30 + 1}"
        else:
            year = 2023 + i // 365
            month = (i % 365) // 30 + 1
            date_str = f"{year}-{month:02d}"
        
        data.append({
            "date": date_str,
            "price": round(price, 2)
        })
    
    return data

# ============ API ENDPOINTS ============

@api_router.get("/")
async def root():
    """API health check"""
    return {
        "message": "Flow Intel Analytics API",
        "version": "2.0.0",
        "status": "healthy",
        "features": ["filtering", "sorting", "pagination", "real_logos"]
    }

@api_router.get("/entities")
async def get_entities():
    """Get top entities for carousel"""
    return {"entities": TOP_ENTITIES}

@api_router.get("/exchange-flows")
async def get_exchange_flows(
    sort_by: Optional[str] = Query(None, description="Field to sort by: volume, price, netflow"),
    filter_type: Optional[str] = Query(None, description="Filter by type: CEX+DEX, MARKET CAP, VOLUME"),
    limit: int = Query(default=10, le=50)
):
    """Get exchange flow data with filtering and sorting"""
    flows = EXCHANGE_FLOWS_BASE.copy()
    
    # Apply sorting
    if sort_by == "volume":
        flows.sort(key=lambda x: x["volume"], reverse=True)
    elif sort_by == "price":
        flows.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "netflow":
        flows.sort(key=lambda x: abs(x["netflow"]), reverse=True)
    
    # Format for frontend
    formatted_flows = []
    for flow in flows[:limit]:
        formatted_flows.append({
            "asset": flow["asset"],
            "logo": flow["logo"],
            "color": flow["color"],
            "price": format_number(flow["price"]) if flow["price"] > 100 else f"${flow['price']:.2f}",
            "price_change": flow["price_change"],
            "volume": format_number(flow["volume"]),
            "volume_change": flow["volume_change"],
            "netflow": format_number(flow["netflow"]),
            "netflow_change": flow["netflow_change"]
        })
    
    return {"flows": formatted_flows}

@api_router.get("/transfers")
async def get_transfers(
    limit: int = Query(default=15, le=50),
    min_usd: Optional[float] = Query(None, description="Minimum USD value"),
    token: Optional[str] = Query(None, description="Filter by token"),
    sort_by: Optional[str] = Query("time", description="Sort by: time, value, usd"),
    page: int = Query(default=1, ge=1)
):
    """Get recent transfers with filtering and sorting"""
    # Generate transfers
    transfers = [generate_transfer(token) for _ in range(limit * 3)]
    
    # Apply USD filter
    if min_usd:
        transfers = [t for t in transfers if t["usd_raw"] >= min_usd]
    
    # Apply sorting
    if sort_by == "value":
        transfers.sort(key=lambda x: float(x["value"].replace(",", "")), reverse=True)
    elif sort_by == "usd":
        transfers.sort(key=lambda x: x["usd_raw"], reverse=True)
    
    # Pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated = transfers[start_idx:end_idx]
    
    return {
        "transfers": paginated,
        "total": len(transfers),
        "page": page,
        "total_pages": (len(transfers) + limit - 1) // limit
    }

@api_router.get("/tokens")
async def get_tokens():
    """Get all featured tokens"""
    return {"tokens": list(FEATURED_TOKENS.values())}

@api_router.get("/tokens/{token_id}")
async def get_token(token_id: str):
    """Get token details by ID"""
    token = FEATURED_TOKENS.get(token_id.lower())
    if not token:
        token = FEATURED_TOKENS["btc"]  # Default fallback
    return token

@api_router.get("/tokens/{token_id}/balance-changes")
async def get_token_balance_changes(
    token_id: str,
    filter_type: Optional[str] = Query(None, description="Filter by type: CEX, DEX, ALL"),
    sort_by: Optional[str] = Query("usd", description="Sort by: value, usd, change")
):
    """Get entity balance changes for a token with filtering and sorting"""
    changes = ENTITY_BALANCE_CHANGES_BASE.copy()
    
    # Apply type filter
    if filter_type and filter_type != "ALL":
        changes = [c for c in changes if c["type"] == filter_type]
    
    # Apply sorting
    if sort_by == "value":
        changes.sort(key=lambda x: x["value"], reverse=True)
    elif sort_by == "usd":
        changes.sort(key=lambda x: x["usd"], reverse=True)
    elif sort_by == "change":
        changes.sort(key=lambda x: abs(x["value_change"]), reverse=True)
    
    # Format for frontend
    formatted_changes = []
    for change in changes:
        formatted_changes.append({
            "name": change["name"],
            "type": change["type"],
            "logo": change["logo"],
            "value": format_number(change["value"]),
            "value_change": f"{'+' if change['value_change'] >= 0 else ''}{change['value_change']:.2f}%",
            "usd": format_number(change["usd"]),
            "usd_change": f"{'+' if change['usd_change'] >= 0 else ''}{change['usd_change']:.2f}%"
        })
    
    return {"changes": formatted_changes}

@api_router.get("/tokens/{token_id}/holders")
async def get_token_holders(token_id: str, view_type: str = Query("addresses", description="View type: addresses or entities")):
    """Get top holders for a token"""
    holders = TOP_HOLDERS_BASE.copy()
    
    # Filter by view type
    if view_type == "entities":
        holders = [h for h in holders if h["is_entity"]]
    
    # Format for frontend
    formatted_holders = []
    for holder in holders:
        formatted_holders.append({
            "name": holder["name"] if holder["is_entity"] else holder["address"],
            "is_entity": holder["is_entity"],
            "logo": holder["logo"],
            "value": f"{holder['value']:,.2f}",
            "pct": f"{holder['pct']:.2f}%",
            "usd": format_number(holder["usd"])
        })
    
    return {"holders": formatted_holders}

@api_router.get("/tokens/{token_id}/transfers")
async def get_token_transfers(
    token_id: str,
    limit: int = Query(default=10, le=50),
    page: int = Query(default=1, ge=1)
):
    """Get transfers for a specific token"""
    token = FEATURED_TOKENS.get(token_id.lower(), FEATURED_TOKENS["btc"])
    transfers = [generate_transfer(token["symbol"]) for _ in range(limit)]
    
    return {
        "transfers": transfers,
        "total": 625,
        "page": page,
        "total_pages": 63
    }

@api_router.get("/tokens/{token_id}/price-history")
async def get_price_history_endpoint(
    token_id: str,
    period: str = Query("ALL", description="Time period: 1W, 1M, 3M, 1Y, ALL")
):
    """Get price history for charting"""
    data = generate_price_history(token_id, period)
    
    return {
        "token_id": token_id,
        "period": period,
        "data": data
    }

@api_router.get("/tokens/{token_id}/open-interest")
async def get_open_interest(
    token_id: str,
    period: str = Query("1M", description="Time period"),
    exchange: Optional[str] = Query(None, description="Filter by exchange: binance, bybit")
):
    """Get open interest data for charting"""
    data = []
    points = 30 if period == "1M" else 90
    
    for i in range(points):
        point = {
            "date": str(i),
            "binance": round(random.uniform(1.5, 3.5), 2),
            "bybit": round(random.uniform(0.5, 1.5), 2)
        }
        data.append(point)
    
    return {"data": data, "period": period}

@api_router.get("/tokens/{token_id}/cex-volume")
async def get_cex_volume(
    token_id: str,
    period: str = Query("24H", description="Time period: 24H, 7D, 30D"),
    volume_type: str = Query("spot", description="Volume type: spot or perp"),
    exchange: Optional[str] = Query(None, description="Filter by exchange")
):
    """Get CEX volume data for charting"""
    data = []
    hours = 24 if period == "24H" else (168 if period == "7D" else 720)
    
    for i in range(min(hours, 24)):  # Max 24 data points for chart
        hour = f"{i:02d}:00"
        point = {
            "time": hour,
            "binance": random.randint(100, 800),
            "bybit": random.randint(50, 200)
        }
        data.append(point)
    
    return {"data": data, "period": period, "type": volume_type}

@api_router.get("/market-stats")
async def get_market_stats():
    """Get market statistics"""
    return {
        "total_market_cap": "$3.102.5T",
        "market_cap_change": "+0.49%",
        "btc_dominance": "58.47%",
        "btc_change": "-0.01%",
        "eth_dominance": "12.13%",
        "eth_change": "+0.08%",
        "volume_24h": "$158.3B",
        "volume_change": "+28.19%",
        "fear_greed": 68
    }

# ============ WEBSOCKET MANAGER ============

class ConnectionManager:
    """Manages WebSocket connections and broadcasts"""
    
    def __init__(self):
        self.active_connections: Dict[WebSocket, Set[str]] = {}
        self._broadcast_task: Optional[asyncio.Task] = None
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[websocket] = set()
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    def subscribe(self, websocket: WebSocket, channel: str):
        if websocket in self.active_connections:
            self.active_connections[websocket].add(channel)
            logger.info(f"Subscribed to channel: {channel}")
    
    def unsubscribe(self, websocket: WebSocket, channel: str):
        if websocket in self.active_connections:
            self.active_connections[websocket].discard(channel)
            logger.info(f"Unsubscribed from channel: {channel}")
    
    async def send_personal(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
    
    async def broadcast(self, message: dict, channel: str = None):
        """Broadcast message to all connections or specific channel subscribers"""
        disconnected = []
        for connection, channels in self.active_connections.items():
            try:
                if channel is None or channel in channels:
                    await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)
    
    async def start_broadcast_loop(self):
        """Start background task for periodic broadcasts"""
        if self._broadcast_task is None or self._broadcast_task.done():
            self._broadcast_task = asyncio.create_task(self._broadcast_loop())
    
    async def _broadcast_loop(self):
        """Periodically broadcast updates to connected clients"""
        while True:
            try:
                await asyncio.sleep(5)  # Send updates every 5 seconds
                
                if not self.active_connections:
                    continue
                
                # Broadcast new transfer
                transfer = generate_transfer()
                await self.broadcast({
                    "type": "transfer",
                    "payload": transfer,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }, channel="transfers")
                
                # Broadcast market stats update
                market_stats = {
                    "total_market_cap": f"${random.uniform(3.0, 3.2):.3f}T",
                    "btc_dominance": f"{random.uniform(57, 60):.2f}%",
                    "eth_dominance": f"{random.uniform(11, 13):.2f}%",
                    "volume_24h": f"${random.uniform(140, 170):.1f}B",
                    "fear_greed": random.randint(60, 80)
                }
                await self.broadcast({
                    "type": "market_stats",
                    "payload": market_stats,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }, channel="market")
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Broadcast loop error: {e}")
                await asyncio.sleep(1)

# Global connection manager
ws_manager = ConnectionManager()

# ============ WEBSOCKET ENDPOINTS ============

@api_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await ws_manager.connect(websocket)
    
    # Start broadcast loop if not running
    await ws_manager.start_broadcast_loop()
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                action = message.get("action")
                
                if action == "subscribe":
                    channel = message.get("channel")
                    if channel:
                        ws_manager.subscribe(websocket, channel)
                        await ws_manager.send_personal(websocket, {
                            "type": "subscribed",
                            "channel": channel
                        })
                
                elif action == "unsubscribe":
                    channel = message.get("channel")
                    if channel:
                        ws_manager.unsubscribe(websocket, channel)
                        await ws_manager.send_personal(websocket, {
                            "type": "unsubscribed",
                            "channel": channel
                        })
                
                elif action == "pong":
                    pass  # Heartbeat response
                
            except json.JSONDecodeError:
                await ws_manager.send_personal(websocket, {
                    "type": "error",
                    "message": "Invalid JSON"
                })
                
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

# ============ APP CONFIGURATION ============

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown"""
    client.close()
