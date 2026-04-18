# GiftGuard: Complete Solution Summary
## CSIT440 Capstone — Team 33

---

## 1. THE PROBLEM

Gift cards are one of the most targeted financial instruments for fraud. Common attack vectors include:

- **Card Skimming**: Physical readers on card racks that silently clone barcode/magnetic data
- **Online Scraping Bots**: Automated tools that brute-force card numbers and PINs on retailer websites
- **Social Engineering Scams**: Customers tricked into sharing card numbers with fraudsters
- **Insider Theft**: Retail employees photographing cards before they are sold

**The Result**: A customer purchases or receives a gift card, goes to use it, and finds the balance has been drained — often days or weeks before they ever had a chance to use it.

**The Gap**: Most retailers have no standardized system to:
- Accept and track fraud disputes
- Score the credibility of each dispute
- Route disputes to the right analyst with the right SLA
- Notify customers at every step

---

## 2. THE SOLUTION — GiftGuard

**GiftGuard** is a ServiceNow Scoped Application that provides a complete, end-to-end gift card fraud intake and resolution platform for retail chains and e-commerce wallets.

### What It Does (End-to-End Flow)

```
CUSTOMER EXPERIENCE:
  1. Customer checks balance → Balance is wrong
  2. Customer visits Service Portal
  3. Customer fills out dispute form + uploads receipt
  4. System confirms receipt: "We received your dispute."

AUTOMATED ENGINE:
  5. Business Rule fires → Calculates 6-factor Fraud Risk Score (0-100)
  6. Gift card number masked to last 4 digits (security)
  7. SLA target date set (5 days, 2 days, or 24 hours depending on risk)
  8. Flow Designer workflow triggers → Routes to correct analyst

ANALYST WORKFLOW:
  9.  Analyst receives email: "New high-risk dispute assigned."
  10. Analyst opens dispute → Reviews evidence
  11. Analyst clicks APPROVE or REJECT (UI Action)
  12. Business Rule updates status, logs decision, records decision date

CUSTOMER RESOLUTION:
  13. Customer receives email: "Your dispute was approved. $XXX refund in 3-5 days."
  14. Finance team notified for refund processing
  15. Dispute closed with full audit trail
```

---

## 3. SYSTEM COMPONENTS (All 8 Required)

| # | Component | What It Does in GiftGuard |
|---|---|---|
| 1 | **Client Scripts** | Validate forms (email, phone, card format), balance checker button |
| 2 | **Business Rules** | Auto-calculate risk score, mask card number, set SLA, auto-escalate |
| 3 | **UI Actions** | Approve, Reject, Escalate buttons on dispute form |
| 4 | **Notifications** | 4 automated emails throughout the process |
| 5 | **Integration Hub** | REST call to fraud/balance API (or rule-based fallback) |
| 6 | **Flow Designer** | Orchestrates entire intake → route → notify workflow |
| 7 | **Service Portal** | Customer-facing dispute submission form |
| 8 | **Access Control / Roles** | 4 roles: customer, analyst, manager, admin |

---

## 4. THE 6-FACTOR FRAUD SCORING ALGORITHM

The fraud risk score (0–100) is automatically calculated when a dispute is submitted. Higher scores = more suspicious.

### Factor 1: Dispute Amount (0–35 points)
```
fraud_amount >= $1,000  → +35 points
fraud_amount >= $500    → +25 points
fraud_amount >= $200    → +15 points
fraud_amount >= $50     → +8 points
fraud_amount < $50      → +0 points
```

### Factor 2: Evidence Quality (0–30 points)
```
No evidence submitted                   → +30 points (highest risk)
Screenshot only (image, no PDF)         → +15 points
Receipt PDF uploaded                    → +5 points
Receipt + Bank Statement                → +0 points (best evidence)
```

### Factor 3: Transaction Time (0–12 points)
```
Fraud noticed between 11 PM – 5 AM     → +12 points
Fraud noticed between 5 AM – 8 AM      → +5 points
Normal business hours                  → +0 points
```

