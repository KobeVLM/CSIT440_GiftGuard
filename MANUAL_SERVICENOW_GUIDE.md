# GiftGuard — Manual ServiceNow Setup Guide
## (For the parts that can't be done via npm run deploy)

> **Context**: This repo uses the ServiceNow SDK (`@servicenow/sdk`).
> Running `npm run deploy` auto-deploys the **React UI Page** (the portal frontend).
> The items below CANNOT be deployed via the SDK — they live server-side in ServiceNow and must be created manually.

---

## ⚡ WHAT `npm run deploy` DOES FOR YOU (Automatic)
- ✅ Deploys the GiftGuard Portal as a **UI Page**
- ✅ All React components (Submit form, Status checker, Analyst dashboard)
- ✅ All CSS/JS bundled and hosted by ServiceNow
- ✅ URL: `https://[your-pdi].service-now.com/x_1994889_csit440_incident_manager.do`

## 🖱 WHAT YOU DO MANUALLY (This Guide)
- Tables (3)
- Roles (4)
- Business Rules (4) — copy from `src/BR_*.js`
- Script Include — copy from `src/SI_FraudScorer.js`
- Notifications (4) — copy from `src/NOTIF_Templates.md`
- Flow Designer Workflow (1)
- Integration Hub REST Message (1)
- ACL Rules (5)
- Test Users (4)

**Estimated time: 4–6 hours if followed carefully.**

---

## DEPLOY ORDER (Do this first!)

```
1. npm install          ← Install dependencies
2. npm run deploy       ← Push UI Page to ServiceNow
3. Follow this guide    ← Set up server-side components
```

---

## SECTION 1 — VERIFY YOUR SCOPE & UPDATE SET

### 1.1 Confirm your scope is active

1. In ServiceNow, look at the **top-right application picker** (globe icon or app name)
2. It should show: **CSIT440_GiftGuard** (scope: `x_1994889_csit440`)
3. If not, click the globe → search → select it

### 1.2 Create/activate your Update Set

1. Go to: **System Update Sets > Local Update Sets**
2. Click **New**
3. Fill in: Name = `GiftGuard_Final_Build` | State = `In Progress`
4. Click **Submit**, then open it and click **Make Current**
5. Verify the Update Set picker (top-right) shows your new set

> ✅ Everything you do from here will be captured in the Update Set

---

## SECTION 2 — CREATE THE 3 TABLES

**Navigate to**: `System Definition > Tables > New`

> ⚠️ For each table, make sure you're in scope `x_1994889_csit440` when creating it.

---

### TABLE 1: Gift Card Dispute

**Step 1**: Click New on the Tables list

**Step 2**: Fill in the header:
| Field | Value |
|---|---|
| Label | `Gift Card Dispute` |
| Name | `x_1994889_csit440_gift_card_dispute` |
| Extensible | Unchecked |
| Create access controls | ✓ Checked |
| Add module to menu | ✓ Checked |
| Module name | `Gift Card Disputes` |

**Step 3**: Click **Submit** then open the saved table record.

**Step 4**: Click the **Columns** tab, then add each field by clicking **New**:

| Label | Column name | Type | Notes |
|---|---|---|---|
| Customer Name | `u_customer_name` | String | Max 100, Mandatory ✓ |
| Customer Email | `u_customer_email` | String | Max 100, Mandatory ✓ |
| Customer Phone | `u_customer_phone` | String | Max 30 |
| Gift Card Number | `u_gift_card_number` | String | Max 30, Mandatory ✓ |
| Gift Card Issuer | `u_gift_card_issuer` | String | Max 100, Mandatory ✓ |
| Expected Balance | `u_expected_balance` | Decimal | Mandatory ✓ |
| Reported Balance | `u_reported_balance` | Decimal | Mandatory ✓ |
| Fraud Amount | `u_fraud_amount` | Decimal | Read-only ✓ |
| Transaction Date | `u_transaction_date` | Date | Mandatory ✓ |
| Dispute Description | `u_dispute_description` | String (Full UTF-8) | Max 4000, Mandatory ✓ |
| Evidence Type | `u_evidence_type` | Choice | (choices below) |
| Risk Score | `u_risk_score` | Integer | Read-only ✓ |
| Risk Level | `u_risk_level` | Choice | (choices below) |
| Status | `u_status` | Choice | (choices below) |
| Decision | `u_decision` | Choice | (choices below) |
| Decision Reason | `u_decision_reason` | String (Full UTF-8) | Max 1000 |
| Decision Date | `u_decision_date` | Date/Time | Read-only ✓ |
| Assigned Analyst | `u_assigned_analyst` | Reference | Ref table: sys_user |
| Refund Amount | `u_refund_amount` | Decimal | Read-only ✓ |
| Refund Date | `u_refund_date` | Date | Read-only ✓ |
| SLA Target | `u_sla_target` | Date/Time | Read-only ✓ |

