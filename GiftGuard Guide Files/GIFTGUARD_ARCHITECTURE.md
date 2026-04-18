# GiftGuard: Gift Card Balance & Fraud Intake Solution
## Complete Architecture & Implementation Guide

---

## 1. SOLUTION OVERVIEW

**Problem**: Gift cards show drained balances due to skim/scam. Retail chains need:
- A way to check current balance
- Dispute intake system with evidence upload
- Automated fraud risk scoring
- Decision workflow with SLA tracking
- Email-based approval chain

**Solution**: GiftGuard is a ServiceNow scoped app that provides a complete fraud intake and dispute management platform.

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    SERVICE PORTAL                        │
│         (Customer-Facing Dispute Intake Form)            │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   CLIENT SCRIPTS              BUSINESS RULES
   (Form Validation)        (Auto Risk Scoring)
        │                             │
        └──────────────┬──────────────┘
                       │
        ┌──────────────v──────────────┐
        │   INTEGRATION HUB (REST)    │
        │  + FREE FRAUD API SERVICE   │
        └──────────────┬──────────────┘
                       │
        ┌──────────────v──────────────┐
        │   CUSTOM DATA TABLES        │
        │ • Gift Card Dispute         │
        │ • Balance Check History     │
        │ • Fraud Scoring Log         │
        └──────────────┬──────────────┘
                       │
        ┌──────────────v──────────────┐
        │    FLOW DESIGNER            │
        │ (Routing + Auto Decision)   │
        └──────────────┬──────────────┘
                       │
        ┌──────────────v──────────────┐
        │    UI ACTIONS               │
        │ • Approve/Reject/Escalate   │
        │ • Generate Decision Letter  │
        └──────────────┬──────────────┘
                       │
        ┌──────────────v──────────────┐
        │   NOTIFICATIONS             │
        │ • Inbound: Email Intake     │
        │ • Outbound: Status Updates  │
        │ • Approval via Email        │
        └─────────────────────────────┘
