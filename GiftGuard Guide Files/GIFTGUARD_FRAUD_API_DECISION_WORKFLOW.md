# GiftGuard: Free Fraud Detection API Integration
## Complete Guide with Decision Workflow

---

## PART 1: FREE FRAUD API OPTIONS COMPARISON

| Service | Free Tier | API Calls | Setup | Use Case |
|---|---|---|---|---|
| **AbuseIPDB** | Yes | 15/day | API key signup | IP reputation (good for login fraud) |
| **MaxMind GeoLite2** | Yes | Unlimited | Download DB | Geolocation mismatch detection |
| **Rule-Based (No API)** | Yes | Unlimited | No signup | Deterministic scoring (recommended for capstone) |
| **VirusTotal** | Limited | 4/min | API key | Domain/URL reputation |
| **Fraudster** | No | Paid | - | Too expensive |

**Recommendation for Capstone**: Start with **Rule-Based Scoring** (no external API needed), then optionally add **AbuseIPDB** for IP reputation.

---

## PART 2: RULE-BASED FRAUD SCORING (NO API REQUIRED)

This is the simplest and most reliable approach for your capstone.

### 2.1 Complete Scoring Algorithm

**File**: `src/scripts/GiftCardDispute_FraudScoring.script.js`

```javascript
// Script: Gift Card Dispute - Fraud Risk Scoring Algorithm
// Scope: x_xxxx_giftguard
// Called from: Business Rule on Insert

var GiftCardFraudScorer = {
    
    /**
     * Calculate risk score based on multiple factors
     * Returns object: { risk_score: 0-100, risk_level: 'Low'|'Medium'|'High'|'Critical', factors: {...} }
     */
    calculateRiskScore: function(dispute) {
        var riskScore = 0;
        var factors = {};
        
        // ========== FACTOR 1: FRAUD AMOUNT ==========
        var fraudAmount = dispute.fraud_amount || 0;
        if (fraudAmount >= 1000) {
            riskScore += 35;
            factors.amount = { score: 35, reason: 'Large amount fraud ($1000+)' };
        } else if (fraudAmount >= 500) {
            riskScore += 25;
            factors.amount = { score: 25, reason: 'Medium-large amount fraud ($500-999)' };
        } else if (fraudAmount >= 200) {
            riskScore += 15;
            factors.amount = { score: 15, reason: 'Medium amount fraud ($200-499)' };
        } else if (fraudAmount >= 50) {
            riskScore += 8;
            factors.amount = { score: 8, reason: 'Small amount fraud ($50-199)' };
        } else {
            factors.amount = { score: 0, reason: 'Very small amount fraud' };
        }
        
        // ========== FACTOR 2: EVIDENCE QUALITY ==========
        var evidenceScore = 0;
        if (!dispute.receipt_attachment) {
            // No evidence = high risk
            evidenceScore = 30;
            factors.evidence = { score: 30, reason: 'NO EVIDENCE PROVIDED' };
        } else if (dispute.evidence_type === 'Receipt') {
            // Receipt is best evidence
            evidenceScore = 0;
            factors.evidence = { score: 0, reason: 'Receipt provided (trusted)' };
        } else if (dispute.evidence_type === 'Email Confirmation') {
            evidenceScore = 5;
            factors.evidence = { score: 5, reason: 'Email evidence (minor risk)' };
        } else if (dispute.evidence_type === 'Bank Statement') {
            evidenceScore = 8;
            factors.evidence = { score: 8, reason: 'Bank statement (good but not receipt)' };
        } else if (dispute.evidence_type === 'Screenshot') {
            evidenceScore = 20;
            factors.evidence = { score: 20, reason: 'Screenshot only (can be faked)' };
        } else {
            evidenceScore = 25;
            factors.evidence = { score: 25, reason: 'Other evidence type (unknown quality)' };
        }
        riskScore += evidenceScore;
        
        // ========== FACTOR 3: TIME-BASED RISK ==========
        var timeScore = 0;
        if (dispute.transaction_date) {
            var txDate = new Date(dispute.transaction_date);
            var hour = txDate.getHours();
            var dayOfWeek = txDate.getDay();
            
            // Suspicious times: late night / early morning
            if ((hour >= 23 || hour <= 5) && hour !== 0) {
                timeScore += 12;
                factors.time = { score: 12, reason: 'Transaction during late night (11 PM - 5 AM)' };
            }
            // Weekend early morning
            else if ((dayOfWeek === 0 || dayOfWeek === 6) && (hour >= 0 && hour <= 8)) {
                timeScore += 8;
                factors.time = { score: 8, reason: 'Weekend early morning (suspicious pattern)' };
            } else {
                factors.time = { score: 0, reason: 'Normal transaction time' };
            }
        }
        riskScore += timeScore;
        
        // ========== FACTOR 4: CARD HISTORY / VOLUME RISK ==========
        var volumeScore = 0;
        var monthAgo = gs.dateAdd(gs.now(), -30, 'day');
        var disputeGR = new GlideRecord('x_xxxx_giftguard_gift_card_dispute');
        disputeGR.addQuery('gift_card_number', dispute.gift_card_number);
        disputeGR.addQuery('sys_created_on', '>=', monthAgo);
        disputeGR.addQuery('sys_id', '!=', dispute.sys_id);
        disputeGR.query();
        var disputeCount = disputeGR.getRowCount();
        
        if (disputeCount > 5) {
            volumeScore = 30;
            factors.volume = { score: 30, reason: 'Card has 5+ disputes in 30 days (PATTERN OF FRAUD)' };
        } else if (disputeCount > 2) {
            volumeScore = 20;
            factors.volume = { score: 20, reason: 'Card has multiple disputes (pattern)' };
        } else if (disputeCount > 0) {
            volumeScore = 10;
            factors.volume = { score: 10, reason: 'Card previously disputed' };
        } else {
            factors.volume = { score: 0, reason: 'First dispute on card' };
        }
        riskScore += volumeScore;
        
        // ========== FACTOR 5: CUSTOMER HISTORY / ACCOUNT AGE ==========
        var accountScore = 0;
        var customerGR = new GlideRecord('sys_user');
        customerGR.addQuery('email', dispute.customer_email);
        customerGR.query();
        
        if (customerGR.next()) {
            var accountAge = gs.dateDiff(customerGR.sys_created_on, gs.now(), true) / (1000 * 60 * 60 * 24); // days
            
            if (accountAge < 7) {
                accountScore = 25;
                factors.account = { score: 25, reason: 'Very new account (created < 7 days ago)' };
            } else if (accountAge < 30) {
                accountScore = 15;
                factors.account = { score: 15, reason: 'New account (created < 30 days ago)' };
            } else if (accountAge < 90) {
                accountScore = 5;
                factors.account = { score: 5, reason: 'Relatively new account (< 90 days)' };
            } else {
                factors.account = { score: 0, reason: 'Established account (> 90 days)' };
            }
        } else {
            accountScore = 15;
            factors.account = { score: 15, reason: 'Account not found (possible guest/unregistered)' };
        }
        riskScore += accountScore;
        
        // ========== FACTOR 6: DESCRIPTION ANALYSIS ==========
        var descriptionScore = 0;
        var description = (dispute.dispute_description || '').toLowerCase();
        
        var highRiskKeywords = ['hacked', 'stolen', 'unauthorized', 'someone else', 'account compromised', 'password changed'];
        var suspiciousKeywords = ['don\'t know', 'no idea', 'not sure', 'mysterious'];
        
        var highRiskMatch = 0;
        for (var i = 0; i < highRiskKeywords.length; i++) {
            if (description.indexOf(highRiskKeywords[i]) > -1) {
                highRiskMatch++;
            }
        }
        
        if (highRiskMatch > 2) {
            descriptionScore = 15;
            factors.description = { score: 15, reason: 'Multiple fraud keywords (hacked/stolen)' };
        } else if (highRiskMatch > 0) {
            descriptionScore = 8;
            factors.description = { score: 8, reason: 'Some fraud keywords detected' };
        } else if (description.length < 20) {
            descriptionScore = 10;
            factors.description = { score: 10, reason: 'Very brief description (low effort)' };
        } else {
            factors.description = { score: 0, reason: 'Detailed, specific description' };
        }
        riskScore += descriptionScore;
        
        // ========== CAP AT 100 ==========
        riskScore = Math.min(Math.max(riskScore, 0), 100);
        
        // ========== DETERMINE RISK LEVEL ==========
        var riskLevel = 'Low';
        if (riskScore >= 80) {
            riskLevel = 'Critical';
        } else if (riskScore >= 60) {
            riskLevel = 'High';
        } else if (riskScore >= 40) {
            riskLevel = 'Medium';
        }
        
        return {
            risk_score: riskScore,
            risk_level: riskLevel,
            factors: factors,
            timestamp: gs.now()
        };
    },
    
    /**
     * Log scoring details for audit trail
     */
    logScoring: function(disputeId, scoringResult) {
        var log = new GlideRecord('x_xxxx_giftguard_fraud_score_log');
        log.gift_card_dispute = disputeId;
        log.scoring_time = gs.now();
        log.risk_score = scoringResult.risk_score;
        log.ai_service_used = 'Rule-Based Scoring Engine';
        log.input_factors = JSON.stringify(scoringResult.factors);
        log.reasoning = 'Calculated using 6 factors: Amount, Evidence, Time, Volume, Account Age, Description';
        log.insert();
    }
};

// Export for use in Business Rules
var GiftCardFraudScorerModule = GiftCardFraudScorer;
```

