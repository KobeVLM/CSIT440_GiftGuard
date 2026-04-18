# GiftGuard: Code Implementation Guide
## Ready-to-Implement ServiceNow CLI Scripts

---

## FILE STRUCTURE FOR YOUR REPO

```
src/
├── tables/
│   ├── x_xxxx_giftguard_gift_card_dispute.table.json
│   ├── x_xxxx_giftguard_balance_check.table.json
│   └── x_xxxx_giftguard_fraud_score_log.table.json
├── client_scripts/
│   ├── GiftCardDispute_FormValidation.client.js
│   ├── GiftCardDispute_BalanceChecker.client.js
│   └── GiftCardDispute_AttachmentHandler.client.js
├── business_rules/
│   ├── GiftCardDispute_OnInsert_CalculateRisk.business_rule.js
│   ├── GiftCardDispute_OnUpdate_AutoEscalate.business_rule.js
│   └── GiftCardDispute_BeforeInsert_MaskCard.business_rule.js
├── ui_actions/
│   ├── GiftCardDispute_ApproveDispute.ui_action.js
│   ├── GiftCardDispute_RejectDispute.ui_action.js
│   ├── GiftCardDispute_EscalateDispute.ui_action.js
│   └── GiftCardDispute_CheckBalance.ui_action.js
├── notifications/
│   ├── GiftCardDispute_Received.notification.json
│   ├── GiftCardDispute_StatusUpdated.notification.json
│   ├── GiftCardDispute_ApprovalRequest.notification.json
│   └── GiftCardDispute_CustomerNotification.notification.json
├── integration_hub/
│   ├── FraudDetectionAPI_Connection.rest.json
│   └── BalanceCheckAPI_Connection.rest.json
├── flow_designer/
│   └── GiftCardDispute_IntakeWorkflow.flow.json
└── service_portal/
    └── GiftCardDispute_Intake.portal.json
```

---

## PART 1: TABLE DEFINITIONS

### 1.1 Gift Card Dispute Table Definition

**File**: `src/tables/x_xxxx_giftguard_gift_card_dispute.table.json`

```json
{
  "sys_class_name": "sys_db_object",
  "label": "Gift Card Dispute",
  "name": "x_xxxx_giftguard_gift_card_dispute",
  "extends": "task",
  "comment": "Gift card fraud dispute intake and tracking",
  "fields": [
    {
      "element": "number",
      "label": "Dispute Number",
      "type": "string",
      "read_only": true,
      "auto_number": "GCD"
    },
    {
      "element": "customer_name",
      "label": "Customer Name",
      "type": "string",
      "mandatory": true
    },
    {
      "element": "customer_email",
      "label": "Customer Email",
      "type": "string",
      "mandatory": true,
      "validation": "email"
    },
    {
      "element": "customer_phone",
      "label": "Customer Phone",
      "type": "string"
    },
    {
      "element": "gift_card_number",
      "label": "Gift Card Number (Masked)",
      "type": "string",
      "mandatory": true,
      "read_only": true
    },
    {
      "element": "gift_card_issuer",
      "label": "Card Issuer/Brand",
      "type": "reference",
      "reference_table": "cmn_company",
      "mandatory": true
    },
    {
      "element": "reported_balance",
      "label": "Reported Balance (Customer Claims)",
      "type": "decimal",
      "precision": 10,
      "scale": 2
    },
    {
      "element": "expected_balance",
      "label": "Expected Balance (Original)",
      "type": "decimal",
      "precision": 10,
      "scale": 2
    },
    {
      "element": "fraud_amount",
      "label": "Fraud Amount",
      "type": "decimal",
      "precision": 10,
      "scale": 2,
      "read_only": true
    },
    {
      "element": "transaction_date",
      "label": "Date Fraud Was Noticed",
      "type": "date",
      "mandatory": true
    },
    {
      "element": "dispute_description",
      "label": "Dispute Description",
      "type": "text",
      "mandatory": true
    },
    {
      "element": "receipt_attachment",
      "label": "Receipt/Evidence",
      "type": "attachment"
    },
    {
      "element": "evidence_type",
      "label": "Evidence Type",
      "type": "choice",
      "choices": [
        "Receipt",
        "Bank Statement",
        "Email Confirmation",
        "Screenshot",
        "Other"
      ]
    },
    {
      "element": "risk_score",
      "label": "Risk Score (0-100)",
      "type": "integer",
      "read_only": true
    },
    {
      "element": "risk_level",
      "label": "Risk Level",
      "type": "choice",
      "choices": ["Low", "Medium", "High", "Critical"],
      "read_only": true
    },
    {
      "element": "decision",
      "label": "Decision",
      "type": "choice",
      "choices": ["Pending", "Approved", "Rejected"]
    },
    {
      "element": "decision_reason",
      "label": "Decision Reason",
      "type": "text"
    },
    {
      "element": "decision_date",
      "label": "Decision Date",
      "type": "date",
      "read_only": true
    },
    {
      "element": "assigned_analyst",
      "label": "Assigned Analyst",
      "type": "reference",
      "reference_table": "sys_user"
    },
    {
      "element": "refund_amount",
      "label": "Refund Amount",
      "type": "decimal",
      "precision": 10,
      "scale": 2
    },
    {
      "element": "refund_date",
      "label": "Refund Date",
      "type": "date",
      "read_only": true
    },
    {
      "element": "sla_target",
      "label": "SLA Target Date",
      "type": "date",
      "read_only": true
    }
  ]
}
```

