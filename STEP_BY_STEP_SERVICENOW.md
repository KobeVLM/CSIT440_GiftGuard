# GiftGuard — Step-by-Step ServiceNow Manual Guide
## Every click, every field, every setting. 2-Day Build.

> **How to use**: Follow sections 1–11 in order.
> Each step tells you exactly where to click in ServiceNow.
> When you see a code block → open the matching file in the `src/` folder and copy-paste it.

---

## ⚠️ BEFORE YOU START — READ THIS

1. **Log into your PDI**: Go to `https://developer.servicenow.com` → My Instance → Start Building
2. **Your instance URL** will be something like: `https://dev12345.service-now.com`
3. **Stay in this scope** throughout: `GiftGuard (x_[prefix]_giftguard)`
4. **Never close the Update Set** — it must stay active the whole time
5. **After every component**: Go to **System Log > All** and check for red errors

---

## SECTION 1: CREATE SCOPED APP & UPDATE SET

### Step 1.1 — Create the Scoped Application

1. In the top navigation (application picker), click the **globe icon** or type in the scope bar
2. Go to: `System Applications > Studio`
3. Click **Create Application**
4. Fill in:
   - **Name**: `GiftGuard`
   - **Scope**: Leave default (auto-generates like `x_12345_giftguard`)
   - **Version**: `1.0.0`
   - **Short Description**: `Gift Card Fraud Dispute Intake System`
5. Click **Create**
6. Studio opens — **write down your scope prefix** (shown in the bottom left, e.g., `x_12345_giftguard`)

> 📝 **Your scope prefix**: `x_________` ← fill in yours here

### Step 1.2 — Create the Update Set

1. Navigate to: `System Update Sets > Local Update Sets`
2. Click **New**
3. Fill in:
   - **Name**: `GiftGuard_v1.0_CSIT440`
   - **Description**: `CSIT440 Capstone - GiftGuard complete implementation`
   - **State**: `In Progress`
4. Click **Submit**
5. Open the Update Set you just created
6. Click **Make Current** at the top
7. Confirm: You should see `GiftGuard_v1.0_CSIT440` in the Update Set picker (top right)

---

## SECTION 2: CREATE THE 3 TABLES

> **Navigation**: `System Definition > Tables > New`

### Table 1: Gift Card Dispute

1. Go to `System Definition > Tables > New`
2. Fill in:
   - **Label**: `Gift Card Dispute`
   - **Name**: `x_[PREFIX]_giftguard_gift_card_dispute` ← replace [PREFIX]
   - **Extensible**: Unchecked
   - **Create access controls**: Checked ✓
   - **Add module to menu**: Checked ✓
   - **Module name**: `Gift Card Disputes`

3. Click **Submit**

4. Now **add all fields** by going to the **Columns** tab on the table record:

| Label | Column Name | Type | Max Length / Options |
|---|---|---|---|
| Customer Name | `u_customer_name` | String | 100, Mandatory ✓ |
| Customer Email | `u_customer_email` | String | 100, Mandatory ✓ |
| Customer Phone | `u_customer_phone` | String | 30 |
| Gift Card Number | `u_gift_card_number` | String | 30, Mandatory ✓ |
| Gift Card Issuer | `u_gift_card_issuer` | String | 100, Mandatory ✓ |
| Expected Balance | `u_expected_balance` | Decimal | Mandatory ✓ |
| Reported Balance | `u_reported_balance` | Decimal | Mandatory ✓ |
| Fraud Amount | `u_fraud_amount` | Decimal | Read Only ✓ |
| Transaction Date | `u_transaction_date` | Date | Mandatory ✓ |
| Dispute Description | `u_dispute_description` | String (Full UTF-8) | 4000, Mandatory ✓ |
| Evidence Type | `u_evidence_type` | Choice | (add choices below) |
| Risk Score | `u_risk_score` | Integer | Read Only ✓ |
| Risk Level | `u_risk_level` | Choice | (add choices below) |
| Status | `u_status` | Choice | (add choices below) |
| Decision | `u_decision` | Choice | (add choices below) |
| Decision Reason | `u_decision_reason` | String (Full UTF-8) | 1000 |
| Decision Date | `u_decision_date` | Date/Time | Read Only ✓ |
| Assigned Analyst | `u_assigned_analyst` | Reference | Table: sys_user |
| Refund Amount | `u_refund_amount` | Decimal | Read Only ✓ |
| Refund Date | `u_refund_date` | Date | Read Only ✓ |
| SLA Target | `u_sla_target` | Date/Time | Read Only ✓ |