**Step 5 — Add choice values**: For each Choice field, open it from the Columns tab and add these values:

**`u_evidence_type`** choices:
```
Value: none              | Label: No Evidence Available
Value: receipt           | Label: Receipt
Value: bank_statement    | Label: Bank Statement
Value: email_confirmation| Label: Email Confirmation
Value: screenshot        | Label: Screenshot
Value: other             | Label: Other
```

**`u_risk_level`** choices:
```
Value: low      | Label: Low
Value: medium   | Label: Medium
Value: high     | Label: High
Value: critical | Label: Critical
```

**`u_status`** choices (set `new` as Default):
```
Value: new          | Label: New           ← Default
Value: under_review | Label: Under Review
Value: escalated    | Label: Escalated
Value: approved     | Label: Approved
Value: rejected     | Label: Rejected
Value: closed       | Label: Closed
```

**`u_decision`** choices (set `pending` as Default):
```
Value: pending  | Label: Pending   ← Default
Value: approved | Label: Approved
Value: rejected | Label: Rejected
```

**Step 6 — Auto-number**: On the table record → **Auto Number** tab:
- Prefix: `GCD`
- Starting number: `1000`
- Click **Update**

---

### TABLE 2: Balance Check History

1. New Table
2. Label: `Balance Check History` | Name: `x_1994889_csit440_balance_check`
3. Submit, then add columns:

| Label | Column name | Type |
|---|---|---|
| Gift Card Dispute | `u_gift_card_dispute` | Reference → `x_1994889_csit440_gift_card_dispute` |
| Check Time | `u_balance_check_time` | Date/Time |
| Balance Returned | `u_balance_returned` | Decimal |
| API Response Time (ms) | `u_api_response_time` | Integer |
| API Status | `u_api_status` | Choice: `success`, `failed`, `timeout` |
| Error Message | `u_api_error_message` | String (Full UTF-8), Max 500 |

Auto Number: Prefix `BCH`, Start `1000`

---

### TABLE 3: Fraud Scoring Log

1. New Table
2. Label: `Fraud Scoring Log` | Name: `x_1994889_csit440_fraud_score_log`
3. Submit, then add columns:

| Label | Column name | Type |
|---|---|---|
| Gift Card Dispute | `u_gift_card_dispute` | Reference → `x_1994889_csit440_gift_card_dispute` |
| Scoring Time | `u_scoring_time` | Date/Time |
| Risk Score | `u_risk_score` | Integer |
| AI Service Used | `u_ai_service_used` | String, Max 100 |
| Input Factors | `u_input_factors` | String (Full UTF-8), Max 4000 |
| Reasoning | `u_reasoning` | String (Full UTF-8), Max 2000 |

Auto Number: Prefix `FSL`, Start `1000`

---

## SECTION 3 — CREATE 4 ROLES

**Navigate to**: `System Security > Roles > New`

Create each one:
| Name | Description |
|---|---|
| `giftguard_customer` | Can submit disputes and check own status |
| `giftguard_analyst` | Can review, approve, reject disputes |
| `giftguard_manager` | High-risk escalation decisions, full team oversight |
| `giftguard_admin` | Full system access, configuration |

For each:
1. Click **New**
2. Enter the **Name** (exactly as shown)
3. Enter the Description
4. Click **Submit**

---

## SECTION 4 — CREATE BUSINESS RULES

**Navigate to**: `System Definition > Business Rules > New`

For each Business Rule:
1. Click **New**
2. Fill in settings from the table below
3. Paste the code from the listed file (everything after the header comment block)
4. Click **Submit**
5. Test immediately using a test dispute record

---

### BR 1 — Mask Card Number

| Setting | Value |
|---|---|
| Name | `GiftGuard - Before Insert - Mask Card Number` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| When | `before` |
| Insert | ✓ |
| Update | ✗ |
| Order | `100` |
| Active | ✓ |