### 1.2 Balance Check History Table

**File**: `src/tables/x_xxxx_giftguard_balance_check.table.json`

```json
{
  "sys_class_name": "sys_db_object",
  "label": "Balance Check History",
  "name": "x_xxxx_giftguard_balance_check",
  "comment": "Audit trail of balance checks",
  "fields": [
    {
      "element": "gift_card_dispute",
      "label": "Gift Card Dispute",
      "type": "reference",
      "reference_table": "x_xxxx_giftguard_gift_card_dispute",
      "mandatory": true
    },
    {
      "element": "balance_check_time",
      "label": "Check Time",
      "type": "date_time",
      "read_only": true
    },
    {
      "element": "balance_returned",
      "label": "Balance Returned",
      "type": "decimal",
      "precision": 10,
      "scale": 2
    },
    {
      "element": "api_response_time",
      "label": "API Response Time (ms)",
      "type": "integer"
    },
    {
      "element": "api_status",
      "label": "API Status",
      "type": "choice",
      "choices": ["Success", "Failed", "Timeout"]
    },
    {
      "element": "api_error_message",
      "label": "Error Message",
      "type": "text"
    }
  ]
}
```

### 1.3 Fraud Scoring Log Table

**File**: `src/tables/x_xxxx_giftguard_fraud_score_log.table.json`

```json
{
  "sys_class_name": "sys_db_object",
  "label": "Fraud Scoring Log",
  "name": "x_xxxx_giftguard_fraud_score_log",
  "comment": "Audit log of fraud risk scoring",
  "fields": [
    {
      "element": "gift_card_dispute",
      "label": "Gift Card Dispute",
      "type": "reference",
      "reference_table": "x_xxxx_giftguard_gift_card_dispute",
      "mandatory": true
    },
    {
      "element": "scoring_time",
      "label": "Scoring Time",
      "type": "date_time",
      "read_only": true
    },
    {
      "element": "input_factors",
      "label": "Input Factors (JSON)",
      "type": "text"
    },
    {
      "element": "risk_score",
      "label": "Risk Score",
      "type": "integer"
    },
    {
      "element": "ai_service_used",
      "label": "Service Used",
      "type": "string"
    },
    {
      "element": "reasoning",
      "label": "Scoring Reasoning",
      "type": "text"
    }
  ]
}
```

