# 🚨 GiftGuard — 2-DAY EMERGENCY SPRINT PLAN
## Team 33 | CSIT440 Capstone | Build Everything in 48 Hours

---

> **LEGEND**:
> - 🤖 = I (AI) did this for you — just copy-paste into ServiceNow
> - 👤 = You must do this manually in ServiceNow (I'll tell you exactly what to click)
> - ✅ = Done

---

## TOTAL CHECKLIST (48 HOURS)

### DAY 1 — Core System (8–10 hours)
| # | Task | Who | File Ready? |
|---|---|---|---|
| 1 | Create Scoped App & Update Set | 👤 Manual | — |
| 2 | Create 3 Tables (all fields) | 👤 Manual | — |
| 3 | Create 4 Roles | 👤 Manual | — |
| 4 | Business Rule 1: Mask Card Number | 🤖 Copy-paste | `src/BR_01_MaskCard.js` |
| 5 | Business Rule 2: Calculate Risk Score | 🤖 Copy-paste | `src/BR_02_CalculateRisk.js` |
| 6 | Business Rule 3: Set SLA + Log | 🤖 Copy-paste | `src/BR_03_SetSLA.js` |
| 7 | Business Rule 4: Auto-Escalate | 🤖 Copy-paste | `src/BR_04_AutoEscalate.js` |
| 8 | Script Include: Fraud Scorer | 🤖 Copy-paste | `src/SI_FraudScorer.js` |
| 9 | Client Script: Form Validation | 🤖 Copy-paste | `src/CS_01_FormValidation.js` |
| 10 | Client Script: Balance Checker | 🤖 Copy-paste | `src/CS_02_BalanceChecker.js` |

### DAY 2 — Frontend + Workflow + Deploy (8–10 hours)
| # | Task | Who | File Ready? |
|---|---|---|---|
| 11 | UI Action: Approve Dispute | 🤖 Copy-paste | `src/UIA_01_Approve.js` |
| 12 | UI Action: Reject Dispute | 🤖 Copy-paste | `src/UIA_02_Reject.js` |
| 13 | UI Action: Escalate Dispute | 🤖 Copy-paste | `src/UIA_03_Escalate.js` |
| 14 | UI Action: Check Balance | 🤖 Copy-paste | `src/UIA_04_CheckBalance.js` |
| 15 | Create 4 Notifications | 👤 Manual (templates provided) | `src/NOTIF_Templates.md` |
| 16 | Inbound Email Action | 👤 Manual | — |
| 17 | Flow Designer Workflow | 👤 Manual (steps provided) | — |
| 18 | Integration Hub REST Action | 👤 Manual (config provided) | — |
| 19 | Service Portal / Record Producer | 👤 Manual | — |
| 20 | ACL Rules (5 rules) | 👤 Manual | — |
| 21 | Create Test Users (4) | 👤 Manual | — |
| 22 | Run 4 Test Cases | 👤 Manual | — |
| 23 | Export Update Set XML | 👤 Manual | — |

---

## DAY 1 — HOUR-BY-HOUR PLAN

### Hour 1–2: Setup (👤 MANUAL)
See: `STEP_BY_STEP_SERVICENOW.md` — Section 1

Tasks:
1. Create Scoped App
2. Create Update Set
3. Create 3 Tables
4. Create 4 Roles

### Hour 3–5: Business Rules (🤖 COPY-PASTE)
See: `src/` folder — all `BR_` files

Tasks:
1. Open each file
2. Follow the header comment for settings
3. Paste script into ServiceNow
4. Save + Test

### Hour 6–7: Script Include + Client Scripts
See: `src/SI_FraudScorer.js`, `src/CS_01_FormValidation.js`, `src/CS_02_BalanceChecker.js`

### Hour 8–10: Test Day 1 Work
- Insert a test dispute manually
- Verify: card number masked, risk score calculated, SLA set
- Check System Log for errors

---

## DAY 2 — HOUR-BY-HOUR PLAN

### Hour 1–2: UI Actions (🤖 COPY-PASTE)
See: `src/UIA_*.js` files

### Hour 3–4: Notifications + Inbound Email (👤 MANUAL)
See: `STEP_BY_STEP_SERVICENOW.md` — Section 5
Templates in: `src/NOTIF_Templates.md`

### Hour 5–6: Flow Designer + Integration Hub (👤 MANUAL)
See: `STEP_BY_STEP_SERVICENOW.md` — Section 6 & 7

### Hour 7: Service Portal / Record Producer (👤 MANUAL)
See: `STEP_BY_STEP_SERVICENOW.md` — Section 8

### Hour 8: ACL Rules + Test Users (👤 MANUAL)
See: `STEP_BY_STEP_SERVICENOW.md` — Section 9

### Hour 9: Run All 4 Test Cases
See: `STEP_BY_STEP_SERVICENOW.md` — Section 10

### Hour 10: Export Update Set
See: `STEP_BY_STEP_SERVICENOW.md` — Section 11

---

## FILES CREATED FOR YOU

```
src/
├── BR_01_MaskCard.js           ← Business Rule 1
├── BR_02_CalculateRisk.js      ← Business Rule 2
├── BR_03_SetSLA.js             ← Business Rule 3
├── BR_04_AutoEscalate.js       ← Business Rule 4
├── SI_FraudScorer.js           ← Script Include (Fraud Scorer Module)
├── CS_01_FormValidation.js     ← Client Script 1
├── CS_02_BalanceChecker.js     ← Client Script 2
├── UIA_01_Approve.js           ← UI Action: Approve
├── UIA_02_Reject.js            ← UI Action: Reject
├── UIA_03_Escalate.js          ← UI Action: Escalate
├── UIA_04_CheckBalance.js      ← UI Action: Check Balance
└── NOTIF_Templates.md          ← All 4 notification templates

STEP_BY_STEP_SERVICENOW.md     ← Manual steps guide
```

---

**START WITH**: `STEP_BY_STEP_SERVICENOW.md` → Section 1
**THEN**: Copy each `src/` file one by one into ServiceNow following the header comment in each file.