**Choice values for `u_evidence_type`:**
- `receipt` → Receipt
- `bank_statement` → Bank Statement
- `email_confirmation` → Email Confirmation
- `screenshot` → Screenshot
- `other` → Other
- `none` → No Evidence

**Choice values for `u_risk_level`:**
- `low` → Low
- `medium` → Medium
- `high` → High
- `critical` → Critical

**Choice values for `u_status`:**
- `new` → New ← Set as **Default**
- `under_review` → Under Review
- `approved` → Approved
- `rejected` → Rejected
- `escalated` → Escalated
- `closed` → Closed

**Choice values for `u_decision`:**
- `pending` → Pending ← Set as **Default**
- `approved` → Approved
- `rejected` → Rejected

5. Enable Auto Numbering:
   - On the table record → click the **Auto Number** tab
   - Prefix: `GCD`
   - Starting number: `1000`
   - Click Update

---

### Table 2: Balance Check History

1. Go to `System Definition > Tables > New`
2. Fill in:
   - **Label**: `Balance Check History`
   - **Name**: `x_[PREFIX]_giftguard_balance_check`
   - **Create access controls**: Checked ✓

3. Add fields:

| Label | Column Name | Type | Notes |
|---|---|---|---|
| Gift Card Dispute | `u_gift_card_dispute` | Reference | Table: x_[PREFIX]_giftguard_gift_card_dispute |
| Check Time | `u_balance_check_time` | Date/Time | |
| Balance Returned | `u_balance_returned` | Decimal | |
| API Response Time (ms) | `u_api_response_time` | Integer | |
| API Status | `u_api_status` | Choice | success / failed / timeout |
| Error Message | `u_api_error_message` | String (Full UTF-8) | 500 |

4. Auto Number: Prefix `BCH`, Start `1000`

---

### Table 3: Fraud Scoring Log

1. Go to `System Definition > Tables > New`
2. Fill in:
   - **Label**: `Fraud Scoring Log`
   - **Name**: `x_[PREFIX]_giftguard_fraud_score_log`
   - **Create access controls**: Checked ✓

3. Add fields:

| Label | Column Name | Type | Notes |
|---|---|---|---|
| Gift Card Dispute | `u_gift_card_dispute` | Reference | Table: x_[PREFIX]_giftguard_gift_card_dispute |
| Scoring Time | `u_scoring_time` | Date/Time | |
| Risk Score | `u_risk_score` | Integer | |
| AI Service Used | `u_ai_service_used` | String | 100 |
| Input Factors | `u_input_factors` | String (Full UTF-8) | 4000 |
| Reasoning | `u_reasoning` | String (Full UTF-8) | 2000 |

4. Auto Number: Prefix `FSL`, Start `1000`

---

## SECTION 3: CREATE THE 4 ROLES

**Navigation**: `System Security > Roles > New`

Create each role below (just 3 fields needed):

### Role 1: giftguard_customer
- **Name**: `giftguard_customer`
- **Description**: `GiftGuard - Can submit disputes and view own dispute status`
- **Elevated privilege**: Unchecked
- Click **Submit**

### Role 2: giftguard_analyst
- **Name**: `giftguard_analyst`
- **Description**: `GiftGuard - Can review, approve, and reject disputes`
- Click **Submit**

### Role 3: giftguard_manager
- **Name**: `giftguard_manager`
- **Description**: `GiftGuard - Can escalate disputes, override decisions, approve high-risk`
- Click **Submit**

### Role 4: giftguard_admin
- **Name**: `giftguard_admin`
- **Description**: `GiftGuard - Full access, configure the application`
- Click **Submit**

---

## SECTION 4: CREATE BUSINESS RULES

**Navigation**: `System Definition > Business Rules > New`