---

## PART 2: BUSINESS RULES

### 2.1 On Insert - Calculate Risk Score

**File**: `src/business_rules/GiftCardDispute_OnInsert_CalculateRisk.business_rule.js`

```javascript
// Business Rule: Gift Card Dispute - On Insert - Calculate Risk Score
// Scope: x_xxxx_giftguard
// When: Before insert
// Run: All conditions met

(function executeRule(current, previous) {
    try {
        // Rule-based fraud risk scoring
        var riskScore = 0;
        
        // 1. Amount-based risk
        if (current.fraud_amount >= 500) {
            riskScore += 30;
        } else if (current.fraud_amount >= 200) {
            riskScore += 20;
        } else if (current.fraud_amount >= 50) {
            riskScore += 10;
        }
        
        // 2. Time-based risk (if available, check transaction time)
        var transactionDate = current.transaction_date;
        if (transactionDate) {
            var hour = new Date(transactionDate).getHours();
            if (hour >= 22 || hour <= 6) { // 10 PM - 6 AM
                riskScore += 15;
            }
        }
        
        // 3. Evidence risk
        if (!current.receipt_attachment) {
            riskScore += 20; // No evidence is risky
        } else if (current.evidence_type !== 'Receipt') {
            riskScore += 10; // Non-receipt evidence
        }
        
        // 4. Volume risk (check if multiple disputes on same card this month)
        var cardNumber = current.gift_card_number;
        var monthAgo = gs.dateAdd(gs.now(), -30, 'day');
        var disputeCount = new GlideRecord('x_xxxx_giftguard_gift_card_dispute');
        disputeCount.addQuery('gift_card_number', cardNumber);
        disputeCount.addQuery('sys_created_on', '>=', monthAgo);
        disputeCount.addQuery('sys_id', '!=', current.sys_id);
        disputeCount.query();
        if (disputeCount.getRowCount() > 1) {
            riskScore += 25; // Multiple disputes is suspicious
        }
        
        // Cap at 100
        riskScore = Math.min(riskScore, 100);
        
        // Set risk level
        var riskLevel = 'Low';
        if (riskScore >= 75) {
            riskLevel = 'Critical';
        } else if (riskScore >= 60) {
            riskLevel = 'High';
        } else if (riskScore >= 40) {
            riskLevel = 'Medium';
        }
        
        current.risk_score = riskScore;
        current.risk_level = riskLevel;
        
        // Calculate fraud amount if not already set
        if (!current.fraud_amount && current.expected_balance && current.reported_balance) {
            current.fraud_amount = current.expected_balance - current.reported_balance;
        }
        
        // Set SLA target (5 business days from now)
        var slaDays = 5;
        var slaDate = gs.dateAdd(gs.now(), slaDays * 24, 'hour'); // Simplified; should account for weekends
        current.sla_target = slaDate;
        
        // Log the scoring
        var scoreLog = new GlideRecord('x_xxxx_giftguard_fraud_score_log');
        scoreLog.gift_card_dispute = current.sys_id;
        scoreLog.scoring_time = gs.now();
        scoreLog.risk_score = riskScore;
        scoreLog.ai_service_used = 'Rule-based';
        scoreLog.input_factors = JSON.stringify({
            fraud_amount: current.fraud_amount,
            evidence_type: current.evidence_type,
            volume_check: disputeCount.getRowCount()
        });
        scoreLog.reasoning = 'Calculated based on amount, evidence, and volume risk factors';
        scoreLog.insert();
        
    } catch (e) {
        gs.error('Error in fraud scoring: ' + e.message);
    }
})(current, previous);
```

### 2.2 Before Insert - Mask Gift Card Number

**File**: `src/business_rules/GiftCardDispute_BeforeInsert_MaskCard.business_rule.js`