```

---

## 3. DATA MODEL

### 3.1 Gift Card Dispute Table (`x_xxxx_giftguard_gift_card_dispute`)

| Field Name | Type | Purpose |
|---|---|---|
| **number** | String (Auto) | Dispute ticket ID (e.g., GCD0001234) |
| **short_description** | String | Summary of dispute |
| **customer_name** | String | Customer full name |
| **customer_email** | String | For notifications |
| **customer_phone** | String | Contact number |
| **gift_card_number** | String (encrypted) | Masked: Last 4 digits only |
| **gift_card_issuer** | Reference | Link to Retailer/Brand |
| **reported_balance** | Decimal | What customer claims remains |
| **expected_balance** | Decimal | What they believe they had |
| **fraud_amount** | Decimal | Difference |
| **transaction_date** | Date | When fraud was noticed |
| **dispute_description** | Text | Customer narrative |
| **receipt_attachment** | Attachment | Receipt/Evidence upload |
| **evidence_type** | Choice | [Receipt, Bank Statement, Email Confirmation, Other] |
| **risk_score** | Integer | AI-calculated fraud probability (0-100) |
| **risk_level** | Choice | [Low, Medium, High, Critical] |
| **status** | Choice | [New, Under Review, Approved, Rejected, Escalated, Refund Issued] |
| **decision** | Choice | [Pending, Approved, Rejected] |
| **decision_reason** | Text | Why approved/rejected |
| **decision_date** | Date | When decision was made |
| **assigned_analyst** | Reference | To fraud_analyst role |
| **refund_amount** | Decimal | Amount to refund (if approved) |
| **refund_date** | Date | When refund was processed |
| **sla_target** | DateTime | SLA deadline (5 business days) |
| **created_date** | DateTime | Auto |
| **updated_date** | DateTime | Auto |

### 3.2 Balance Check History Table (`x_xxxx_giftguard_balance_check`)

| Field Name | Type | Purpose |
|---|---|---|
| **number** | String (Auto) | Check ID |
| **gift_card_dispute** | Reference | Link to dispute |
| **balance_check_time** | DateTime | When checked |
| **balance_returned** | Decimal | Current balance from API |
| **api_response_time** | Integer | Response time in ms |
| **api_status** | Choice | [Success, Failed, Timeout] |
| **api_error_message** | Text | If failed, why |

### 3.3 Fraud Scoring Log Table (`x_xxxx_giftguard_fraud_score_log`)

| Field Name | Type | Purpose |
|---|---|---|
| **number** | String (Auto) | Log ID |
| **gift_card_dispute** | Reference | Link to dispute |
| **scoring_time** | DateTime | When scored |
| **input_factors** | Text (JSON) | Factors used |
| **risk_score** | Integer | Calculated score |
| **ai_service_used** | String | Which API/service |
| **reasoning** | Text | Why this score |

---

## 4. REQUIRED SERVICENOW COMPONENTS

### 4.1 CLIENT SCRIPTS
- **Balance Checker**: On-demand JS to call Integration Hub
- **Form Validation**: Required fields, email format, phone format
- **Attachment Handler**: Size/type validation

### 4.2 BUSINESS RULES
- **On Insert**: Calculate risk_score, set SLA target
- **On Update**: Update risk_level, auto-escalate if high risk
- **Before Insert**: Mask gift card number (last 4 digits only)

### 4.3 UI ACTIONS
- **Approve Dispute**: Transition to "Approved", set refund_amount, send email
- **Reject Dispute**: Transition to "Rejected", fill decision_reason, send email
- **Escalate**: Change assigned_analyst, mark risk_level as "Critical"
- **Check Balance Now**: Call Integration Hub REST endpoint

### 4.4 NOTIFICATIONS
- **Dispute Received (Inbound Email)**: Service Portal → Dispute Table
- **Status Update (Outbound Email)**: Sent when status changes
- **Manager Approval Needed (Email)**: Request decision from analyst
- **Customer Notification**: Refund approved/rejected

### 4.5 INTEGRATION HUB (REST)
- **Endpoint Type**: REST Request
- **Authentication**: API Key (free service)
- **Target**: Free fraud detection API (e.g., MaxMind, GeoIP2, or custom)
- **Request**: Send gift card info + transaction details
- **Response**: Return risk_score + reasoning

### 4.6 FLOW DESIGNER
- **Trigger**: When Gift Card Dispute is created
- **Steps**:
  1. Call Integration Hub (fraud API)
  2. Update dispute with risk_score
  3. If risk_score > 75: Assign to escalation queue
  4. If risk_score 40-75: Assign to regular analyst
  5. Send notification to assigned analyst
  6. Set SLA reminder (5 days)

### 4.7 SERVICE PORTAL
- **Portal**: Gift Card Dispute Intake
- **Form Fields**:
  - Customer Info (Name, Email, Phone)
  - Gift Card Details (Number masked, Issuer, Balance)
  - Dispute Details (Description, Date Noticed)
  - Evidence Upload (Receipt/Screenshot)
- **Workflow**: Auto-trigger Flow Designer on submission

### 4.8 ACCESS CONTROL (Roles)
- **`giftguard_customer`**: Can submit disputes, view own status
- **`giftguard_analyst`**: Can review, approve/reject disputes
- **`giftguard_manager`**: Can escalate, override decisions
- **`giftguard_admin`**: Full access, configures app

---

## 5. FREE FRAUD DETECTION API OPTIONS

### Option 1: AbuseIPDB (Free Tier)
- Checks if IP is known for fraud
- Endpoint: `https://api.abuseipdb.com/api/v2/check`
- Free: 15 requests/day (good for a capstone)
- Returns: Abuse score (0-100)

### Option 2: MaxMind GeoIP2 (Free Lite DB)
- Download free GeoLite2 database
- Check IP location mismatches
- Run locally in ServiceNow

### Option 3: Custom Rule-Based Scoring
- No external API needed
- Rules like:
  - High amount = high risk (+20)
  - Unusual time (3 AM) = risk (+15)
  - Multiple transactions same day = risk (+25)
  - Expired receipt = risk (+10)

**Recommendation**: Start with **Option 3** (rule-based), then upgrade to **AbuseIPDB** if you want external API integration.

---

## 6. SLA STRATEGY

| Scenario | SLA | Action |
|---|---|---|
| New dispute | 5 business days | Assign to analyst |
| High risk ($500+) | 2 business days | Escalate to manager |
| Critical risk | 24 hours | Executive review |
| Breached SLA | Urgent flag | Auto-escalate |

---

## 7. IMPLEMENTATION TIMELINE (Phased)

### Phase 1: Data Model & Basic UI (Days 1-3)
- [ ] Create custom tables
- [ ] Create Service Portal form
- [ ] Build basic Business Rules

### Phase 2: Integration & Automation (Days 4-6)
- [ ] Set up Integration Hub endpoint
- [ ] Create Flow Designer workflow
- [ ] Write Client Scripts

### Phase 3: Notifications & Actions (Days 7-9)
- [ ] Create email notifications
- [ ] Build UI Actions (Approve/Reject)
- [ ] Test end-to-end

### Phase 4: Testing & Polish (Days 10-12)
- [ ] Test with sample data
- [ ] Set up roles/access control
- [ ] Package in Update Set
- [ ] Prepare documentation

---

## 8. KEY BUSINESS LOGIC FLOWS

### 8.1 Dispute Intake Flow
```
Customer submits form
  ↓
Validation (Client Script)
  ↓
Record created in Gift Card Dispute table
  ↓
Business Rule triggers:
  • Calculate risk_score
  • Mask gift card number
  • Set SLA target
  ↓
Flow Designer starts:
  • Call fraud API
  • Update risk_level
  • Route to analyst queue
  ↓
Notification sent to analyst
  ↓
Email confirmation sent to customer
```