For EACH business rule below:
1. Click New
2. Fill in the settings from the file header comment
3. Paste the code from the `src/` file into the **Script** field
4. Click **Submit**
5. Test immediately

### BR 1: Mask Card Number
- Open file: `src/BR_01_MaskCard.js`
- Read the header comment for settings
- Paste the script
- **Test**: Create a manual dispute record → fill in card number `4111111111111111` → save → field should show `****-****-****-1111`

### BR 2: Calculate Risk Score
- Open file: `src/BR_02_CalculateRisk.js`
- Important: Change `order` to **200** so it runs after BR1
- Paste the script
- **Test**: Create dispute with fraud_amount=$600, no evidence → risk_score should be 50+

### BR 3: Set SLA and Log Score
- Open file: `src/BR_03_SetSLA.js`
- This is `When: after` — different from BR1 and BR2!
- **Test**: After saving a dispute → check `u_sla_target` field is populated

### BR 4: Auto-Escalate
- Open file: `src/BR_04_AutoEscalate.js`
- Only runs on **Update** when risk_level changes to critical
- **Test**: Manually set a dispute's risk_score to 90 → save → status should change to Escalated

---

## SECTION 4B: CREATE SCRIPT INCLUDE (Fraud Scorer Module)

**Navigation**: `System Definition > Script Includes > New`

1. Click New
2. Fill in:
   - **Name**: `GiftGuardFraudScorer`
   - **API Name**: `x_[PREFIX]_giftguard.GiftGuardFraudScorer`
   - **Accessible From**: All application scopes
   - **Active**: Checked ✓
   - **Client Callable**: UNCHECKED
3. Paste the entire contents of `src/SI_FraudScorer.js`
4. Click **Submit**

---

## SECTION 5: CREATE CLIENT SCRIPTS

**Navigation**: `System Definition > Client Scripts > New`

### CS 1: Form Validation (onSubmit)

1. Click New
2. Fill in:
   - **Name**: `GiftGuard - Form Validation`
   - **Table**: `x_[PREFIX]_giftguard_gift_card_dispute`
   - **UI Type**: Desktop
   - **Type**: `onSubmit`
   - **Active**: Checked ✓
3. Paste contents of `src/CS_01_FormValidation.js`
4. Click **Submit**

### CS 2: Balance Checker Button (onLoad)

1. Click New
2. Fill in:
   - **Name**: `GiftGuard - Balance Checker Button`
   - **Table**: `x_[PREFIX]_giftguard_gift_card_dispute`
   - **UI Type**: Desktop
   - **Type**: `onLoad`
   - **Active**: Checked ✓
3. Paste contents of `src/CS_02_BalanceChecker.js`

> ⚠️ Note: The `onChange` function is also in `src/CS_01_FormValidation.js`.
> You need to create a **separate** Client Script with Type: `onChange` and paste the onChange function.

### CS 3: Field Change Handler (onChange)
1. New Client Script
2. Name: `GiftGuard - Field Change Handler`
3. Type: `onChange`
4. Table: same as above
5. Paste only the `onChange` function from CS_01_FormValidation.js

---

## SECTION 6: CREATE UI ACTIONS

**Navigation**: `System UI > UI Actions > New`

For each UI Action:
1. Click New
2. Fill in the settings from the file header comment
3. Paste the code into the **Script** field
4. Click **Submit**
5. Go back to the dispute form and verify the button appears

### UIA 1: Approve Dispute
- File: `src/UIA_01_Approve.js`
- Check the header for the Condition field value

### UIA 2: Reject Dispute
- File: `src/UIA_02_Reject.js`
- **Extra step**: In the **Onclick** tab, paste the JavaScript prompt code from the file header

### UIA 3: Escalate to Manager
- File: `src/UIA_03_Escalate.js`

### UIA 4: Check Card Balance
- File: `src/UIA_04_CheckBalance.js`
- This simulates the Integration Hub call

---

## SECTION 7: CREATE NOTIFICATIONS

**Navigation**: `System Notification > Email > Notifications`

Open `src/NOTIF_Templates.md` and follow each notification exactly.

### Quick steps for each notification:
1. Click **New**
2. Name, Table, When to Send → from the template
3. Recipients → follow the template  
4. **Message** tab → paste Subject and Body from template
5. Click **Submit**
6. Test: click **Send test notification**