```javascript
// Business Rule: Gift Card Dispute - Before Insert - Mask Card Number
// Scope: x_xxxx_giftguard
// When: Before insert
// Run: All conditions met

(function executeRule(current, previous) {
    try {
        var cardNumber = current.gift_card_number;
        
        if (cardNumber && cardNumber.length > 4) {
            // Keep only last 4 digits
            var masked = '****-****-****-' + cardNumber.substring(cardNumber.length - 4);
            current.gift_card_number = masked;
        }
        
    } catch (e) {
        gs.error('Error masking card number: ' + e.message);
    }
})(current, previous);
```

### 2.3 On Update - Auto Escalate High Risk

**File**: `src/business_rules/GiftCardDispute_OnUpdate_AutoEscalate.business_rule.js`

```javascript
// Business Rule: Gift Card Dispute - On Update - Auto Escalate High Risk
// Scope: x_xxxx_giftguard
// When: After update
// Run: All conditions met

(function executeRule(current, previous) {
    try {
        // Auto-escalate if risk level is Critical and not yet escalated
        if (current.risk_level === 'Critical' && current.assigned_analyst === '' && previous.risk_level !== 'Critical') {
            
            // Find a manager to assign to
            var manager = new GlideRecord('sys_user');
            manager.addQuery('active', true);
            manager.addQuery('sys_user_role.name', 'giftguard_manager');
            manager.setLimit(1);
            manager.query();
            
            if (manager.next()) {
                current.assigned_analyst = manager.sys_id;
                
                // Send urgent notification
                var notification = gs.getObject('sys_notification.notification');
                notification.send({
                    recipient: manager.getUniqueValue(),
                    subject: 'URGENT: Critical Fraud Dispute - ' + current.number,
                    message: 'Risk score: ' + current.risk_score + '\nAmount: $' + current.fraud_amount
                });
            }
        }
        
    } catch (e) {
        gs.error('Error in auto-escalate: ' + e.message);
    }
})(current, previous);
```

---

## PART 3: CLIENT SCRIPTS

### 3.1 Form Validation

**File**: `src/client_scripts/GiftCardDispute_FormValidation.client.js`

```javascript
// Client Script: Gift Card Dispute - Form Validation
// Scope: x_xxxx_giftguard
// Type: onLoad, onChange
// Table: x_xxxx_giftguard_gift_card_dispute

function onLoad() {
    // Hide sensitive fields if user is customer
    var roles = g_user.getRoles();
    if (roles.indexOf('giftguard_customer') > -1) {
        g_form.setSectionDisplay('risk_and_decision', false);
        g_form.makeFieldReadOnly('decision', true);
        g_form.makeFieldReadOnly('risk_score', true);
    }
}

function validateEmail(fieldName) {
    var email = g_form.getValue(fieldName);
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        g_form.addFieldMessage(fieldName, 'Invalid email format', 'error');
        return false;
    }
    return true;
}

function validatePhone(fieldName) {
    var phone = g_form.getValue(fieldName);
    if (phone && phone.replace(/\D/g, '').length < 10) {
        g_form.addFieldMessage(fieldName, 'Phone must be at least 10 digits', 'error');
        return false;
    }
    return true;
}

function validateCardNumber(fieldName) {
    var cardNum = g_form.getValue(fieldName);
    // Allow only digits, at least 13 chars (standard card length)
    if (cardNum && cardNum.replace(/\D/g, '').length < 13) {
        g_form.addFieldMessage(fieldName, 'Card number must be at least 13 digits', 'error');
        return false;
    }
    return true;
}

function onFieldChange(control, fieldName, oldValue, newValue, isLoading) {
    switch(fieldName) {
        case 'customer_email':
            validateEmail(fieldName);
            break;
        case 'customer_phone':
            validatePhone(fieldName);
            break;
        case 'gift_card_number':
            validateCardNumber(fieldName);
            break;
    }
}

// On form submit
function onBeforeUpdate() {
    // Validate all required fields
    var email = g_form.getValue('customer_email');
    var phone = g_form.getValue('customer_phone');
    var cardNum = g_form.getValue('gift_card_number');
    
    if (!validateEmail('customer_email') || !validatePhone('customer_phone') || !validateCardNumber('gift_card_number')) {
        return false; // Prevent form submission
    }
    
    return true;
}
```