### 8.2 Approval/Rejection Flow
```
Analyst reviews dispute
  ↓
Clicks "Approve" or "Reject" UI Action
  ↓
Business Rule updates:
  • Sets decision field
  • Fills decision_reason
  • Sets decision_date
  ↓
Email sent to customer
  ↓
If approved:
  • Finance team notified
  • Refund issued (integration to payment system)
  ↓
Dispute marked complete
```

---

## 9. SAMPLE SLA POLICY

**Gift Card Fraud Dispute - 5 Business Day Resolution**

- **Condition**: Risk_level = "Low" AND fraud_amount < $100
  - Analyst can auto-approve
  - Refund within 3 days

- **Condition**: Risk_level = "Medium" OR fraud_amount $100-$500
  - Analyst review required
  - Manager approval for refund > $300
  - Resolve within 5 days

- **Condition**: Risk_level = "High" OR fraud_amount > $500
  - Escalate to manager immediately
  - Request additional documentation
  - Executive review required
  - Resolve within 48 hours

---

## 10. FRAUD RISK SCORING ALGORITHM (Rule-Based)

```
risk_score = 0

// Amount risk
if fraud_amount > 500:
    risk_score += 30
elif fraud_amount > 200:
    risk_score += 20
elif fraud_amount > 50:
    risk_score += 10

// Time-based risk
if transaction_time between 22:00 - 06:00:
    risk_score += 15

// Location risk (if IP geolocation available)
if customer_country != card_purchase_country:
    risk_score += 25

// Evidence risk
if no receipt_attachment:
    risk_score += 20
elif receipt_attachment is image (not PDF):
    risk_score += 10

// Volume risk
if multiple_disputes_same_card_this_month:
    risk_score += 25

// Capped at 100
risk_score = min(risk_score, 100)

// Set risk_level
if risk_score >= 75:
    risk_level = "Critical"
elif risk_score >= 60:
    risk_level = "High"
elif risk_score >= 40:
    risk_level = "Medium"
else:
    risk_level = "Low"
```

---

## 11. UPDATE SET STRUCTURE

```
x_xxxx_giftguard (scope: x_xxxx_giftguard)
├── Tables
│   ├── Gift Card Dispute (x_xxxx_giftguard_gift_card_dispute)
│   ├── Balance Check History (x_xxxx_giftguard_balance_check)
│   └── Fraud Scoring Log (x_xxxx_giftguard_fraud_score_log)
├── Service Portal
│   └── Gift Card Dispute Intake
├── UI Actions
│   ├── Approve Dispute
│   ├── Reject Dispute
│   ├── Escalate Dispute
│   └── Check Balance
├── Client Scripts
│   ├── Gift Card Dispute - Form Validation
│   ├── Gift Card Dispute - Balance Checker
│   └── Gift Card Dispute - Attachment Handler
├── Business Rules
│   ├── On Insert - Calculate Risk Score
│   ├── On Update - Auto Escalate
│   └── Before Insert - Mask Gift Card
├── Notifications
│   ├── Gift Card Dispute Received
│   ├── Dispute Status Updated
│   ├── Approval Request
│   └── Customer Notification
├── Integration Hub
│   ├── Fraud Detection API Connection
│   ├── Balance Check API Connection
│   └── Refund Processing API Connection
├── Flow Designer
│   └── Gift Card Dispute Intake Workflow
└── Access Control
    ├── Roles (giftguard_admin, giftguard_analyst, etc.)
    └── Access Rules
```

---

## 12. TESTING CHECKLIST

- [ ] Create test gift card dispute
- [ ] Verify Business Rules trigger (risk_score calculated)
- [ ] Check Flow Designer execution
- [ ] Verify notifications sent
- [ ] Test UI Action (Approve)
- [ ] Verify email sent to customer
- [ ] Test with attachments
- [ ] Verify access control (roles)
- [ ] Test SLA reminder
- [ ] Check audit trail

---

## 13. DEPLOYMENT NOTES

1. **Update Set**: All components packaged in a single Update Set
2. **Scope**: `x_xxxx_giftguard` (replace `xxxx` with your instance prefix)
3. **Dependencies**: None (uses standard ServiceNow)
4. **API Keys**: Store in System Properties (secure)
5. **Training**: Document user workflows for analysts

---

## 14. SUCCESS METRICS

- Average dispute resolution time < 5 days
- Fraud detection accuracy > 85%
- Customer satisfaction > 4/5 stars
- False positive rate < 10%
- SLA compliance > 95%

---

**Next Steps**: Proceed to Section 6 (Code Implementation) in the companion document.