**Create all 4**:
- GiftGuard - Dispute Received Confirmation
- GiftGuard - Analyst Assignment Alert
- GiftGuard - Customer Decision Notice
- GiftGuard - Manager Escalation Alert

### Inbound Email Action
- **Navigation**: `System Notification > Email > Inbound Actions > New`
- Follow the config table in `src/NOTIF_Templates.md` at the bottom

---

## SECTION 8: FLOW DESIGNER WORKFLOW

**Navigation**: `Process Automation > Flow Designer`

### Create the Flow

1. Click **New > Flow**
2. Fill in:
   - **Name**: `GiftGuard - Dispute Intake Workflow`
   - **Description**: `Automated intake, risk routing, and notification flow`
   - **Run As**: System User
3. Click **Create**

### Add the TRIGGER

1. Click **Add a trigger**
2. Select: **Record > Created**
3. Table: `x_[PREFIX]_giftguard_gift_card_dispute`
4. Condition: `u_status is New`

### Add STEPS in order

**Step 1: Get Record**
- Type: `ServiceNow Core > Look Up Record`
- Table: Gift Card Dispute
- Condition: `Sys ID == Trigger.Dispute Record.Sys ID`

**Step 2: Call Script Include (Fraud Scoring)**
- Type: `ServiceNow Core > Run Script`
- Script:
```javascript
(function() {
    var disputeId = fd_data.trigger__record.sys_id;
    var scorer = new GiftGuardFraudScorer();
    var gr = new GlideRecord('x_[PREFIX]_giftguard_gift_card_dispute');
    gr.get(disputeId);
    var result = scorer.score(gr);
    scorer.logScore(disputeId, result);
    outputs.risk_score  = result.risk_score;
    outputs.risk_level  = result.risk_level;
})();
```

**Step 3: Update Dispute Record**
- Type: `ServiceNow Core > Update Record`
- Record: Trigger Dispute
- Set fields:
  - `u_risk_score` = Step 2 Output `risk_score`
  - `u_risk_level` = Step 2 Output `risk_level`
  - `u_status` = `under_review`

**Step 4: Flow Logic — IF Risk is Critical**
- Type: `Flow Logic > If`
- Condition: `Step 2.risk_score >= 80`

  **TRUE branch → Action: Send Email to Manager**
  - Type: `ServiceNow Core > Send Email`
  - To: (manager email — hard code your test manager email for demo)
  - Subject: `URGENT: Critical Dispute ${trigger.number}`
  - Body: `Dispute requires immediate review. Risk: ${Step2.risk_score}/100`

  **FALSE branch → Action: Look Up Analyst**
  - Find a user with role `giftguard_analyst`

**Step 5: Send Confirmation to Customer**
- Type: `ServiceNow Core > Send Email`
- To: `Trigger.u_customer_email`
- Subject: `GiftGuard: Dispute ${trigger.number} Received`
- Body: `We received your dispute. Risk: ${Step2.risk_level}. SLA: 5 business days.`

**Step 6: Activate the Flow**
- Click **Save**
- Click **Activate**
- Confirm: Flow status shows **Active**

---

## SECTION 9: INTEGRATION HUB (REST Message)

**Navigation**: `System Web Services > Outbound > REST Messages > New`

### Create the REST Message

1. Click **New**
2. Fill in:
   - **Name**: `GiftGuard - Fraud Check API`
   - **Endpoint**: `https://api.abuseipdb.com/api/v2/check`
   - **Authentication type**: No Authentication (for now)
3. Click **Submit**
4. In the HTTP Methods related list → click **New**
5. Fill in:
   - **Name**: `checkIP`
   - **HTTP Method**: GET
   - **Endpoint**: `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip_address}&maxAgeInDays=90`
6. Go to **HTTP Request** tab → add header:
   - **Name**: `Key`
   - **Value**: `YOUR_ABUSEIPDB_API_KEY` (or `demo_key` for now)
7. Click **Test** → shows the REST call was attempted (even if it returns error, the connection exists)

> **For Demo**: Show the REST Message configuration screen and the Test button. Explain:
> "This Integration Hub action connects to AbuseIPDB's fraud detection API. In production with a live API key, it checks the customer's IP reputation and adds up to +25 to the risk score."