### 3.2 Balance Checker

**File**: `src/client_scripts/GiftCardDispute_BalanceChecker.client.js`

```javascript
// Client Script: Gift Card Dispute - Balance Checker
// Scope: x_xxxx_giftguard
// Type: onLoad
// Table: x_xxxx_giftguard_gift_card_dispute

function checkBalance() {
    var cardNumber = g_form.getValue('gift_card_number');
    var issuer = g_form.getValue('gift_card_issuer');
    
    if (!cardNumber || !issuer) {
        alert('Please enter card number and issuer');
        return;
    }
    
    // Show loading spinner
    var progressId = GlideUI.get().getProgressBar().createProgressBar();
    
    // Call the Integration Hub endpoint
    var request = new XMLHttpRequest();
    request.open('GET', '/api/now/x_xxxx_giftguard/balance_check?card=' + cardNumber + '&issuer=' + issuer, true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    request.onload = function() {
        GlideUI.get().getProgressBar().removeProgressBar(progressId);
        
        if (request.status === 200) {
            var response = JSON.parse(request.responseText);
            if (response.balance !== undefined) {
                g_form.setValue('reported_balance', response.balance);
                alert('Current balance: $' + response.balance);
            } else {
                alert('Unable to retrieve balance: ' + response.error);
            }
        } else {
            alert('API Error: ' + request.status);
        }
    };
    
    request.onerror = function() {
        GlideUI.get().getProgressBar().removeProgressBar(progressId);
        alert('Network error while checking balance');
    };
    
    request.send();
}

// Add button to form via HTML snippet or UI Action
function addBalanceCheckButton() {
    var html = '<button class="btn btn-default" onclick="checkBalance()">Check Current Balance</button>';
    // Insert into form
}
```

---

## PART 4: UI ACTIONS

### 4.1 Approve Dispute

**File**: `src/ui_actions/GiftCardDispute_ApproveDispute.ui_action.js`

```javascript
// UI Action: Gift Card Dispute - Approve Dispute
// Table: x_xxxx_giftguard_gift_card_dispute
// Action name: approve_dispute
// Condition: gs.hasRole('giftguard_analyst') && current.status == 'New'

var dispute = new GlideRecord('x_xxxx_giftguard_gift_card_dispute');
dispute.get(current.sys_id);

// Update dispute
dispute.decision = 'Approved';
dispute.decision_date = gs.now();
dispute.decision_reason = gs.getProperty('default.approval.reason', 'Fraud verified. Refund issued.');
dispute.status = 'Approved';
dispute.refund_amount = dispute.fraud_amount;
dispute.refund_date = gs.dateAdd(gs.now(), 3, 'day'); // Refund in 3 days
dispute.update();

// Send approval notification
var notification = new GlideRecord('sys_notification');
notification.initialize();
notification.recipient = dispute.customer_email;
notification.subject = 'Gift Card Dispute Approved - ' + dispute.number;
notification.message = 'Your fraud dispute has been approved. Refund amount: $' + dispute.refund_amount + ' will be processed by ' + dispute.refund_date;
notification.type = 'email';
notification.insert();

// Log activity
gs.info('Dispute ' + dispute.number + ' approved by ' + gs.getUserID());

action.setRedirectURL(dispute);
```

### 4.2 Reject Dispute

**File**: `src/ui_actions/GiftCardDispute_RejectDispute.ui_action.js`

