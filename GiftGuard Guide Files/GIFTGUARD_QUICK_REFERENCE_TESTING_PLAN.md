# GiftGuard: Quick Reference Guide & Testing Plan
## For Team 33 Implementation

---

## QUICK START (TLDR)

### What to Build (in order)

1. **Tables** (Day 1)
   - Gift Card Dispute table
   - Balance Check History table
   - Fraud Scoring Log table

2. **Business Rules** (Day 1-2)
   - On Insert: Calculate risk score
   - Before Insert: Mask card number
   - On Update: Auto-escalate

3. **Client Scripts** (Day 2-3)
   - Form validation
   - Balance checker
   - Attachment handler

4. **Flow Designer** (Day 3)
   - Intake workflow (trigger on new dispute)
   - Routes to analyst based on risk

5. **Notifications** (Day 3-4)
   - Dispute received (to customer)
   - Status updates
   - Manager alerts

6. **UI Actions** (Day 4)
   - Approve
   - Reject
   - Escalate

7. **Service Portal** (Day 4-5)
   - Dispute intake form

8. **Roles & Access** (Day 5)
   - Create roles
   - Set access rules

---

## KEY FILES TO CREATE

```
src/
├── tables/
│   ├── x_xxxx_giftguard_gift_card_dispute.table.json          [3 pages of JSON]
│   ├── x_xxxx_giftguard_balance_check.table.json               [2 pages]
│   └── x_xxxx_giftguard_fraud_score_log.table.json             [2 pages]
│
├── business_rules/
│   ├── GiftCardDispute_OnInsert_CalculateRisk.business_rule.js [Copy from doc]
│   ├── GiftCardDispute_BeforeInsert_MaskCard.business_rule.js  [2 pages]
│   └── GiftCardDispute_OnUpdate_AutoEscalate.business_rule.js  [2 pages]
│
├── client_scripts/
│   ├── GiftCardDispute_FormValidation.client.js                [2 pages]
│   └── GiftCardDispute_BalanceChecker.client.js                [2 pages]
│
├── ui_actions/
│   ├── GiftCardDispute_ApproveDispute.ui_action.js             [2 pages]
│   ├── GiftCardDispute_RejectDispute.ui_action.js              [2 pages]
│   └── GiftCardDispute_EscalateDispute.ui_action.js            [2 pages]
│
├── notifications/
│   ├── GiftCardDispute_Received.notification.json              [1 page]
│   └── GiftCardDispute_StatusUpdated.notification.json         [1 page]
│
├── scripts/
│   └── GiftCardFraudScorer.script.js                            [3 pages - REUSABLE MODULE]
│
└── flows/
    └── GiftCardDispute_IntakeWorkflow.flow.json                 [XML/JSON from Flow Designer]
```

---

## FRAUD SCORING QUICK REFERENCE

**Total Possible Points: 100**

| Factor | Points | Threshold |
|---|---|---|
| **Amount** | 0-35 | $1000+ = 35 pts |
| **Evidence** | 0-30 | No evidence = 30 pts |
| **Time** | 0-12 | Late night (11 PM-5 AM) = 12 pts |
| **Volume** | 0-30 | 5+ disputes/month = 30 pts |
| **Account Age** | 0-25 | < 7 days old = 25 pts |
| **Description** | 0-15 | Vague + fraud keywords = 15 pts |

**Risk Levels:**
- **0-39**: Low (can auto-approve if receipt)
- **40-59**: Medium (analyst review)
- **60-79**: High (senior analyst + manager)
- **80-100**: Critical (immediate escalation)

---

## SERVICENOW ROLES TO CREATE

```sql
INSERT INTO sys_user_role VALUES
('giftguard_customer', 'Can submit disputes, view own status'),
('giftguard_analyst', 'Can review/approve/reject disputes'),
('giftguard_manager', 'Can escalate, override, approve high-risk'),
('giftguard_admin', 'Full access, configure app');
```

---

## DECISION TREE (Analyst Guide)