---

## PART 3: OPTIONAL - ABUSEIPDB INTEGRATION

If you want to add external API for extra credit/demonstration:

### 3.1 Setup Instructions

1. **Sign up for free at**: https://www.abuseipdb.com/register
2. **Get API Key**: Dashboard > API tab > Copy your API key
3. **Store in ServiceNow**:
   ```
   System Properties > New Property
   Name: x_xxxx_giftguard.abuseipdb.api_key
   Value: [YOUR_API_KEY]
   ```

### 3.2 Integration Code

**File**: `src/scripts/GiftCardDispute_AbuseIPDB_Integration.script.js`

```javascript
// Script: Gift Card Dispute - AbuseIPDB Integration
// Scope: x_xxxx_giftguard
// Optional: Enhance rule-based scoring with IP reputation

var AbuseIPDBIntegration = {
    
    API_ENDPOINT: 'https://api.abuseipdb.com/api/v2/check',
    
    /**
     * Get API key from System Properties
     */
    getApiKey: function() {
        return gs.getProperty('x_xxxx_giftguard.abuseipdb.api_key', '');
    },
    
    /**
     * Check if IP is known for fraud/abuse
     * Returns: { abuse_score: 0-100, total_reports: int, is_whitelisted: bool }
     */
    checkIPReputation: function(ipAddress) {
        var apiKey = this.getApiKey();
        if (!apiKey) {
            gs.warn('AbuseIPDB API key not configured');
            return { abuse_score: 0, error: 'API key not found' };
        }
        
        try {
            var request = new XMLHttpRequest();
            request.open('GET', 
                this.API_ENDPOINT + '?ipAddress=' + ipAddress + '&maxAgeInDays=90&verbose=true',
                false // Synchronous (required in Business Rules)
            );
            request.setRequestHeader('Key', apiKey);
            request.setRequestHeader('Accept', 'application/json');
            request.send();
            
            if (request.status === 200) {
                var response = JSON.parse(request.responseText);
                if (response.data) {
                    return {
                        abuse_score: response.data.abuseConfidenceScore || 0,
                        total_reports: response.data.totalReports || 0,
                        is_whitelisted: response.data.isWhitelisted || false,
                        last_reported: response.data.lastReportedAt || null
                    };
                }
            } else {
                gs.warn('AbuseIPDB API error: ' + request.status);
            }
        } catch (e) {
            gs.error('Error calling AbuseIPDB: ' + e.message);
        }
        
        return { abuse_score: 0, error: 'API call failed' };
    },
    
    /**
     * Enhance rule-based score with IP reputation
     */
    enhanceScoreWithIP: function(ruleBasedScore, ipAddress) {
        if (!ipAddress) {
            return ruleBasedScore;
        }
        
        var ipReputation = this.checkIPReputation(ipAddress);
        
        if (ipReputation.abuse_score > 50) {
            // IP has been reported for abuse
            ruleBasedScore.risk_score = Math.min(ruleBasedScore.risk_score + 25, 100);
            ruleBasedScore.factors.ip_reputation = {
                score: 25,
                reason: 'IP flagged on AbuseIPDB (score: ' + ipReputation.abuse_score + ')'
            };
        } else if (ipReputation.total_reports > 5) {
            ruleBasedScore.risk_score = Math.min(ruleBasedScore.risk_score + 15, 100);
            ruleBasedScore.factors.ip_reputation = {
                score: 15,
                reason: 'IP has multiple abuse reports'
            };
        }
        
        return ruleBasedScore;
    }
};
```