Script → **Copy from**: `src/BR_01_MaskCard.js` (the code inside the `(function executeRule...)`)

**Quick test**: Create a new dispute manually → enter card `4111111111111111` → save → the field should now show `****-****-****-1111`

---

### BR 2 — Calculate Risk Score

| Setting | Value |
|---|---|
| Name | `GiftGuard - Before Insert - Calculate Risk Score` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| When | `before` |
| Insert | ✓ |
| Update | ✗ |
| Order | `200` ← Must be higher than BR1 |
| Active | ✓ |

Script → **Copy from**: `src/BR_02_CalculateRisk.js`

**Quick test**: Create dispute with expectedBalance=500, reportedBalance=0, evidenceType=none → risk_score should be 70+

---

### BR 3 — Set SLA and Log Score

| Setting | Value |
|---|---|
| Name | `GiftGuard - After Insert - Set SLA and Log` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| When | `after` ← Different! |
| Insert | ✓ |
| Update | ✗ |
| Order | `300` |
| Active | ✓ |

Script → **Copy from**: `src/BR_03_SetSLA.js`

**Quick test**: After creating a dispute → open it → the **SLA Target** field should have a date value

---

### BR 4 — Auto Escalate Critical Risk

| Setting | Value |
|---|---|
| Name | `GiftGuard - After Update - Auto Escalate Critical` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| When | `after` |
| Insert | ✗ |
| Update | ✓ |
| Order | `100` |
| Active | ✓ |
| Condition | `current.u_risk_level.changesTo('critical')` |

Script → **Copy from**: `src/BR_04_AutoEscalate.js`

---

## SECTION 4B — SCRIPT INCLUDE

**Navigate to**: `System Definition > Script Includes > New`

| Setting | Value |
|---|---|
| Name | `GiftGuardFraudScorer` |
| API Name | `x_1994889_csit440.GiftGuardFraudScorer` |
| Accessible From | All application scopes |
| Client Callable | ✗ Unchecked |
| Active | ✓ |

Script → **Copy entire contents** of `src/SI_FraudScorer.js`

---

## SECTION 5 — NOTIFICATIONS

**Navigate to**: `System Notification > Email > Notifications`

> First check: **System Properties > Email Properties** → confirm **glide.email.smtp.active** = `true`
> If not, your PDI needs email configured. For demo days, just show the notification configuration screen.

Create all 4 notifications. Full templates are in `src/NOTIF_Templates.md`. Summary:

---

### NOTIF 1 — Dispute Received (to Customer)

| Setting | Value |
|---|---|
| Name | `GiftGuard - Dispute Received` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| When to send | Record inserted |
| Who receives | Specific email → `${u_customer_email}` |
| Active | ✓ |

→ Open `src/NOTIF_Templates.md` → copy Subject & Body from **NOTIFICATION 1**

---

### NOTIF 2 — Analyst Assignment Alert

| Setting | Value |
|---|---|
| Name | `GiftGuard - Analyst Assignment` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| When to send | Field changes |
| Field changed | Assigned Analyst |
| Who receives | Field value → Assigned Analyst → Email |
| Active | ✓ |

→ Copy from **NOTIFICATION 2** in `src/NOTIF_Templates.md`

---

### NOTIF 3 — Customer Decision Notice

| Setting | Value |
|---|---|
| Name | `GiftGuard - Customer Decision` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| When to send | Field changes |
| Field changed | Status |
| Condition | `current.u_status == 'approved' \|\| current.u_status == 'rejected'` |
| Who receives | Specific email → `${u_customer_email}` |
| Active | ✓ |

→ Copy from **NOTIFICATION 3** in `src/NOTIF_Templates.md`

---

### NOTIF 4 — Manager Escalation Alert

| Setting | Value |
|---|---|
| Name | `GiftGuard - Manager Escalation Alert` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| When to send | Field changes |
| Field changed | Risk Level |
| Condition | `current.u_risk_level == 'critical'` |
| Who receives | Users with role → `giftguard_manager` |
| Active | ✓ |

→ Copy from **NOTIFICATION 4** in `src/NOTIF_Templates.md`

---

### NOTIF 5 — Inbound Email Action

**Navigate to**: `System Notification > Email > Inbound Actions > New`

| Setting | Value |
|---|---|
| Name | `GiftGuard - Create Dispute from Email` |
| Table | `x_1994889_csit440_gift_card_dispute` |
| Active | ✓ |
| Stop Processing | ✓ |
| Type | Create record |