### Factor 4: Dispute Volume — Same Card (0–30 points)
```
5+ disputes same card this month       → +30 points (pattern fraud)
3–4 disputes same card this month      → +20 points
2 disputes same card this month        → +10 points
First dispute on this card             → +0 points
```

### Factor 5: Account Age (0–25 points)
```
Account created < 7 days ago           → +25 points
Account created 7–30 days ago          → +15 points
Account created 30–90 days ago         → +5 points
Account older than 90 days             → +0 points
```

### Factor 6: Description Analysis (0–15 points — AI/keyword-based)
```
Description contains: "hacked", "drained", "no proof"  → +10 points
Description is < 20 words (vague)                       → +5 points
Description is detailed and specific                    → +0 points
```

### Risk Level Mapping
```
0  – 39  → LOW      (can auto-approve with good evidence)
40 – 59  → MEDIUM   (analyst review required)
60 – 79  → HIGH     (senior analyst + manager notification)
80 – 100 → CRITICAL (immediate escalation, 24-hour SLA)
```

---

## 5. DATA MODEL (3 Custom Tables)

### Table 1: Gift Card Dispute (`x_xxxx_giftguard_gift_card_dispute`)
The main table. Stores all dispute records.

**Key Fields:**
- `number` — Auto-generated ticket ID (GCD0001234)
- `customer_name`, `customer_email`, `customer_phone`
- `gift_card_number` — Masked to last 4 digits only
- `gift_card_issuer` — Retailer (Target, Amazon, etc.)
- `expected_balance`, `reported_balance`, `fraud_amount`
- `transaction_date` — When fraud was noticed
- `dispute_description` — Customer narrative
- `receipt_attachment`, `evidence_type`
- `risk_score` (0–100), `risk_level` (Low/Medium/High/Critical)
- `status` — New → Under Review → Approved/Rejected → Refund Issued
- `decision`, `decision_reason`, `decision_date`
- `assigned_analyst` — Reference to fraud analyst
- `refund_amount`, `refund_date`
- `sla_target` — Deadline based on risk level

### Table 2: Balance Check History (`x_xxxx_giftguard_balance_check`)
Logs every time a balance check is performed.

**Key Fields:**
- `gift_card_dispute` — Link to parent dispute
- `balance_check_time` — DateTime of check
- `balance_returned` — Balance returned by API
- `api_status` — Success / Failed / Timeout
- `api_response_time`, `api_error_message`

### Table 3: Fraud Scoring Log (`x_xxxx_giftguard_fraud_score_log`)
Audit trail of every scoring calculation.

**Key Fields:**
- `gift_card_dispute` — Link to parent dispute
- `scoring_time` — When scoring ran
- `input_factors` — JSON of all 6 factor values
- `risk_score` — Calculated score
- `ai_service_used` — Which API or "Rule-Based"
- `reasoning` — Text explanation of score

---

## 6. INTEGRATION APPROACH (AI / API)

> ⚠️ **Free Tier Strategy**: Since you are using free ServiceNow PDI instances, the integration approach is designed to work without paid APIs while still demonstrating the Integration Hub capability.

### Primary: Rule-Based Scoring (No API Key Needed)
- All 6 factors calculated entirely in JavaScript (Business Rule + Script Include)
- Works 100% of the time with zero cost
- Demonstrates the scoring algorithm clearly in your demo

### Secondary: AbuseIPDB Free Tier (Optional — Extra Credit)
- Free API: `https://api.abuseipdb.com/api/v2/check`
- Limit: 1,000 checks/day on free tier
- Use: Check if submitter's IP address is flagged for abuse
- How to get key: Sign up at `https://www.abuseipdb.com/register`
- Integration Hub action: HTTP GET with `Key: $apiKey` header
- Adds: +15 to risk score if IP abuse confidence ≥ 25%

### How to Show Integration Hub in Demo (Even Without External API)
You can demonstrate Integration Hub by:
1. Creating a REST Message in ServiceNow pointing to a mock/test endpoint
2. Using `https://jsonplaceholder.typicode.com/posts/1` as a placeholder REST call
3. Showing the executed REST call in the Integration Hub execution logs
4. Explaining: "In production, this would call the AbuseIPDB / payment gateway API"

---