---

## PART 4: DECISION WORKFLOW LOGIC

### 4.1 Automated Decision Rules

**File**: `src/scripts/GiftCardDispute_DecisionEngine.script.js`

```javascript
// Script: Gift Card Dispute - Automated Decision Engine
// Scope: x_xxxx_giftguard
// Determines if dispute can be auto-approved or requires manual review

var GiftCardDecisionEngine = {
    
    /**
     * Determine if dispute can be auto-approved
     * Returns: { can_auto_approve: bool, reason: string, refund_percentage: 0-100 }
     */
    evaluateDispute: function(dispute) {
        var decision = {
            can_auto_approve: false,
            reason: '',
            refund_percentage: 0,
            requires_manual_review: true
        };
        
        // RULE 1: Very Low Risk + Small Amount = AUTO APPROVE
        if (dispute.risk_score <= 25 && dispute.fraud_amount <= 50) {
            decision.can_auto_approve = true;
            decision.reason = 'Low risk + small amount. Auto-approved.';
            decision.refund_percentage = 100;
            decision.requires_manual_review = false;
            return decision;
        }
        
        // RULE 2: Low Risk + Evidence + Reasonable Amount = AUTO APPROVE
        if (dispute.risk_score <= 35 && dispute.receipt_attachment && dispute.fraud_amount <= 200) {
            decision.can_auto_approve = true;
            decision.reason = 'Low risk + receipt provided + reasonable amount. Auto-approved.';
            decision.refund_percentage = 100;
            decision.requires_manual_review = false;
            return decision;
        }
        
        // RULE 3: Medium Risk + Good Evidence = PARTIAL REFUND (analyst review)
        if (dispute.risk_score <= 50 && dispute.receipt_attachment) {
            decision.can_auto_approve = false;
            decision.reason = 'Medium risk. Requires analyst review. Receipt provided - 80% refund likely.';
            decision.refund_percentage = 80;
            decision.requires_manual_review = true;
            return decision;
        }
        
        // RULE 4: High Risk = ESCALATE TO MANAGER
        if (dispute.risk_score > 75) {
            decision.can_auto_approve = false;
            decision.reason = 'HIGH RISK. Escalate to manager for investigation.';
            decision.refund_percentage = 0; // Pending manager decision
            decision.requires_manual_review = true;
            decision.escalate_to_manager = true;
            return decision;
        }
        
        // RULE 5: No Evidence = DENY (unless other strong indicators)
        if (!dispute.receipt_attachment && dispute.risk_score > 40) {
            decision.can_auto_approve = false;
            decision.reason = 'No evidence provided + medium risk. Requires documentation or dispute will be rejected.';
            decision.refund_percentage = 0;
            decision.requires_manual_review = true;
            decision.request_additional_evidence = true;
            return decision;
        }
        
        // RULE 6: Very Old Dispute = DENY
        var disputeAge = gs.dateDiff(dispute.sys_created_on, gs.now(), true) / (1000 * 60 * 60 * 24);
        if (disputeAge > 180) { // 6 months
            decision.can_auto_approve = false;
            decision.reason = 'Dispute filed too long ago (> 6 months). Outside dispute window.';
            decision.refund_percentage = 0;
            decision.requires_manual_review = false;
            decision.auto_reject = true;
            return decision;
        }
        
        // DEFAULT: Manual review
        decision.can_auto_approve = false;
        decision.reason = 'Standard processing. Requires analyst review.';
        decision.requires_manual_review = true;
        
        return decision;
    },
    
    /**
     * Determine routing/assignment
     */
    getAssignmentQueue: function(dispute) {
        if (dispute.risk_score >= 80) {
            return 'giftguard_manager'; // Manager queue
        } else if (dispute.risk_score >= 60) {
            return 'giftguard_senior_analyst'; // Senior analyst queue
        } else {
            return 'giftguard_analyst'; // General analyst queue
        }
    }
};
```