```
┌─ START: New Dispute Assigned
│
├─ Is Risk Score < 40?
│   ├─ YES + Has Receipt? → AUTO-APPROVE ✓ (Send confirmation email)
│   └─ NO: Continue...
│
├─ Is Risk Score 40-60?
│   ├─ Has good evidence? → APPROVE (80% refund)
│   ├─ Missing evidence? → REQUEST MORE DOCUMENTATION
│   └─ Suspicious description? → ESCALATE to manager
│
├─ Is Risk Score 60-80?
│   ├─ High amount (>$500)? → ESCALATE to manager (2-day SLA)
│   └─ Low amount (<$200)? → PARTIAL APPROVAL (60% refund, with comment)
│
├─ Is Risk Score > 80?
│   └─ ESCALATE to manager IMMEDIATELY (24-hour SLA) ✗
│
└─ END: Update status, send email to customer
```

---

## EMAIL WORKFLOW SUMMARY

```
Customer submits dispute
    ↓ [Notification 1]
Customer receives: "Thanks for reporting. We'll review within 5 days."
    ↓ [Business Rule triggers]
Risk score calculated, Analyst assigned
    ↓ [Notification 2]
Analyst receives: "New dispute. Risk: HIGH. Assign yourself."
    ↓ [Analyst action]
Analyst clicks APPROVE or REJECT
    ↓ [Business Rule updates]
Decision logged, Refund amount set
    ↓ [Notification 3]
Customer receives: "Approved. $XXX will be refunded by DATE"
    ↓
END: Dispute closed
```

---

## TESTING CHECKLIST

### Phase 1: Table Creation
- [ ] Create Gift Card Dispute table
  - [ ] Fields appear in form
  - [ ] Auto-numbering works (GCD0001)
  - [ ] Validation rules enforced
- [ ] Create Balance Check History
  - [ ] Links to Dispute
- [ ] Create Fraud Scoring Log
  - [ ] Links to Dispute

### Phase 2: Business Rules
- [ ] On Insert rule triggers
  - [ ] Risk score calculated correctly
  - [ ] Gift card number masked
  - [ ] SLA date set to 5 days out
- [ ] On Update rule works
  - [ ] High risk (>75) auto-escalates
  - [ ] Manager notification sent
- [ ] Before Insert rule masks card
  - [ ] Only last 4 digits visible

### Phase 3: Client Scripts
- [ ] Form validation works
  - [ ] Email format checked
  - [ ] Phone format checked
  - [ ] Card number format checked
- [ ] Required fields enforced
  - [ ] Can't submit without all fields
- [ ] Balance checker button works
  - [ ] Calls API
  - [ ] Updates balance field

### Phase 4: Flow Designer
- [ ] Flow triggers on new dispute
- [ ] Risk score passed to flow
- [ ] Correct analyst queue selected
- [ ] Notifications sent
- [ ] SLA reminder set

### Phase 5: Notifications
- [ ] Dispute received email sent to customer
- [ ] Analyst notification sent on assignment
- [ ] Status update email sent on decision
- [ ] Manager urgent alert sent on escalation
- [ ] Emails contain correct data (not blank)

### Phase 6: UI Actions
- [ ] Approve button works
  - [ ] Status changes to "Approved"
  - [ ] Email sent to customer
  - [ ] Refund date set
- [ ] Reject button works
  - [ ] Status changes to "Rejected"
  - [ ] Reason captured
  - [ ] Email sent
- [ ] Escalate button works
  - [ ] Assigns to manager
  - [ ] Urgent email sent

### Phase 7: Service Portal
- [ ] Portal form loads
- [ ] All fields visible and required
- [ ] Can upload attachment
- [ ] Form submission works
- [ ] Record created in backend
- [ ] Confirmation page appears

### Phase 8: Access Control
- [ ] Customer can only see own disputes
- [ ] Analyst can see assigned disputes
- [ ] Manager can see high-risk disputes
- [ ] Admin can see all

### Phase 9: End-to-End
- [ ] Customer submits dispute via portal
- [ ] Record created, risk calculated
- [ ] Analyst assigned
- [ ] Analyst receives notification
- [ ] Analyst clicks Approve
- [ ] Customer receives confirmation
- [ ] Refund tracked in system

---

## TEST DATA SETS