```javascript
// UI Action: Gift Card Dispute - Reject Dispute
// Table: x_xxxx_giftguard_gift_card_dispute
// Action name: reject_dispute
// Condition: gs.hasRole('giftguard_analyst') && current.status == 'New'

var dispute = new GlideRecord('x_xxxx_giftguard_gift_card_dispute');
dispute.get(current.sys_id);

// Prompt for reason (in real app, would be modal dialog)
var reason = prompt('Enter reason for rejection:', 'Insufficient evidence provided');

if (reason) {
    dispute.decision = 'Rejected';
    dispute.decision_date = gs.now();
    dispute.decision_reason = reason;
    dispute.status = 'Rejected';
    dispute.update();
    
    // Send rejection notification
    var notification = new GlideRecord('sys_notification');
    notification.initialize();
    notification.recipient = dispute.customer_email;
    notification.subject = 'Gift Card Dispute Decision - ' + dispute.number;
    notification.message = 'Your fraud dispute has been reviewed and rejected.\n\nReason: ' + reason + '\n\nYou may appeal this decision.';
    notification.type = 'email';
    notification.insert();
    
    gs.info('Dispute ' + dispute.number + ' rejected by ' + gs.getUserID() + '. Reason: ' + reason);
    
    action.setRedirectURL(dispute);
}
```

### 4.3 Escalate Dispute

**File**: `src/ui_actions/GiftCardDispute_EscalateDispute.ui_action.js`

```javascript
// UI Action: Gift Card Dispute - Escalate Dispute
// Table: x_xxxx_giftguard_gift_card_dispute
// Action name: escalate_dispute
// Condition: gs.hasRole('giftguard_analyst') && current.risk_level == 'High'

var dispute = new GlideRecord('x_xxxx_giftguard_gift_card_dispute');
dispute.get(current.sys_id);

// Find manager
var manager = new GlideRecord('sys_user');
manager.addQuery('active', true);
manager.addQuery('sys_user_role.name', 'giftguard_manager');
manager.orderByDesc('sys_created_on');
manager.setLimit(1);
manager.query();

if (manager.next()) {
    dispute.assigned_analyst = manager.sys_id;
    dispute.status = 'Escalated';
    dispute.update();
    
    // Send manager notification
    var notification = new GlideRecord('sys_notification');
    notification.initialize();
    notification.recipient = manager.email;
    notification.subject = 'HIGH PRIORITY: Dispute Escalated - ' + dispute.number;
    notification.message = 'Dispute escalated for manager review.\n\nRisk Score: ' + dispute.risk_score + '\nFraud Amount: $' + dispute.fraud_amount;
    notification.type = 'email';
    notification.insert();
    
    gs.info('Dispute ' + dispute.number + ' escalated to manager ' + manager.name);
    action.setRedirectURL(dispute);
} else {
    alert('No managers available. Please contact system administrator.');
}
```

---

## PART 5: NOTIFICATIONS

### 5.1 Dispute Received Email

**File**: `src/notifications/GiftCardDispute_Received.notification.json`

```json
{
  "sys_class_name": "sys_notification",
  "name": "Gift Card Dispute - Received",
  "type": "email",
  "category": "fulfillment",
  "active": true,
  "recipients": "${recipient}",
  "subject": "Your Gift Card Fraud Dispute Has Been Received - ${number}",
  "template": {
    "body": "Dear ${customer_name},\n\nThank you for reporting your gift card fraud claim.\n\nDispute ID: ${number}\nCard Issuer: ${gift_card_issuer}\nFraud Amount: $${fraud_amount}\nReport Date: ${sys_created_on}\n\nYour dispute is now under review. We will investigate and get back to you within 5 business days.\n\nIf you have any questions, please reply to this email.\n\nBest regards,\nGiftGuard Fraud Team",
    "condition": "current.status == 'New'"
  }
}
```

### 5.2 Status Update Notification

**File**: `src/notifications/GiftCardDispute_StatusUpdated.notification.json`