---

## SECTION 10: SERVICE PORTAL (Record Producer)

### Option A: Record Producer (Easier — Recommended for 2-day sprint)

**Navigation**: `Service Catalog > Catalog Definitions > Record Producers > New`

1. Click **New**
2. Fill in:
   - **Name**: `Submit a Gift Card Fraud Dispute`
   - **Table name**: `x_[PREFIX]_giftguard_gift_card_dispute`
   - **Short description**: `Report a gift card balance discrepancy or suspected fraud`
   - **Description**: `Use this form to report if your gift card balance has been unexpectedly drained or if you suspect fraud.`
   - **Active**: Checked ✓
3. Click **Submit**
4. Add variables (click **New** in the Variables related list for each):

| Question | Name | Type | Mandatory |
|---|---|---|---|
| Your Full Name | `u_customer_name` | Single Line Text | ✓ |
| Your Email Address | `u_customer_email` | Single Line Text | ✓ |
| Your Phone Number | `u_customer_phone` | Single Line Text | |
| Gift Card Number | `u_gift_card_number` | Single Line Text | ✓ |
| Card Issuer / Brand | `u_gift_card_issuer` | Single Line Text | ✓ |
| Original/Expected Balance ($) | `u_expected_balance` | Single Line Text | ✓ |
| Current Balance You See ($) | `u_reported_balance` | Single Line Text | ✓ |
| Date You Noticed Fraud | `u_transaction_date` | Date | ✓ |
| Describe What Happened | `u_dispute_description` | Multi-Line Text | ✓ |
| Type of Evidence | `u_evidence_type` | Select Box | |

For `u_evidence_type` choices: `none`, `receipt`, `bank_statement`, `email_confirmation`, `screenshot`, `other`

5. Add Record Producer to Service Portal:
   - Navigate to: `Service Portal > Portals`
   - Open your portal (or create one: Name=GiftGuard Portal, URL=giftguard)
   - The Record Producer will appear in the default catalog

6. Test by visiting: `https://[your-instance].service-now.com/sp?id=sc_cat_item&sys_id=[sys_id_of_record_producer]`

---

## SECTION 11: ACCESS CONTROL (ACL Rules)

**Navigation**: `System Security > Access Control (ACL) > New`

Create 5 ACL rules:

### ACL 1: Customer reads own records
| Field | Value |
|---|---|
| Type | Record |
| Operation | Read |
| Name | `x_[PREFIX]_giftguard_gift_card_dispute` |
| Role | giftguard_customer |
| Condition | `current.u_customer_email == gs.getUser().getEmail()` |
| Script (Advanced) | `answer = current.u_customer_email == gs.getUser().getEmail();` |

### ACL 2: Analyst reads assigned records
| Field | Value |
|---|---|
| Type | Record |
| Operation | Read |
| Name | `x_[PREFIX]_giftguard_gift_card_dispute` |
| Role | giftguard_analyst |
| Script | `answer = current.u_assigned_analyst == gs.getUserID() || gs.hasRole('giftguard_manager');` |

### ACL 3: Analyst writes assigned records
- Same as ACL 2 but Operation = **Write**

### ACL 4: Manager reads all high/critical
| Field | Value |
|---|---|
| Type | Record |
| Operation | Read |
| Name | `x_[PREFIX]_giftguard_gift_card_dispute` |
| Role | giftguard_manager |
| Condition | `current.u_risk_level == 'critical' || current.u_risk_level == 'high'` |

### ACL 5: Admin — full access
| Field | Value |
|---|---|
| Type | Record |
| Operation | Read |
| Name | `x_[PREFIX]_giftguard_gift_card_dispute` |
| Role | giftguard_admin |
| Script | `answer = true;` |

---

## SECTION 12: CREATE TEST USERS

**Navigation**: `User Administration > Users > New`

### Test User 1: Customer
- **First Name**: Test, **Last Name**: Customer
- **User ID**: `testcustomer1`
- **Email**: `testcustomer1@giftguard.demo`
- **Password**: Set Password → `GiftGuard123!`
- After saving: Roles tab → Add `giftguard_customer`