---

## PART 5: FLOW DESIGNER - DECISION WORKFLOW

**Flow Name**: `GiftCardDispute_DecisionWorkflow`

**Trigger**: Manual (can be triggered by button or scheduled)

**Steps**:

```
[START]
  ↓
[Load Dispute Record]
  ↓
[Call Fraud Scoring Algorithm]
  ↓
[Update dispute.risk_score & risk_level]
  ↓
[Call Decision Engine]
  ↓
[Decision Branch]
  ├─→ [Auto Approve?]
  │    ├─→ YES: Update status='Approved', Send confirmation email
  │    └─→ NO: Continue...
  │
  ├─→ [High Risk?]
  │    ├─→ YES: Assign to Manager, Send urgent notification
  │    └─→ NO: Continue...
  │
  ├─→ [Missing Evidence?]
  │    ├─→ YES: Send request for evidence email
  │    └─→ NO: Continue...
  │
  └─→ [Default: Assign to Analyst]
       ├─→ Find available analyst
       ├─→ Assign to them
       ├─→ Send notification
       └─→ Set SLA reminder
  ↓
[Log Activity]
  ↓
[END]
```

---

## PART 6: SLA & ESCALATION RULES

### 6.1 SLA Policy Matrix

| Risk Level | Fraud Amount | SLA | Escalation | Auto-Approve? |
|---|---|---|---|---|
| Low | < $50 | 10 days | No | ✓ Yes |
| Low | $50-200 | 7 days | No | ✓ Yes (with receipt) |
| Medium | $200-500 | 5 days | If overdue | Manual |
| High | > $500 | 2 days | Immediate to manager | ✗ No |
| Critical | Any | 24 hours | Immediate escalation | ✗ No |