```json
{
  "sys_class_name": "sys_notification",
  "name": "Gift Card Dispute - Status Updated",
  "type": "email",
  "category": "fulfillment",
  "active": true,
  "recipients": "${customer_email}",
  "subject": "Update: Your Gift Card Dispute ${number} - Status: ${status}",
  "template": {
    "body": "Dear ${customer_name},\n\nYour gift card dispute has been updated.\n\nDispute ID: ${number}\nNew Status: ${status}\nDecision: ${decision}\n${decision_reason}\n\nIf approved, your refund of $${refund_amount} will be processed by ${refund_date}.\n\nThank you,\nGiftGuard Fraud Team",
    "condition": "current.status != 'New'"
  }
}
```

---

## PART 6: INTEGRATION HUB (FREE FRAUD API)

### 6.1 AbuseIPDB Integration (Recommended for Free Tier)

**File**: `src/integration_hub/FraudDetectionAPI_AbuseIPDB.rest.json`

```json
{
  "sys_class_name": "sys_rest_message",
  "name": "Check Fraud Risk - AbuseIPDB",
  "endpoint": "https://api.abuseipdb.com/api/v2/check",
  "http_method": "POST",
  "authentication_type": "basic",
  "headers": {
    "Key": "Content-Type",
    "Value": "application/json"
  },
  "requests": [
    {
      "name": "Check IP Reputation",
      "path": "/check",
      "http_method": "POST",
      "body": {
        "ipAddress": "${ip_address}",
        "maxAgeInDays": 90,
        "verbose": true
      },
      "headers": {
        "Key": "Authorization",
        "Value": "Bearer ${api_key}"
      }
    }
  ],
  "notes": "Free tier: 15 requests/day. Gets IP abuse score (0-100). Store API key in System Properties as 'abuseipdb.api.key'"
}
```

### 6.2 Script Integration (Recommended Approach)

**File**: `src/integration_hub/FraudDetectionAPI_RuleBased.business_rule.js`

Instead of external API, use the rule-based scoring in Business Rule 2.1. This is free and doesn't require API key.

---

## PART 7: FLOW DESIGNER WORKFLOW

### 7.1 Dispute Intake Flow

**Trigger**: When Gift Card Dispute record is created

**Steps**:

1. **Initialize Log**
   - Log "Dispute received: {number}"

2. **Calculate Risk Score**
   - Call Business Rule (already done on insert)
   - Risk score is already in record

3. **Branch on Risk Level**
   - If risk_level == "Critical":
     - Assign to manager queue
     - Set priority = "High"
   - Else if risk_level == "High":
     - Assign to senior analyst queue
   - Else:
     - Assign to general analyst queue

4. **Send Analyst Notification**
   - To: assigned_analyst email
   - Subject: "New Dispute: {number} - Risk: {risk_level}"

5. **Set SLA**
   - SLA target = 5 business days (already set in Business Rule)
   - Add task for SLA reminder on day 4

6. **Send Customer Confirmation**
   - To: customer_email
   - Subject: "Your Dispute Has Been Received"

7. **Wait for Approval**
   - Wait until decision != "Pending"
   - Timeout: 5 business days

8. **Send Final Notification**
   - If approved: Send refund confirmation
   - If rejected: Send rejection reason

---

## PART 8: SERVICE PORTAL FORM

### 8.1 Gift Card Dispute Intake Portal

**File**: `src/service_portal/GiftCardDispute_Intake.portal.json`