**Field mappings** (in Variables section):
| Source | Target field |
|---|---|
| `${mail.from.email}` | `u_customer_email` |
| `${mail.from.name}` | `u_customer_name` |
| `${mail.body_text}` | `u_dispute_description` |
| (fixed value) `email_confirmation` | `u_evidence_type` |

> **Demo Tip**: Even if the inbound email doesn't connect in PDI, show the configuration screen and explain the concept.

---

## SECTION 6 — FLOW DESIGNER

**Navigate to**: `Process Automation > Flow Designer > New > Flow`

| Setting | Value |
|---|---|
| Name | `GiftGuard - Dispute Intake Workflow` |
| Description | `Automated dispute routing and notification` |
| Run As | System User |

### TRIGGER
- Type: **Record → Created**
- Table: `x_1994889_csit440_gift_card_dispute`

### STEP 1 — Get Record
- Type: **ServiceNow Core > Look Up Record**
- Table: Gift Card Dispute
- Filter: `Sys ID = Trigger record Sys ID`

### STEP 2 — Evaluate Risk Level
- Type: **Flow Logic > If**
- Condition: `Trigger.u_risk_score >= 80`

**TRUE branch (Critical)**:
- Action: **ServiceNow Core > Update Record**
- Record: Trigger record
- Set `u_status` = `escalated`

**FALSE branch (Normal)**:
- Action: **ServiceNow Core > Update Record**
- Set `u_status` = `under_review`

### STEP 3 — Send Customer Confirmation
- Type: **ServiceNow Core > Send Email**
- To: `Trigger.u_customer_email`
- Subject: `GiftGuard: Dispute ${trigger.number} Received`
- Body: `Dear ${trigger.u_customer_name}, your dispute ${trigger.number} has been received and is now under review. Risk level: ${trigger.u_risk_level}. SLA: 5 business days.`

### STEP 4 — Activate
- Click **Save**
- Click **Activate**

---

## SECTION 7 — INTEGRATION HUB (REST Message)

**Navigate to**: `System Web Services > Outbound > REST Messages > New`

| Setting | Value |
|---|---|
| Name | `GiftGuard - Fraud API Check` |
| Endpoint | `https://api.abuseipdb.com/api/v2/check` |
| Authentication type | No Authentication |

1. Click **Submit**
2. In HTTP Methods (related list) → click **New**:
   - Name: `checkIP`
   - HTTP Method: `GET`
   - Endpoint: `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip_address}&maxAgeInDays=90`
3. HTTP Request tab → add header: `Key` = `[YOUR_ABUSEIPDB_KEY_OR_DEMO]`
4. Click **Test** (show connection attempt in demo even if API key is demo)

> **For Demo**: Show the REST Message config screen. Explain: "This Integration Hub connection calls the AbuseIPDB fraud detection API. The UI Action `Check Balance` (which is auto-deployed via npm run deploy) calls this endpoint to enrich our fraud scoring."

---

## SECTION 8 — ACL RULES

**Navigate to**: `System Security > Access Control (ACL) > New`

Create these 5 rules:

### ACL 1 — Customer reads own disputes
| Setting | Value |
|---|---|
| Type | Record |
| Operation | Read |
| Name | `x_1994889_csit440_gift_card_dispute` |
| Role | `giftguard_customer` |
| Script | `answer = current.u_customer_email == gs.getUser().getEmail();` |

### ACL 2 — Analyst reads disputes
| Setting | Value |
|---|---|
| Type | Record |
| Operation | Read |
| Name | `x_1994889_csit440_gift_card_dispute` |
| Role | `giftguard_analyst` |
| Script | `answer = true;` |

### ACL 3 — Analyst writes disputes
- Same as ACL 2 but Operation = **Write**

### ACL 4 — Manager reads all
| Setting | Value |
|---|---|
| Type | Record |
| Operation | Read |
| Name | `x_1994889_csit440_gift_card_dispute` |
| Role | `giftguard_manager` |
| Script | `answer = true;` |

### ACL 5 — Admin full access
| Setting | Value |
|---|---|
| Type | Record |
| Operation | Read/Write (create two ACLs) |
| Name | `x_1994889_csit440_gift_card_dispute` |
| Role | `giftguard_admin` |
| Script | `answer = true;` |