### 6.2 Escalation Trigger Business Rule

**File**: `src/business_rules/GiftCardDispute_SLAEscalation.business_rule.js`

```javascript
// Business Rule: Gift Card Dispute - SLA Escalation
// Table: x_xxxx_giftguard_gift_card_dispute
// When: Scheduled (runs every 6 hours)
// OR: When SLA is approaching

(function executeRule(current, previous) {
    try {
        // Check all disputes with SLA targets
        var disputes = new GlideRecord('x_xxxx_giftguard_gift_card_dispute');
        disputes.addQuery('status', '!=', 'Approved');
        disputes.addQuery('status', '!=', 'Rejected');
        disputes.addQuery('sla_target', '!=', null);
        disputes.query();
        
        while (disputes.next()) {
            var now = gs.now();
            var slaTarget = disputes.sla_target;
            var timeTilSLA = gs.dateDiff(now, slaTarget, true); // milliseconds
            
            // If SLA breached
            if (timeTilSLA < 0) {
                disputes.status = 'SLA_BREACHED';
                disputes.priority = '1'; // Highest priority
                disputes.addComment('SLA deadline passed. Escalating to manager.');
                
                // Find manager
                var manager = new GlideRecord('sys_user');
                manager.addQuery('active', true);
                manager.addQuery('sys_user_role.name', 'giftguard_manager');
                manager.setLimit(1);
                manager.query();
                
                if (manager.next()) {
                    disputes.assigned_analyst = manager.sys_id;
                    
                    // Send alert
                    var notification = new GlideRecord('sys_notification');
                    notification.initialize();
                    notification.recipient = manager.email;
                    notification.subject = 'URGENT: SLA Breached - Dispute ' + disputes.number;
                    notification.message = 'This dispute has exceeded its SLA deadline and requires immediate action.';
                    notification.type = 'email';
                    notification.insert();
                }
                
                disputes.update();
            }
            
            // If SLA approaching (12 hours to go)
            else if (timeTilSLA < 12 * 60 * 60 * 1000) {
                if (!disputes.getDisplayValue('priority').startsWith('2')) { // Not already high priority
                    disputes.priority = '2'; // High priority
                    disputes.update();
                }
            }
        }
        
    } catch (e) {
        gs.error('Error in SLA escalation: ' + e.message);
    }
})(current, previous);
```

---

## PART 7: EMAIL TEMPLATES FOR DECISIONS

### 7.1 Auto-Approval Email