### Test User 2: Analyst
- **User ID**: `testanalyst1`
- **Email**: `testanalyst1@giftguard.demo`
- Roles: `giftguard_analyst`

### Test User 3: Manager
- **User ID**: `testmanager1`
- **Email**: `testmanager1@giftguard.demo`
- Roles: `giftguard_manager`

### Test User 4: Admin
- **User ID**: `testadmin1`
- **Email**: `testadmin1@giftguard.demo`
- Roles: `giftguard_admin`

---

## SECTION 13: RUN THE 4 TEST CASES

### Test Case 1: Low Risk (Expected: Auto-approves or routes to regular analyst)
Submit via portal with:
- Name: Alice Johnson | Email: alice@test.com
- Card: `4111111111111111` | Issuer: Target
- Expected Balance: `100` | Current Balance: `75`
- Date: Today | Description: `I noticed I had $75 left when I checked. I expected $100.`
- Evidence: `receipt`

Expected: risk_score ~13, risk_level = Low, SLA = 5 days

### Test Case 2: High Risk (Expected: Escalated to manager)
- Name: Bob Smith | Email: bob@test.com
- Card: `5555555555554444` | Issuer: Amazon
- Expected: `1000` | Current: `50`
- Description: `Someone hacked my account and drained my card. I have no proof.`
- Evidence: `none`

Expected: risk_score ~75+, risk_level = Critical, auto-escalated

### Test Case 3: Medium Risk (Expected: Assigned to analyst for review)
- Name: Carol Davis | Email: carol@test.com
- Card: `378282246310005` | Issuer: Best Buy
- Expected: `300` | Current: `100`
- Description: `I used this at the store and now the balance shows much less.`
- Evidence: `screenshot`

Expected: risk_score ~45–60, risk_level = Medium

### Test Case 4: Critical/Pattern (Expected: Escalated immediately)
- Name: David Wilson | Email: david@test.com
- Card: `6011111111111117` | Issuer: Walmart
- Expected: `500` | Current: `0`
- Description: `Card keeps being drained. This is the third time.`
- Evidence: `none`

Expected: risk_score ~80+, risk_level = Critical

**After each test**: Check System Log for errors. Document Pass/Fail.

---

## SECTION 14: EXPORT UPDATE SET

1. Go to: `System Update Sets > Local Update Sets`
2. Open `GiftGuard_v1.0_CSIT440`
3. Click **Preview Update Set** → wait → resolve any conflicts
4. Click **Export to XML**
5. Save the file as: `GiftGuard_v1.0_UpdateSet.xml`
6. Commit to GitHub: `delivery/GiftGuard_v1.0_UpdateSet.xml`

---

## DEMO TIPS

### 5 minutes before demo:
1. Log in as admin to your PDI
2. Clear any junk test data (keep Test Cases 1–4 in clean state)
3. Open 3 browser tabs:
   - Tab 1: Admin view — dispute list
   - Tab 2: Service Portal (`/sp` or `/giftguard`)
   - Tab 3: Email log (`System Notification > Email > Email Log`)
4. Pre-fill Test Case 2 (high risk) but don't submit yet — for live demo

### During demo script:
1. Show portal → submit Test Case 2 live → "Customer submitted!"
2. Switch to Tab 1 → show the record created with risk_score auto-calculated
3. Show System Log → scroll to show Business Rule executed
4. Show email was sent (Tab 3 or email inbox)
5. Click "Escalate" UI button → show manager notification
6. Click "Approve" on Test Case 1 → show customer approval email

### "Show your 8 components" script:
| Component | Where to show it |
|---|---|
| Client Script | `System Definition > Client Scripts` → open Form Validation |
| Business Rule | `System Definition > Business Rules` → open Calculate Risk |
| UI Action | Open a dispute record → show Approve/Reject/Escalate buttons |
| Notification | `System Notification > Notifications` → open any of the 4 |
| Integration Hub | `System Web Services > REST Messages` → open GiftGuard - Fraud Check API |
| Flow Designer | `Process Automation > Flow Designer` → open Intake Workflow |
| Service Portal | Navigate to your portal URL |
| Access Roles | `System Security > Roles` → show all 4 roles |