---

## SECTION 9 — TEST USERS

**Navigate to**: `User Administration > Users > New`

| Field | User 1 | User 2 | User 3 | User 4 |
|---|---|---|---|---|
| First Name | Test | Test | Test | Test |
| Last Name | Customer | Analyst | Manager | Admin |
| User ID | `t_customer1` | `t_analyst1` | `t_manager1` | `t_admin1` |
| Email | Use your own email (so you receive notifications) | colleague's email or yours | yours | yours |
| Password | `GiftGuard123!` | `GiftGuard123!` | `GiftGuard123!` | `GiftGuard123!` |

After saving each user → **Roles tab** → Add role:
- Customer → `giftguard_customer`
- Analyst → `giftguard_analyst`
- Manager → `giftguard_manager`
- Admin → `giftguard_admin`

---

## SECTION 10 — RUN TEST CASES

### Test Case 1 — Low Risk (should auto-route to analyst, low SLA)
Open portal → Submit Dispute:
- Name: Alice Johnson | Email: yours | Phone: 0917-111-2222
- Card: `4111111111111111` | Issuer: Target
- Expected: `100` | Current: `75`
- Date: today | Description: `My Target gift card shows $75 instead of $100. I haven't used it.`
- Evidence: Receipt

✅ Expected outcome: `risk_score` ≤ 30, `risk_level` = low, SLA = 5 days, status = under_review

---

### Test Case 2 — Critical Risk (should auto-escalate)
Submit:
- Card: `5555555555554444` | Issuer: Amazon
- Expected: `1000` | Current: `0`
- Description: `My Amazon gift card was hacked and drained completely. Someone unauthorized used it.`
- Evidence: Screenshot only

✅ Expected outcome: `risk_score` ≥ 75, `risk_level` = critical, status = escalated, manager email sent

---

### Test Case 3 — Approve a dispute
1. Open any dispute in ServiceNow native view (not portal)
2. Click the **Approve Dispute** UI Action button
3. Check: status = approved, email sent to customer, refund date set

---

### Test Case 4 — Check status via portal
1. Go to portal URL
2. Click "Check Status"
3. Enter the dispute number from Test Case 1 (e.g. `GCD1000`)
4. ✅ Should show the status card, risk bar, and timeline

---

## SECTION 11 — EXPORT UPDATE SET

1. Go to **System Update Sets > Local Update Sets**
2. Open `GiftGuard_Final_Build`
3. Click **Preview Update Set** → resolve any conflicts shown
4. Click **Export to XML**
5. Save as `GiftGuard_Final_Build.xml` → commit to your repo under `/delivery/`

---

## QUICK DEMO SCRIPT (5 minutes)

| Minute | Action |
|---|---|
| 0:00 | Open portal URL. Show home page. Explain GiftGuard purpose. |
| 0:45 | Click "Submit Dispute" → walk through 3-step form with Test Case 2 data |
| 2:00 | Show the submission success screen with dispute number |
| 2:30 | Switch to ServiceNow native → show dispute record created with risk_score/level |
| 3:00 | Click "Escalate" UI Action → show manager email fired |
| 3:30 | Open Notifications → show notification config → "Inbound/Outbound email both configured" |
| 4:00 | Open Flow Designer → show active workflow → "This is our Flow Designer component" |
| 4:30 | Open REST Messages → show Integration Hub config for fraud API |
| 5:00 | Back to portal → Check Status tab → enter dispute number → show live status result |

---

## 8 REQUIRED COMPONENTS — WHERE TO SHOW THEM

| Component | Location |
|---|---|
| ✅ Client Scripts | Portal itself (React app) — the form validation and balance checker |
| ✅ Business Rules | System Definition > Business Rules → show 4 rules |
| ✅ UI Actions | Open a dispute record → show Approve/Reject/Escalate buttons |
| ✅ Notifications | System Notification > Notifications → show all 4 + inbound action |
| ✅ Integration Hub | System Web Services > REST Messages → show GiftGuard fraud API |
| ✅ Flow Designer | Process Automation > Flow Designer → show active workflow |
| ✅ Service Portal | The React UI Page at your portal URL (this IS the service portal) |
| ✅ User Criteria & Roles | System Security > Roles → show 4 roles + ACL rules |
| ✅ AI Integration | Point to `src/BR_02_CalculateRisk.js` — rule-based NLP scoring algorithm |