```
Subject: Your Gift Card Fraud Dispute Has Been Approved - {{number}}

Dear {{customer_name}},

Great news! Your gift card fraud dispute has been reviewed and APPROVED.

Dispute Details:
• Dispute ID: {{number}}
• Fraud Amount: ${{fraud_amount}}
• Decision: APPROVED
• Refund Amount: ${{refund_amount}}

Action:
Your refund of ${{refund_amount}} will be processed within 3 business days to your original payment method.

You will receive a confirmation email once the refund is processed.

Thank you for reporting this fraud. We take security seriously.

Best regards,
GiftGuard Fraud Team
Support: fraud-support@giftguard.com
```

### 7.2 Manual Review Required Email (to Analyst)

```
Subject: New Dispute Requires Review - {{number}} [Risk: {{risk_level}}]

Hi {{assigned_analyst.name}},

A new gift card fraud dispute has been assigned to you for review.

Dispute Summary:
• Customer: {{customer_name}}
• Card Issuer: {{gift_card_issuer}}
• Fraud Amount: ${{fraud_amount}}
• Risk Score: {{risk_score}}/100
• Risk Level: {{risk_level}}

Evidence:
• Attached: {{receipt_attachment}}
• Evidence Type: {{evidence_type}}

Customer Description:
{{dispute_description}}

Action Required:
Review the dispute and decide: Approve, Reject, or Escalate
SLA Target: {{sla_target}} (5 business days)

Link: [https://your-instance.service-now.com/x_xxxx_giftguard_gift_card_dispute.do?sys_id={{sys_id}}]

---
Fraud Risk Factors:
{{factor_amount.reason}}
{{factor_evidence.reason}}
{{factor_volume.reason}}
```

### 7.3 Rejection Email

```
Subject: Gift Card Dispute Decision - {{number}}

Dear {{customer_name}},

We have reviewed your gift card fraud dispute. Unfortunately, we cannot approve your claim at this time.

Reason for Rejection:
{{decision_reason}}

What You Can Do:
1. If you have additional evidence, reply to this email
2. You have 30 days to appeal this decision
3. Contact our support team for more information

Appeal Process:
To appeal, please reply to this email with additional documentation.

Thank you,
GiftGuard Fraud Team
```

---

## PART 8: TESTING SCENARIOS

### Scenario 1: Low Risk Auto-Approval
```
Customer: Jane Doe
Card: Visa ****1234
Fraud Amount: $25
Evidence: Receipt (PDF)
Risk Score: 18 (Low)
Expected: AUTO-APPROVED immediately
Email: Sent to Jane with confirmation
Analyst: No manual review needed
```

### Scenario 2: High Risk Escalation
```
Customer: New account (3 days old)
Card: MasterCard ****5678
Fraud Amount: $750
Evidence: Screenshot only
Risk Score: 78 (High)
Expected: Escalated to manager
Email: Urgent notification to manager
Analyst: Requires manager decision
SLA: 2 business days
```

### Scenario 3: Missing Evidence Request
```
Customer: Bob Smith
Card: AmEx ****9999
Fraud Amount: $300
Evidence: None
Risk Score: 52 (Medium)
Expected: Request additional evidence
Email: Sent to Bob asking for receipt
Status: Awaiting Documentation
Analyst: Assigned with hold status
```

---

## PART 9: INTEGRATION CHECKLIST

- [ ] Implement GiftCardFraudScorer module
- [ ] Add fraud scoring Business Rule (uses module)
- [ ] Implement GiftCardDecisionEngine module
- [ ] Create Decision Workflow in Flow Designer
- [ ] Test with sample disputes
- [ ] Optional: Setup AbuseIPDB API integration
- [ ] Create SLA escalation scheduled job
- [ ] Test email notifications
- [ ] Verify role-based access control

---

## PART 10: DEBUGGING & MONITORING

### View Fraud Scoring Logs
```
Table: x_xxxx_giftguard_fraud_score_log
Filter: gift_card_dispute = [dispute ID]
Shows: All factors, scores, reasoning
```

### Check Business Rule Execution
```
System Admin > System Log
Filter: Table = x_xxxx_giftguard_gift_card_dispute
Shows: All BR triggers, timestamps
```

### Monitor SLA Status
```
Service Portal > Incident Dashboard (or custom)
Shows: Disputes by SLA status
Alerts: Red for breached, Yellow for approaching
```

---

**Next**: Deploy to your instance and test with sample data.
