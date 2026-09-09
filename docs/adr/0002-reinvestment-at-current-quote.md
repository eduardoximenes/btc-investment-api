---
status: accepted
---

# Reinvestment residual is valued at the current BTC quote, not the original purchase quote

RF09 says a partial liquidation's last Investment is closed completely, and the residual R$ is "reinvestido usando a cotação original do BTC" — ambiguous between (A) the historical price of the original purchase, or (C) "cotação do momento", the same rule RF07 already uses for every other purchase. We chose C: the residual is reinvested at the current quote, exactly like any other purchase in the system. This keeps `amount_invested_brl ÷ btc_price_at_purchase = amount_btc` true for every Investment with no special case, and conserves value exactly — nothing is created or destroyed by the liquidation.

**Risk assumed**: this reading diverges from the edital's literal wording, which points at something historical ("original"). If evaluated strictly against reading A, this is a deliberate, documented divergence — not an oversight.