### Test Case 1: Low Risk Auto-Approval
```
Name: Alice Johnson
Email: alice@example.com
Card: Visa 4111111111111111
Issuer: Target
Expected Balance: $100
Reported Balance: $75
Fraud Amount: $25
Evidence: Receipt (PDF)
Description: "I noticed I had $75 left when I checked my balance."
Expected Outcome: Auto-approved (Risk Score: ~15)
SLA: 10 days
```

### Test Case 2: High Risk Escalation
```
Name: Bob Smith
Email: bob@example.com
Card: MasterCard 5555555555554444
Issuer: Amazon
Account Age: 2 days (NEW)
Expected Balance: $1000
Reported Balance: $50
Fraud Amount: $950
Evidence: None
Description: "Someone hacked my card. I have no proof."
Expected Outcome: Escalate to manager (Risk Score: ~82)
SLA: 2 days
```

### Test Case 3: Medium Risk - Request Evidence
```
Name: Carol Davis
Email: carol@example.com
Card: Amex 378282246310005
Issuer: Best Buy
Expected Balance: $300
Reported Balance: $100
Fraud Amount: $200
Evidence: Screenshot only
Description: "I used this at the store and now it's empty."
Expected Outcome: Request documentation (Risk Score: ~50)
SLA: 5 days
```

### Test Case 4: Critical Risk - Multiple Disputes
```
Name: David Wilson (existing customer)
Email: david@example.com
Card: Discover 6011111111111117
Issuer: Walmart
Dispute #: 5th dispute in 2 weeks on same card
Expected Balance: $500
Reported Balance: $0
Fraud Amount: $500
Evidence: None
Description: "Card keeps being drained"
Expected Outcome: Critical escalation (Risk Score: ~95)
SLA: 24 hours
```

---

## DEPLOYMENT STEPS

### Step 1: Prepare Instance
```
1. Log into dev instance as admin
2. Go to System Scope > Search for x_xxxx_giftguard (if exists)
3. If NOT exists: Create new scoped app "GiftGuard"
```

### Step 2: Create Tables
```
1. System Definition > Tables
2. Import/Create the 3 JSON table definitions
3. Verify fields appear in forms
```

### Step 3: Create Business Rules
```
1. System Workflow > Business Rules
2. Copy code from GIFTGUARD_CODE_IMPLEMENTATION.md
3. For each rule:
   - Set Table: x_xxxx_giftguard_gift_card_dispute
   - Set When: Before/After insert/update
   - Paste code
   - Test with sample record
```

### Step 4: Create Client Scripts
```
1. System Definition > Client Scripts
2. Copy code, paste into form script editor
3. For each script:
   - Set Table: x_xxxx_giftguard_gift_card_dispute
   - Set Type: onLoad, onChange, onSubmit
   - Test in form
```

### Step 5: Create Flow Designer Workflow
```
1. Process Automation > Flow Designer
2. Create new flow: "Gift Card Dispute Intake"
3. Add steps from GIFTGUARD_FRAUD_API_DECISION_WORKFLOW.md
4. Trigger: When record created
5. Save and activate
```

### Step 6: Create Notifications
```
1. System Notification > Notification
2. Create 4 notifications (see GIFTGUARD_CODE_IMPLEMENTATION.md)
3. Test send
```

### Step 7: Create UI Actions
```
1. System UI > UI Action
2. For each action (Approve, Reject, Escalate):
   - Copy code
   - Set Table: x_xxxx_giftguard_gift_card_dispute
   - Set Condition (e.g., status = 'New')
   - Save
```

### Step 8: Create Service Portal
```
1. Service Portal > Portals
2. Create new portal: "Gift Card Fraud Intake"
3. Create form widget referencing x_xxxx_giftguard_gift_card_dispute
4. Configure fields
5. Test submission
```

### Step 9: Create Roles
```
1. System Security > Roles
2. Create: giftguard_customer, giftguard_analyst, giftguard_manager, giftguard_admin
3. Assign test users to roles
```

### Step 10: Package Update Set
```
1. System Update Sets > Local Update Sets
2. Create new
3. Select all components (tables, rules, scripts, etc.)
4. Export as XML
5. Keep for deployment to prod
```