## 7. WHAT EACH TEAM MEMBER BUILDS

### Korblox — Lead, Architecture & Core Logic
**Responsibilities:**
- Set up Scoped Application (`x_xxxx_giftguard`)
- Create the Update Set
- Create all 3 custom tables and their fields
- Write 4 Business Rules (risk scoring, card masking, SLA setting, auto-escalation)
- Write Script Include for the fraud scoring module (reusable)
- Coordinate GitHub repo and PR reviews

**Documents:**
- `GIFTGUARD_ARCHITECTURE.md` (full read)
- `GIFTGUARD_CODE_IMPLEMENTATION.md` (Parts 1 & 2)

---

### Kyle — Client Layer & User Interface
**Responsibilities:**
- Write 2 Client Scripts (form validation + balance checker)
- Build the Service Portal page (dispute intake form)
- Style the portal form for usability
- Test all form interactions

**Documents:**
- `GIFTGUARD_CODE_IMPLEMENTATION.md` (Part 3)
- `GIFTGUARD_QUICK_REFERENCE_TESTING_PLAN.md`

---

### Rudyard — Workflow & Communications
**Responsibilities:**
- Create 4 UI Actions (Approve, Reject, Escalate, Check Balance)
- Build the Flow Designer workflow (6 steps)
- Create 4 email notification templates
- Set up inbound email processing (Dispute via Email)

**Documents:**
- `GIFTGUARD_CODE_IMPLEMENTATION.md` (Parts 4 & 5)
- `GIFTGUARD_FRAUD_API_DECISION_WORKFLOW.md`

---

### Sharaine — Quality & Security
**Responsibilities:**
- Create 4 Access Control Roles
- Write Access Control Rules (ACLs) for each role
- Create test users for each role
- Write all test scenarios (4 cases + edge cases)
- Run end-to-end testing
- Document all bugs found

**Documents:**
- `GIFTGUARD_QUICK_REFERENCE_TESTING_PLAN.md`
- `GIFTGUARD_DAILY_IMPLEMENTATION_CHECKLIST.md`

---

### Lyndon — Documentation & Deployment
**Responsibilities:**
- Maintain GitHub repo structure
- Review and polish all technical documentation
- Set up Integration Hub connection
- Package final Update Set (XML export)
- Lead deployment checklist on final day
- Prepare presentation slides

**Documents:**
- `GIFTGUARD_REPO_STRUCTURE.md`
- All documents for review

---

## 8. TECHNICAL INNOVATION — AI INTEGRATION

### How This Satisfies "AI Integration" (Free Tier)

Since fully hosted AI APIs (OpenAI, Gemini) require payment, GiftGuard solves this with a **hybrid approach**:

**Option A: Keyword-Based NLP in JavaScript (Always Free)**
- Script Include analyzes `dispute_description` field text
- Flags suspicious words: `"hacked"`, `"scam"`, `"drained"`, `"stolen"`, `"fraud"`
- Calculates a description risk score (0–15 pts)
- This is a form of **rule-based text analysis / NLP**

**Option B: AbuseIPDB IP Reputation (Free 1,000/day)**
- When customer submits form, capture IP in a hidden field (via Client Script)
- Integration Hub calls AbuseIPDB with the IP
- Response returns `abuseConfidenceScore` (0–100)
- If score ≥ 25: add +15 to risk score
- **This is a real external API integration demonstrating Integration Hub**

**Option C: Gemini API (Free Tier via Google AI Studio)**
- Google provides Gemini API free with generous limits
- Can send `dispute_description` to Gemini for sentiment/risk analysis
- Prompt: `"Rate the fraud risk of this dispute description 0-10: [description]"`
- Response parsed and added to scoring
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Recommended for extra credit — most impressive for demo**

---

## 9. 6-WEEK IMPLEMENTATION TIMELINE

