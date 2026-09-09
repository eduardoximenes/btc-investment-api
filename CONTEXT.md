# BTC Investment

An API where a User deposits BRL, converts it to BTC at the current market Quote, and tracks the resulting Investments over time.

## Language

**User**:
A person who registers with name, email and password, and authenticates to invest.

**Account**:
A User's BRL cash wallet. Holds only `balance_brl`. There is no persisted BTC balance — BTC exposure is always derived by summing the `amount_btc` of that User's open Investments.
_Avoid: Wallet (reserved, if ever needed, for a future multi-currency concept)_

**Investment**:
A single BTC purchase: the BRL amount put in, the Quote price at the moment of purchase, and the resulting BTC quantity. Stays `open` until fully liquidated by a sale, then becomes `liquidated`. A partial liquidation that leaves a residual creates a **new** Investment (see Transaction: reinvestment) rather than mutating the original.

**Position**:
The read-only, computed view over a User's open Investments (RF08): for each one, purchase date, amount invested, Quote at purchase, % variation vs. the current Quote, and current gross value. Not a stored entity.

**Transaction**:
An immutable ledger entry recording a movement of money or BTC. `type` is one of:

- **deposit** — BRL credited to the Account from outside the platform (RF04).
- **purchase** — BRL debited from the Account to open a new Investment, converted at the Quote's `sell` price (RF07).
- **sale** — one or more Investments fully liquidated in FIFO order at the Quote's `buy` price. `amount_btc` is the real total BTC removed from those closed Investments; `amount_brl` is only the amount actually credited back to the Account (RF09). When the last Investment touched is worth more than requested, the two figures diverge on purpose — the gap is the residual, fully accounted for by a paired `reinvestment` Transaction (see ADR-0004 for why this two-transaction shape exists at all, instead of just partially reducing the touched Investment).
- **reinvestment** — the residual BRL left over when a partial liquidation fully closes its last touched Investment; immediately reopened as a new Investment at the current Quote (RF09).

_Avoid: "buy"/"sell" as transaction types — those words are reserved for the Quote's own `buy`/`sell` fields, not for what the platform's customer does._

**Statement**:
The chronological listing of a User's deposit / purchase / sale / reinvestment Transactions, filterable by date range, defaulting to the last 90 days (RF10).
_Avoid: Extract — false cognate of the Portuguese "extrato". The 2019 reference API used `/extract`; this implementation exposes `/statement`._

**Quote**:
The current BTC ticker from Mercado Bitcoin. `sell` is the price the platform charges a User buying BTC (used for `purchase`); `buy` is the price the platform pays a User selling BTC back (used for `sale`).
_Avoid: Ticker in domain/glossary language — "Ticker" is the external API's own vocabulary; internally this concept is the Quote._

**Volume**:
The sum, for the authenticated User only, of BTC amounts across that User's `purchase` and `sale` Transactions created today (RF11). Never derived from the external ticker's `vol` field — that figure is exchange-wide, not platform-specific.

**QuoteHistory**:
A snapshot of the Quote taken every 10 minutes, exposed as the last 24h of history (RF12) and purged once older than 90 days.