---

## COMMON ISSUES & FIXES

### Issue: Business Rule doesn't trigger
**Solution**: 
- Check "Active" checkbox
- Verify table name matches exactly
- Check "Run" conditions (should be "All")
- Look at System Log for errors

### Issue: Email not sent
**Solution**:
- Check Notification is Active
- Verify recipient field has email
- Go to System Notification > Email Log and check
- Check outbound email server configured

### Issue: Client Script errors
**Solution**:
- Open form in inspect mode (Ctrl+Shift+I)
- Check browser console for JS errors
- Try simpler validation first
- Use `console.log()` for debugging

### Issue: Flow doesn't execute
**Solution**:
- Check Flow is Activated
- Verify trigger conditions
- Go to Flow Execution History and check
- Add debug logging to flow

### Issue: Risk score always 0
**Solution**:
- Verify fraud_amount is calculated
- Check Business Rule is running (see System Log)
- Test with sample data that has fraud_amount > 0
- Verify all risk factors are non-zero

---

## TEAM RESPONSIBILITIES

### Korblox (Lead)
- [ ] Overall architecture & coordination
- [ ] Tables & data model
- [ ] Business Rules
- [ ] Update Set packaging

### Kyle
- [ ] Client Scripts
- [ ] Service Portal forms
- [ ] Form validation testing

### Rudyard
- [ ] UI Actions
- [ ] Flow Designer workflow
- [ ] Notifications

### Sharaine
- [ ] Access Control & Roles
- [ ] Test data creation
- [ ] End-to-end testing

### Lyndon
- [ ] Documentation
- [ ] Integration Hub setup (if using external API)
- [ ] Deployment checklist

---

## PRESENTATION OUTLINE (10 minutes)

**Opening (1 min)**
- Problem: Gift card fraud going unreported
- Solution: GiftGuard automated intake & decision system

**Architecture (2 min)**
- 3 custom tables (Dispute, Balance History, Score Log)
- Fraud risk scoring algorithm (6 factors)
- Decision engine (auto-approve / escalate logic)

**Demo (5 min)**
1. Customer submits dispute via portal
2. Risk calculated automatically
3. Analyst receives assignment email
4. Analyst clicks "Approve"
5. Customer gets refund confirmation

**Components Used (1.5 min)**
- ✓ Client Scripts (validation, balance checker)
- ✓ Business Rules (scoring, auto-escalate)
- ✓ UI Actions (approve, reject, escalate)
- ✓ Notifications (email workflow)
- ✓ Integration Hub (fraud detection API)
- ✓ Flow Designer (intake workflow)
- ✓ Service Portal (customer form)
- ✓ Access Roles (customer, analyst, manager)

**Results (0.5 min)**
- Dispute resolution time: 5 days average
- Fraud detection accuracy: 85%+
- Customer satisfaction: Automated confirmation

---

## SUCCESS METRICS

By the end of the capstone, you should have:

- ✓ **3 custom tables** created and working
- ✓ **3 business rules** triggering correctly
- ✓ **2 client scripts** with validation
- ✓ **4 UI actions** (approve, reject, escalate, check balance)
- ✓ **4 notifications** (received, status, approval, urgent)
- ✓ **1 Flow Designer workflow** executing end-to-end
- ✓ **1 Service Portal** form accepting disputes
- ✓ **4 roles** with access control
- ✓ **1 Update Set** packaged and ready to deploy
- ✓ **100% of test cases** passing
- ✓ **5-minute demo** working smoothly

---

## EXTRA CREDIT OPTIONS

1. **AI Integration**: Add AbuseIPDB API for IP reputation checking
2. **Analytics Dashboard**: Create visualization of fraud trends
3. **Mobile App**: Build ServiceNow Now Mobile app for analysts
4. **Reporting**: Automated monthly fraud report
5. **Integration**: Connect to payment gateway for instant refunds
6. **Multi-language**: Localize Service Portal for international customers

---

**Last Updated**: April 17, 2026
**Status**: Ready for Team 33 Implementation
**Next Step**: Start with tables on Day 1

Good luck! 🚀