```
╔══════════════════════════════════════════════════════════════════╗
║  WEEK 1: Foundation & Architecture (Days 1–5)                    ║
╠══════════════════════════════════════════════════════════════════╣
║  Day 1: Korblox creates Scoped App + Update Set                  ║
║  Day 2: Korblox creates 3 custom tables (all fields)             ║
║  Day 3: All team members review architecture                     ║
║  Day 4: Kyle maps out portal form fields                         ║
║  Day 5: GitHub repo setup, first commit                          ║
║  Deliverable: 3 tables created and committed to GitHub           ║
╠══════════════════════════════════════════════════════════════════╣
║  WEEK 2: Business Logic (Days 6–10)                              ║
╠══════════════════════════════════════════════════════════════════╣
║  Day 6:  Korblox creates Business Rule — On Insert (risk score)  ║
║  Day 7:  Korblox creates Business Rule — Before Insert (masking) ║
║  Day 8:  Korblox creates Business Rule — On Update (escalation)  ║
║  Day 9:  Korblox creates Script Include (fraud scorer module)    ║
║  Day 10: Test business rules — insert record, verify risk score  ║
║  Deliverable: All 4 business rules working correctly             ║
╠══════════════════════════════════════════════════════════════════╣
║  WEEK 3: Client Scripts & UI Actions (Days 11–15)                ║
╠══════════════════════════════════════════════════════════════════╣
║  Day 11: Kyle creates Form Validation client script              ║
║  Day 12: Kyle creates Balance Checker client script              ║
║  Day 13: Rudyard creates Approve + Reject UI Actions             ║
║  Day 14: Rudyard creates Escalate + Check Balance UI Actions     ║
║  Day 15: Test all scripts and actions end-to-end                 ║
║  Deliverable: Forms interactive, all 4 UI actions working        ║
╠══════════════════════════════════════════════════════════════════╣
║  WEEK 4: Flow Designer & Notifications (Days 16–20)              ║
╠══════════════════════════════════════════════════════════════════╣
║  Day 16: Rudyard builds Flow Designer workflow (6 steps)         ║
║  Day 17: Rudyard creates Notification 1 (Dispute Received)       ║
║  Day 18: Rudyard creates Notifications 2–4 (Analyst, Status, Mgr)║
║  Day 19: Set up Inbound Email processing                         ║
║  Day 20: Test full flow — submit → route → notify                ║
║  Deliverable: Workflow automated + all 4 emails working          ║
╠══════════════════════════════════════════════════════════════════╣
║  WEEK 5: Service Portal & Access Control (Days 21–25)            ║
╠══════════════════════════════════════════════════════════════════╣
║  Day 21: Kyle creates Service Portal page                        ║
║  Day 22: Kyle configures portal form widget                      ║
║  Day 23: Sharaine creates 4 roles + access control rules         ║
║  Day 24: Sharaine creates test users for each role               ║
║  Day 25: Test portal submission + verify role access             ║
║  Deliverable: Portal working + role-based access enforced        ║
╠══════════════════════════════════════════════════════════════════╣
║  WEEK 6: Testing, Bugs & Deployment (Days 26–30)                 ║
╠══════════════════════════════════════════════════════════════════╣
║  Day 26: Run all 4 test cases (see Testing Plan)                 ║
║  Day 27: Fix all critical bugs                                   ║
║  Day 28: Integration Hub + AI integration                        ║
║  Day 29: Lyndon packages Update Set, exports XML                 ║
║  Day 30: Complete demo rehearsal + final documentation           ║
║  Deliverable: Complete solution + Update Set + 10-min demo ready ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 10. SUCCESS CRITERIA

### Functional Requirements (Must ALL pass)
- [ ] Customer submits dispute via Service Portal
- [ ] Risk score automatically calculated (0–100)
- [ ] Gift card number masked on save
- [ ] SLA date automatically set
- [ ] Dispute routed to correct analyst queue
- [ ] Analyst receives email on assignment
- [ ] Analyst can approve/reject using UI Action buttons
- [ ] Customer receives decision email
- [ ] All 4 roles enforce correct access

### Component Requirements (Must ALL be present)
- [ ] Client Scripts: Form validation + balance checker
- [ ] Business Rules: Risk scoring + masking + escalation
- [ ] UI Actions: Approve + Reject + Escalate + Check Balance
- [ ] Notifications: 4 email templates (inbound + outbound + approval)
- [ ] Integration Hub: At least 1 REST action created
- [ ] Flow Designer: Complete intake workflow activated
- [ ] Service Portal: Dispute intake form accessible
- [ ] Roles: 4 roles created and assigned to test users

### Quality Requirements
- [ ] No syntax errors in any code
- [ ] All 4 test cases pass
- [ ] SLA tracking works correctly
- [ ] Update Set exports without errors
- [ ] GitHub repo has clean commit history

### Demo Requirements
- [ ] 10-minute demo flows start to finish without errors
- [ ] Can show risk scoring live
- [ ] Can show email notifications received
- [ ] Can explain each of the 8 components

---

## 11. EXTRA CREDIT OPPORTUNITIES

### 1. Gemini AI Integration (Highest Impact)
- Free Google AI API key
- Analyze dispute description with Gemini Pro
- Returns structured risk assessment
- Adds 10+ points to final presentation score

### 2. AbuseIPDB Reputation Check
- Free 1,000 checks/day
- Captures IP on form submission
- Integration Hub calls API
- Demonstrates real external integration

### 3. Analytics Dashboard
- ServiceNow built-in reporting
- Charts: disputes by risk level, by issuer, by week
- Analyst performance metrics
- Manager overview dashboard

### 4. Appeal Process Flow
- Customers can appeal rejections
- Secondary review workflow
- Manager final decision
- Demonstrates complex multi-step flow

### 5. Automated Refund Integration
- On approve, call mock payment API
- Status tracking (Pending → Processed)
- Refund confirmation email with reference number

---

## 12. HOW SERVICENOW SCOPED APPS WORK

> This section is for team members who are new to ServiceNow.

### What is a Scoped Application?
A Scoped Application is like a **namespace** for your customizations. Instead of modifying the base ServiceNow platform, you create everything inside your "scope" — a sandbox that:
- Has its own prefix (e.g., `x_12345_giftguard_`)
- Keeps your code separate from other apps
- Can be packaged as an Update Set and moved between instances
- Can be submitted to the ServiceNow Store

### What is an Update Set?
An Update Set is a **package of all your customizations** — like a ZIP file for your ServiceNow work. When you need to move your app from your development instance to a production instance, you export the Update Set as XML and import it on the other instance.

### ServiceNow Developer Instance (PDI)
You are using a **Personal Developer Instance (PDI)** — a free, cloud-hosted ServiceNow environment at `https://developer.servicenow.com`. It resets periodically, so always work within your Update Set.