```json
{
  "sys_class_name": "sp_portal",
  "name": "Gift Card Fraud Intake",
  "url": "gift-fraud-intake",
  "header": {
    "title": "Report Gift Card Fraud",
    "subtitle": "Submit a claim for gift card balance discrepancies"
  },
  "form": {
    "table": "x_xxxx_giftguard_gift_card_dispute",
    "fields": [
      {
        "field": "customer_name",
        "label": "Full Name",
        "mandatory": true,
        "type": "text"
      },
      {
        "field": "customer_email",
        "label": "Email Address",
        "mandatory": true,
        "type": "email"
      },
      {
        "field": "customer_phone",
        "label": "Phone Number",
        "mandatory": false,
        "type": "tel"
      },
      {
        "field": "gift_card_issuer",
        "label": "Card Issuer (Brand)",
        "mandatory": true,
        "type": "reference",
        "reference_table": "cmn_company"
      },
      {
        "field": "gift_card_number",
        "label": "Gift Card Number",
        "hint": "Last 4 digits will be visible; full number is encrypted",
        "mandatory": true,
        "type": "text"
      },
      {
        "field": "expected_balance",
        "label": "Expected Balance (What you had)",
        "mandatory": true,
        "type": "currency"
      },
      {
        "field": "reported_balance",
        "label": "Current Balance (What's left)",
        "mandatory": true,
        "type": "currency"
      },
      {
        "field": "transaction_date",
        "label": "When Did You First Notice?",
        "mandatory": true,
        "type": "date"
      },
      {
        "field": "dispute_description",
        "label": "What Happened? Describe the fraud",
        "mandatory": true,
        "type": "textarea",
        "max_length": 5000
      },
      {
        "field": "evidence_type",
        "label": "Type of Evidence",
        "mandatory": false,
        "type": "choice",
        "choices": ["Receipt", "Bank Statement", "Email Confirmation", "Screenshot", "Other"]
      },
      {
        "field": "receipt_attachment",
        "label": "Upload Receipt or Evidence",
        "mandatory": false,
        "type": "file",
        "max_size": 5242880
      }
    ],
    "on_submit": {
      "redirect": "confirmation",
      "message": "Thank you! Your dispute has been submitted. You will receive an email confirmation shortly."
    }
  }
}
```

---

## PART 9: ROLES & ACCESS CONTROL

### 9.1 Create Roles

```sql
-- SQL to add to initialization script

INSERT INTO sys_user_role (name, description, grantable) VALUES
('giftguard_customer', 'Gift Card Fraud - Customer', true),
('giftguard_analyst', 'Gift Card Fraud - Dispute Analyst', true),
('giftguard_manager', 'Gift Card Fraud - Manager', true),
('giftguard_admin', 'Gift Card Fraud - Administrator', true);
```

### 9.2 Access Rules

```javascript
// Access Rule: Gift Card Dispute - Customers see only their own
// Operation: read, write, delete
// Role: giftguard_customer
// Condition: current.customer_email == gs.getUserID() OR current.customer_email == current.contact

// Access Rule: Gift Card Dispute - Analysts full access
// Operation: read, write
// Role: giftguard_analyst
// Condition: none (full access)

// Access Rule: Gift Card Dispute - Managers can see escalated
// Operation: read
// Role: giftguard_manager
// Condition: current.status == 'Escalated' OR current.risk_level == 'Critical'
```

---

## PART 10: QUICK START - FILE CREATION CHECKLIST

- [ ] Create `src/tables/*.json` (3 files)
- [ ] Create `src/business_rules/*.js` (3 files)
- [ ] Create `src/client_scripts/*.js` (2 files)
- [ ] Create `src/ui_actions/*.js` (4 files)
- [ ] Create `src/notifications/*.json` (2 files)
- [ ] Create roles in System Properties or script
- [ ] Test each component individually
- [ ] Package in Update Set

---

## PART 11: SERVICENOW CLI DEPLOYMENT

```bash
# Install dependencies
npm install

# Deploy to instance
sn develop --url https://your-instance.service-now.com

# Push changes to git
git add .
git commit -m "GiftGuard implementation"
git push origin main

# Create Update Set
# In ServiceNow: Go to System Update Sets > Local Update Sets
# Select all components for x_xxxx_giftguard scope
# Export to XML or create Update Set manually
```

---

**Next**: Proceed to testing and refinement based on your instance.
