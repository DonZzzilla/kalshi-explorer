# Kalshi Prediction Market API Reference

Base URL: `https://external-api.kalshi.com/trade-api/v2`
WebSocket: `wss://external-api.kalshi.com/trade-api/ws/v2`

## Key Concepts
- Series = recurring topic (e.g. KXHIGHNY)
- Events = specific instances of a series
- Markets = binary YES/NO contracts
- Prices = implied probability (75 cents = 75%)
- 1 contract = $1 if correct, $0 if wrong

## Public Endpoints (No Auth)

| Endpoint | Description |
|----------|-------------|
| GET /series/{ticker} | Series info |
| GET /markets | List markets (status, series_ticker, cursor, limit) |
| GET /markets/{ticker} | Single market details |
| GET /markets/{ticker}/orderbook | Order book |
| GET /events | List events |
| GET /events/{event_id} | Event details |

Pagination: cursor-based via `cursor` response field.
Orderbook prices are in cents (75 = 75¢ = $0.75).

## Authenticated Endpoints (API Key + HMAC-SHA256)

| Endpoint | Description |
|----------|-------------|
| GET /portfolio/balance | Account balance |
| GET /portfolio/positions | Current positions |
| GET /portfolio/orders | Open/filled orders |
| GET /portfolio/fills | Trade history |
| POST /portfolio/orders | Submit order |
| DELETE /portfolio/orders/{id} | Cancel order |

Auth headers:
```
KALSHI-ACCESS-KEY: key
KALSHI-ACCESS-TIMESTAMP: <milliseconds>
KALSHI-ACCESS-SIGNATURE: HMAC-SHA256(timestamp+method+path+body, secret)
```

Rate limits: ~10 tokens/request, budget varies by tier.

Order JSON fields: ticker, action (buy/sell), type (limit/market), side (yes/no), count, price (cents).

## Scanner Workflow
1. GET /markets paginated (up to 20 pages x 100)
2. GET /orderbook for each market
3. mid=(bid+ask)/2, implied=mid/100
4. Apply model, compute edge
5. Filter: spread<5 AND volume>1000
6. Sort by edge×volume, return top 10

## Vs Polymarket
- Kalshi: API key + HMAC auth, CFTC-regulated, 0% fees
- Polymarket: EIP-712 wallet sigs, CFTC-regulated, 0% fees

## SDKs
- pip install kalshi-python (official)
- pip install pykalshi (typed, async, pandas)

## Earnings Reality
- Sustainable edge: 1-5% after spread
- Bets fillable/day: 5-20
- Realistic annual on $1K bankroll: $220-$2,200
- Risk of ruin: HIGH without circuit breakers