---

## 13. QUICK GLOSSARY

| Term | Meaning |
|---|---|
| **Business Rule** | Server-side JavaScript that runs when a record is inserted/updated/deleted |
| **Client Script** | Browser-side JavaScript that runs when a form loads or changes |
| **UI Action** | A button that appears on the form, tied to server-side code |
| **Flow Designer** | Visual drag-and-drop workflow builder |
| **Service Portal** | Customer-facing web portal (separate from admin UI) |
| **Integration Hub** | ServiceNow's tool for connecting to external REST APIs |
| **Update Set** | Package of customizations for deployment |
| **Scoped App** | Isolated application namespace with its own prefix |
| **ACL** | Access Control List — rules that define who can read/write records |
| **SLA** | Service Level Agreement — deadline for resolving a record |
| **PDI** | Personal Developer Instance — your free ServiceNow environment |

---

## 14. WHAT TO DO RIGHT NOW

1. **Read this document** (you are here ✓)
2. **Read GIFTGUARD_ARCHITECTURE.md** — deep dive into tables and components
3. **Read GIFTGUARD_CODE_IMPLEMENTATION.md** — copy-paste code for your section
4. **Schedule team kickoff** — assign the 5 roles above
5. **Open your PDI** at `https://developer.servicenow.com`
6. **Create your Scoped App** — Settings > Applications > New Application
7. **Start Day 1** — create the Gift Card Dispute table

---

**Version**: 1.0
**Team**: Korblox (Lead), Kyle, Rudyard, Sharaine, Lyndon
**Project**: CSIT440 Capstone — GiftGuard
**Last Updated**: April 17, 2026
**Status**: ✅ Ready for Implementation

---

> **You have everything you need. The hardest part is starting. Start now.**
