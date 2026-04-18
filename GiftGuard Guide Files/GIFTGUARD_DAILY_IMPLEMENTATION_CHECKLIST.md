# GiftGuard: Daily Implementation Checklist
## 30-Day Build Plan — Team 33 (CSIT440 Capstone)

> **How to use this**: Print this document OR keep it open while working.
> Check off each box as you complete it. If you are blocked, note it in the "Blockers" section at the bottom for the next standup.

---

## PRE-START SETUP (Before Day 1)

- [ ] All team members have access to ServiceNow PDI (`https://developer.servicenow.com`)
- [ ] All team members have joined the shared GitHub repository
- [ ] All team members have read `START_HERE.md`
- [ ] Team has scheduled a recurring daily standup (15 min, same time every day)
- [ ] Korblox has been confirmed as lead/architect
- [ ] All team members know their assigned role (see team assignments below)

---

## ═══════════════════════════════════
## WEEK 1: FOUNDATION & ARCHITECTURE
## Days 1–5
## ═══════════════════════════════════

---

### DAY 1 — Scoped App Setup & First Table
**Owner**: Korblox + All Team Members
**Goal**: ServiceNow app exists, first table created

#### Korblox Tasks
- [ ] Log into ServiceNow PDI (`https://developer.servicenow.com/dev.do`)
- [ ] Navigate to: **System Applications > Studio**
- [ ] Click **Create Application**
- [ ] Set name: `GiftGuard`
- [ ] Set scope prefix: note the auto-generated prefix (e.g., `x_12345_giftguard`)
- [ ] Write down your scope prefix — you'll need it for all table names
- [ ] Navigate to **System Update Sets > Local Update Sets**
- [ ] Create new Update Set named: `GiftGuard_v1.0`
- [ ] Set Update Set as **Current**
- [ ] Create table: `Gift Card Dispute` (see GIFTGUARD_ARCHITECTURE.md Section 3.1)
  - [ ] Add all fields from the table definition
  - [ ] Set auto-numbering prefix to `GCD`
  - [ ] Verify form layout in Studio

#### All Team Members (Parallel)
- [ ] Read `GIFTGUARD_COMPLETE_SOLUTION_SUMMARY.md` (15 min)
- [ ] Read `GIFTGUARD_ARCHITECTURE.md` Sections 1–4 (20 min)
- [ ] Clone GitHub repository to local machine
- [ ] Create `feature/week1-setup` branch

#### Day 1 End-of-Day Check
- [ ] Scoped application `x_xxxx_giftguard` exists in PDI
- [ ] Update Set `GiftGuard_v1.0` is active
- [ ] Gift Card Dispute table has at least 10 fields
- [ ] Team has met for kickoff

---

### DAY 2 — Remaining Tables + Data Model
**Owner**: Korblox
**Goal**: All 3 custom tables created with all fields

#### Korblox Tasks
- [ ] Create table: `Balance Check History` (see GIFTGUARD_ARCHITECTURE.md Section 3.2)
  - [ ] Add all fields
  - [ ] Set Reference field `gift_card_dispute` → links to Dispute table
  - [ ] Set auto-numbering prefix to `BCH`
- [ ] Create table: `Fraud Scoring Log` (see GIFTGUARD_ARCHITECTURE.md Section 3.3)
  - [ ] Add all fields
  - [ ] Set Reference field `gift_card_dispute` → links to Dispute table
  - [ ] Set auto-numbering prefix to `FSL`
- [ ] Verify all reference fields link correctly between tables
- [ ] Create 4 roles:
  - [ ] `giftguard_customer`
  - [ ] `giftguard_analyst`
  - [ ] `giftguard_manager`
  - [ ] `giftguard_admin`
- [ ] Commit table JSON definitions to GitHub (branch: `feature/tables`)

#### Kyle Tasks (Parallel)
- [ ] Read `GIFTGUARD_CODE_IMPLEMENTATION.md` — Part 3 (Client Scripts)
- [ ] Map out which fields the Service Portal form needs
- [ ] Sketch the portal form layout (wireframe or notes)

#### Sharaine Tasks (Parallel)
- [ ] Read `GIFTGUARD_QUICK_REFERENCE_TESTING_PLAN.md`
- [ ] Prepare Test Case 1 (Low Risk) data for Day 5 testing
- [ ] Prepare Test Case 2 (High Risk) data for Day 5 testing

#### Day 2 End-of-Day Check
- [ ] All 3 tables created with all fields
- [ ] Reference relationships between tables work
- [ ] 4 roles exist in the system
- [ ] Tables committed to GitHub

---

### DAY 3 — Architecture Review & Planning
**Owner**: All Team Members
**Goal**: Every team member understands the system design

#### Team Meeting (1 hour)
- [ ] Korblox explains the 3 tables and how they relate
- [ ] Korblox explains the 6-factor fraud scoring algorithm
- [ ] Rudyard reviews the Flow Designer workflow steps (FRAUD_API_DECISION_WORKFLOW.md)
- [ ] Kyle demos the Service Portal wireframe
- [ ] Sharaine presents test case scenarios
- [ ] Lyndon reviews GitHub repo structure
- [ ] Q&A — resolve any confusion NOW before coding starts

#### Individual Tasks
**Korblox:**
- [ ] Review `GIFTGUARD_CODE_IMPLEMENTATION.md` Part 2 (Business Rules)
- [ ] Prepare to copy-paste the On Insert Business Rule tomorrow

**Kyle:**
- [ ] Review Client Script code in `GIFTGUARD_CODE_IMPLEMENTATION.md` Part 3
- [ ] Understand `onLoad`, `onChange`, `onSubmit` script types

**Rudyard:**
- [ ] Read `GIFTGUARD_FRAUD_API_DECISION_WORKFLOW.md` fully
- [ ] Understand Flow Designer step sequence
- [ ] Read UI Action code in `GIFTGUARD_CODE_IMPLEMENTATION.md` Part 4

**Sharaine:**
- [ ] Create 3 test user accounts in ServiceNow PDI
- [ ] Assign roles to test users (one per role)

**Lyndon:**
- [ ] Set up GitHub repo structure (see `GIFTGUARD_REPO_STRUCTURE.md`)
- [ ] Create main branches: `main`, `develop`, feature branches
- [ ] Add README.md to repo root

#### Day 3 End-of-Day Check
- [ ] All team members understand what they are building
- [ ] GitHub repo has correct folder structure
- [ ] Test users created in ServiceNow

---

### DAY 4 — Prep & Research Day
**Owner**: All (Individual Prep)
**Goal**: Everyone is ready to build their components

#### All Team Members
- [ ] Re-read your assigned code sections
- [ ] Copy relevant code snippets from `GIFTGUARD_CODE_IMPLEMENTATION.md`
- [ ] Note any questions before Day 5

#### Korblox
- [ ] Review Script Include pattern for fraud scorer
- [ ] Understand `GlideRecord` API for checking existing disputes
- [ ] Plan which Business Rule runs BEFORE insert vs AFTER

#### Kyle
- [ ] Review ServiceNow Client Script `g_form` API
- [ ] Understand `g_form.getValue()`, `g_form.setValue()`, `g_form.showFieldMsg()`
- [ ] Look at Service Portal Widget code structure

#### Rudyard
- [ ] Open Flow Designer in PDI and explore interface
- [ ] Review Notification template syntax (Subject, Body, Recipients)
- [ ] Understand UI Action `action.setRedirectURL()` pattern

#### Sharaine
- [ ] Review ACL (Access Control List) creation in ServiceNow
- [ ] Plan which ACL rules each role needs (read/write/delete)

#### Lyndon
- [ ] Set up Integration Hub in PDI:
  - [ ] Navigate to: **Integration Hub > Connections & Credentials**
  - [ ] Explore REST Message creation
  - [ ] Review AbuseIPDB API documentation

#### Day 4 End-of-Day Check
- [ ] All team members have their code sections ready to implement
- [ ] Questions from Week 1 resolved

---

### DAY 5 — Week 1 Wrap-Up & Initial Test
**Owner**: All Team
**Goal**: Verify tables work, plan for Week 2

#### Korblox
- [ ] Create a test record in Gift Card Dispute table manually
- [ ] Verify all fields save correctly
- [ ] Verify auto-numbering generates `GCD0001`
- [ ] Export current Update Set (backup)

#### Sharaine
- [ ] Log in as `giftguard_customer` test user
- [ ] Attempt to view Gift Card Dispute list
- [ ] Verify access is restricted by role

#### Lyndon
- [ ] Commit all work to GitHub `develop` branch
- [ ] Write Week 1 progress update in GitHub README
- [ ] Verify all team members can pull the repo

#### Team Standup/Review
- [ ] Korblox demos the 3 tables in ServiceNow
- [ ] Review what's done vs what's planned
- [ ] Set goals for Week 2
- [ ] Resolve any blockers

#### Week 1 Deliverable Check
- [ ] ✅ 3 custom tables created with all fields
- [ ] ✅ 4 roles created in ServiceNow
- [ ] ✅ Update Set active and tracking changes
- [ ] ✅ GitHub repo set up with correct structure
- [ ] ✅ Test users created for each role

---

## ═══════════════════════════════════
## WEEK 2: BUSINESS LOGIC
## Days 6–10
## ═══════════════════════════════════

---

### DAY 6 — Business Rule 1: Risk Score Calculator
**Owner**: Korblox
**Goal**: Risk score is automatically calculated when a dispute is created

#### Implementation Steps
- [ ] Navigate to: **System Workflow > Business Rules > New**
- [ ] Settings:
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - Name: `GiftCard Dispute - On Insert - Calculate Risk`
  - When: `after`
  - Insert: `checked`
  - Update: `unchecked`
  - Active: `checked`
- [ ] Copy the Business Rule code from `GIFTGUARD_CODE_IMPLEMENTATION.md` (Part 2, Rule 1)
- [ ] Paste into the Script field
- [ ] Save the rule
- [ ] Test: Create a new dispute record
  - [ ] Verify `risk_score` field is populated after save
  - [ ] Verify `risk_level` is set (Low/Medium/High/Critical)
  - [ ] Open System Log to confirm no errors

#### Verification
- [ ] Test with fraud_amount = $25 → risk_score < 40 → risk_level = "Low"
- [ ] Test with fraud_amount = $600 → risk_score > 60 → risk_level = "High"
- [ ] Check System Log (System Log > All) for errors after each test

---

### DAY 7 — Business Rule 2: Card Number Masking
**Owner**: Korblox
**Goal**: Gift card number is masked to last 4 digits on save

#### Implementation Steps
- [ ] Navigate to: **System Workflow > Business Rules > New**
- [ ] Settings:
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - Name: `GiftCard Dispute - Before Insert - Mask Card Number`
  - When: `before`
  - Insert: `checked`
  - Update: `unchecked`
  - Active: `checked`
- [ ] Copy code from `GIFTGUARD_CODE_IMPLEMENTATION.md` (Part 2, Rule 2)
- [ ] Test: Create record with card number `4111111111111111`
  - [ ] After save: field should show `****-****-****-1111`

---

### DAY 8 — Business Rule 3: Auto-Escalation
**Owner**: Korblox
**Goal**: High-risk disputes are automatically escalated when risk score changes

#### Implementation Steps
- [ ] Navigate to: **System Workflow > Business Rules > New**
- [ ] Settings:
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - Name: `GiftCard Dispute - On Update - Auto Escalate`
  - When: `after`
  - Insert: `unchecked`
  - Update: `checked`
  - Filter Condition: `risk_score changes AND risk_score >= 75`
  - Active: `checked`
- [ ] Copy code from `GIFTGUARD_CODE_IMPLEMENTATION.md` (Part 2, Rule 3)
- [ ] Test: Manually change a dispute's risk_score to 80
  - [ ] Verify `risk_level` changes to "Critical"
  - [ ] Verify `status` changes to "Escalated"

---

### DAY 9 — Script Include: Fraud Scorer Module
**Owner**: Korblox
**Goal**: Reusable fraud scoring module as a Script Include

#### Why a Script Include?
Script Includes can be called from Business Rules, Flow Designer, and UI Actions. This makes the scoring logic centralized and reusable.

#### Implementation Steps
- [ ] Navigate to: **System Workflow > Script Includes > New**
- [ ] Settings:
  - Name: `GiftCardFraudScorer`
  - API Name: `x_xxxx_giftguard.GiftCardFraudScorer`
  - Accessible From: `All application scopes`
  - Active: `checked`
- [ ] Copy the full Script Include from `GIFTGUARD_CODE_IMPLEMENTATION.md`
- [ ] Update Business Rule 1 (Day 6) to CALL the Script Include instead of inline code
  - This makes the code cleaner and more maintainable

#### Verification
- [ ] Create a new dispute → risk score calculated using Script Include
- [ ] Look at System Log to confirm Script Include was invoked

---

### DAY 10 — Business Rule 4: SLA Date Setting + Week 2 Testing
**Owner**: Korblox + Sharaine
**Goal**: SLA target date set on insert + all business rules pass testing

#### Korblox: Business Rule 4
- [ ] Add SLA date calculation to the On Insert Business Rule:
  - Low risk: SLA = 5 business days from now
  - Medium risk: SLA = 3 business days
  - High risk: SLA = 2 business days
  - Critical: SLA = 1 business day (24 hours)
- [ ] Use `gs.daysAgo(-5)` pattern for date calculation

#### Sharaine: Business Rule Testing
- [ ] Run Test Case 1 (Low Risk — Alice Johnson, $25 dispute, has receipt)
  - [ ] Expected risk_score: ~15 (Low)
  - [ ] Expected SLA: 5 days out
  - [ ] Expected card masking: only last 4 visible
- [ ] Run Test Case 2 (High Risk — Bob Smith, $950 dispute, no evidence)
  - [ ] Expected risk_score: ~82 (Critical)
  - [ ] Expected auto-escalation triggered
  - [ ] Expected SLA: 24 hours
- [ ] Document results in GitHub (Passed/Failed/Issue)

#### Week 2 Deliverable Check
- [ ] ✅ 4 Business Rules created and working
- [ ] ✅ Script Include `GiftCardFraudScorer` created
- [ ] ✅ Risk score calculated correctly for all test cases
- [ ] ✅ Card number masked to last 4 digits
- [ ] ✅ SLA date set based on risk level
- [ ] ✅ High-risk disputes auto-escalated

---

## ═══════════════════════════════════
## WEEK 3: CLIENT SCRIPTS & UI ACTIONS
## Days 11–15
## ═══════════════════════════════════

---

### DAY 11 — Client Script 1: Form Validation
**Owner**: Kyle
**Goal**: Form validates email, phone, card number format before submit

#### Implementation Steps
- [ ] Navigate to: **System Definition > Client Scripts > New**
- [ ] Settings:
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - Name: `GiftCard Dispute - Form Validation`
  - Type: `onSubmit`
  - Active: `checked`
- [ ] Copy code from `GIFTGUARD_CODE_IMPLEMENTATION.md` (Part 3, Script 1)
- [ ] Test in ServiceNow form:
  - [ ] Submit with invalid email → should show error
  - [ ] Submit with empty required fields → should block submit
  - [ ] Submit with valid data → should allow submit

---

### DAY 12 — Client Script 2: Balance Checker
**Owner**: Kyle
**Goal**: "Check Balance" button fetches current balance via Integration Hub

#### Implementation Steps
- [ ] Navigate to: **System Definition > Client Scripts > New**
- [ ] Settings:
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - Name: `GiftCard Dispute - Balance Checker`
  - Type: `onLoad`
  - Active: `checked`
- [ ] Copy code from `GIFTGUARD_CODE_IMPLEMENTATION.md` (Part 3, Script 2)
- [ ] This script adds an "Check Balance" button and calls the server via `GlideAjax`
- [ ] Test: Load a dispute form → button appears → clicking it updates the balance field

---

### DAY 13 — UI Actions: Approve & Reject
**Owner**: Rudyard
**Goal**: Approve and Reject buttons work on the dispute form

#### UI Action 1: Approve Dispute
- [ ] Navigate to: **System UI > UI Actions > New**
- [ ] Settings:
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - Name: `Approve Dispute`
  - Action name: `approveDispute`
  - Form button: `checked`
  - Condition: `current.status == 'new' || current.status == 'under_review'`
  - Active: `checked`
- [ ] Copy code from `GIFTGUARD_CODE_IMPLEMENTATION.md` (Part 4, UI Action 1)
- [ ] Test: Open a dispute → click Approve → status changes to "Approved"

#### UI Action 2: Reject Dispute
- [ ] Create similarly with code from Part 4, UI Action 2
- [ ] Test: Click Reject → status changes to "Rejected" → reason field required

---

### DAY 14 — UI Actions: Escalate & Check Balance
**Owner**: Rudyard
**Goal**: Escalate and Check Balance buttons work

#### UI Action 3: Escalate Dispute
- [ ] Create with code from `GIFTGUARD_CODE_IMPLEMENTATION.md` Part 4, UI Action 3
- [ ] Condition: Only visible when `risk_level == 'High' || risk_level == 'Critical'`
- [ ] Action: Set status = "Escalated", assign to manager queue

#### UI Action 4: Check Balance Now
- [ ] Create with code from `GIFTGUARD_CODE_IMPLEMENTATION.md` Part 4, UI Action 4
- [ ] Calls the Integration Hub REST action to fetch live balance
- [ ] Creates a new Balance Check History record
- [ ] Updates `reported_balance` field on the dispute

#### Day 14 Verification
- [ ] All 4 UI Actions visible on dispute form
- [ ] Each button performs its correct action
- [ ] No JavaScript or server errors in logs

---

### DAY 15 — Week 3 Testing + Client Script Refinements
**Owner**: Kyle + Sharaine
**Goal**: All client scripts and UI actions pass testing

#### Kyle: Test All Client Scripts
- [ ] Test form validation with invalid email → blocked
- [ ] Test form validation with missing required fields → blocked
- [ ] Test with valid data → submits successfully
- [ ] Test balance checker button → updates balance field

#### Sharaine: Test All UI Actions
- [ ] Log in as `giftguard_analyst` user
- [ ] Open a "New" dispute
- [ ] Test "Approve Dispute" action:
  - [ ] Status changes to "Approved"
  - [ ] Decision date populated
  - [ ] Decision field = "Approved"
- [ ] Test "Reject Dispute" action:
  - [ ] Status changes to "Rejected"
  - [ ] Requires `decision_reason` field
- [ ] Test "Escalate" action (on a high-risk dispute):
  - [ ] Status changes to "Escalated"
  - [ ] Assigned analyst changes to manager

#### Week 3 Deliverable Check
- [ ] ✅ 2 client scripts (form validation + balance checker) working
- [ ] ✅ 4 UI actions (approve, reject, escalate, check balance) working
- [ ] ✅ All tested by Sharaine and documented

---

## ═══════════════════════════════════
## WEEK 4: FLOW DESIGNER & NOTIFICATIONS
## Days 16–20
## ═══════════════════════════════════

---

### DAY 16 — Flow Designer: Build the Intake Workflow
**Owner**: Rudyard
**Goal**: Flow Designer workflow automates the intake process

#### Implementation Steps
- [ ] Navigate to: **Process Automation > Flow Designer**
- [ ] Click **New > Flow**
- [ ] Name: `Gift Card Dispute Intake Workflow`
- [ ] Trigger: `Record Created`
  - Table: `x_xxxx_giftguard_gift_card_dispute`
- [ ] Add these Steps (in order):
  1. [ ] **Step 1**: Get Dispute Record (trigger output)
  2. [ ] **Step 2**: Call Integration Hub action (fraud API / mock endpoint)
  3. [ ] **Step 3**: Update Dispute — set `risk_score` from Step 2 result
  4. [ ] **Step 4**: Flow Logic IF — `risk_score >= 75`
     - True branch: Set assigned_analyst to Manager Queue, set risk_level = "Critical"
     - False branch: Set assigned_analyst to Analyst Queue
  5. [ ] **Step 5**: Send Notification to assigned_analyst (email)
  6. [ ] **Step 6**: Send Confirmation email to customer
- [ ] Save the flow
- [ ] Click **Activate**

---

### DAY 17 — Notification 1: Dispute Received (to Customer)
**Owner**: Rudyard
**Goal**: Customer gets an automated email when they submit

#### Implementation Steps
- [ ] Navigate to: **System Notification > Notifications > New**
- [ ] Settings:
  - Name: `GiftGuard - Dispute Received Confirmation`
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - When to send: `Record inserted`
  - Who will receive: `Field value` → `customer_email`
  - Active: `checked`
- [ ] Subject: `GiftGuard: Dispute ${number} Received — We're on it`
- [ ] Body: (copy from `GIFTGUARD_CODE_IMPLEMENTATION.md` Part 5, Notification 1)
- [ ] Test: Create a new dispute with a real email → check if email arrives
  - [ ] Note: Your PDI must have outbound email configured (check System Properties > Email)

---

### DAY 18 — Notifications 2–4
**Owner**: Rudyard
**Goal**: All remaining email notifications created and active

#### Notification 2: Analyst Assignment Alert
- [ ] Create notification sent to `assigned_analyst` email
- [ ] Triggered when: `assigned_analyst changes`
- [ ] Subject: `[ACTION REQUIRED] New GiftGuard Dispute Assigned: ${number}`
- [ ] Include: risk_score, risk_level, customer_name, fraud_amount

#### Notification 3: Approval/Rejection Notice (to Customer)
- [ ] Create notification sent to `customer_email`
- [ ] Triggered when: `status changes to Approved OR Rejected`
- [ ] Two email variants (one approved, one rejected) — use condition or single with IF logic

#### Notification 4: Manager Escalation Alert
- [ ] Create notification sent to manager email
- [ ] Triggered when: `risk_level changes to Critical`
- [ ] Subject: `⚠️ URGENT: Critical Risk Dispute Requires Immediate Review`
- [ ] Mark as high-priority

---

### DAY 19 — Inbound Email Setup
**Owner**: Rudyard + Lyndon
**Goal**: Demonstrate inbound email capability (customers can also email disputes)

#### Implementation Steps
- [ ] Navigate to: **System Mailboxes > Inbound > Email Accounts**
- [ ] Note: In PDI, real inbound email may not be configurable, but create the configuration to demonstrate
- [ ] Navigate to: **System Notification > Email > Inbound Actions**
- [ ] Create Inbound Action:
  - Name: `Create Gift Card Dispute from Email`
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - Action: `Create record`
  - Map: email `from` → `customer_email`, email `subject` → `short_description`, email `body` → `dispute_description`
- [ ] For demo purposes: Show the configuration exists and explain the concept

---

### DAY 20 — Flow Testing & Week 4 Wrap-Up
**Owner**: Rudyard + Sharaine
**Goal**: Complete workflow passes end-to-end test

#### End-to-End Flow Test
- [ ] Create a new dispute record (simulate customer submission)
- [ ] In Flow Designer, go to **Execution Details** and verify the flow ran
- [ ] Check each step:
  - [ ] Step 1: Record retrieved ✅
  - [ ] Step 2: Integration Hub called ✅
  - [ ] Step 3: Risk score updated on dispute ✅
  - [ ] Step 4: Analyst assigned based on risk ✅
  - [ ] Step 5: Analyst email sent ✅
  - [ ] Step 6: Customer confirmation email sent ✅
- [ ] If any step fails: check Flow Execution History for error details

#### Week 4 Deliverable Check
- [ ] ✅ Flow Designer workflow activated and tested
- [ ] ✅ 4 notifications created (received, analyst, status, escalation)
- [ ] ✅ Inbound email action configured
- [ ] ✅ End-to-end test: submit → route → notify → PASS

---

## ═══════════════════════════════════
## WEEK 5: SERVICE PORTAL & ACCESS CONTROL
## Days 21–25
## ═══════════════════════════════════

---

### DAY 21 — Service Portal Setup
**Owner**: Kyle
**Goal**: Portal page accessible at a URL

#### Implementation Steps
- [ ] Navigate to: **Service Portal > Portals**
- [ ] Click **New**
- [ ] Settings:
  - Title: `GiftGuard Fraud Portal`
  - URL suffix: `giftguard`
  - Homepage: (create new page on Day 22)
  - Active: `checked`
- [ ] Navigate to: **Service Portal > Pages**
- [ ] Create new page: `Gift Card Dispute Intake`
  - URL suffix: `dispute_intake`
- [ ] Test: Navigate to `https://[your-instance].service-now.com/giftguard`

---

### DAY 22 — Service Portal Form Widget
**Owner**: Kyle
**Goal**: Dispute form is live and submittable on the portal

#### Implementation Steps
- [ ] Navigate to: **Service Portal > Widgets**
- [ ] You can use the built-in **Record Producer** approach (easiest):
  - Go to: **Service Catalog > Record Producers**
  - Click **New**
  - Name: `Submit a Gift Card Fraud Dispute`
  - Table: `x_xxxx_giftguard_gift_card_dispute`
  - Short Description: `Report a gift card balance discrepancy or fraud`
- [ ] Add variables (fields the customer fills in):
  - [ ] `customer_name` — Single Line Text
  - [ ] `customer_email` — Email
  - [ ] `customer_phone` — Phone
  - [ ] `gift_card_number` — Single Line Text
  - [ ] `gift_card_issuer` — Single Line Text (or Reference)
  - [ ] `expected_balance` — Decimal
  - [ ] `reported_balance` — Decimal
  - [ ] `transaction_date` — Date
  - [ ] `dispute_description` — Multi-line Text
  - [ ] `evidence_type` — Select Box
  - [ ] `receipt_attachment` — Attachment
- [ ] Add Record Producer to Service Portal page
- [ ] Test: Submit a dispute through the portal → verify record created in backend

---

### DAY 23 — Access Control Rules (ACLs)
**Owner**: Sharaine
**Goal**: Each role only sees what they are allowed to see

#### ACL Rules to Create
- [ ] Navigate to: **System Security > Access Control**

**Rule 1: giftguard_customer — Read own records only**
- [ ] Table: `x_xxxx_giftguard_gift_card_dispute`
- [ ] Operation: `READ`
- [ ] Condition: `current.customer_email == gs.getUser().getEmail()`
- [ ] Requires role: `giftguard_customer`

**Rule 2: giftguard_analyst — Read assigned records**
- [ ] Table: `x_xxxx_giftguard_gift_card_dispute`
- [ ] Operation: `READ`
- [ ] Condition: `current.assigned_analyst == gs.getUserID()`
- [ ] Requires role: `giftguard_analyst`

**Rule 3: giftguard_analyst — Write on assigned records**
- [ ] Table: `x_xxxx_giftguard_gift_card_dispute`
- [ ] Operation: `WRITE`
- [ ] Same condition as Rule 2

**Rule 4: giftguard_manager — Read all high-risk records**
- [ ] Table: `x_xxxx_giftguard_gift_card_dispute`
- [ ] Operation: `READ`
- [ ] Condition: `current.risk_level == 'Critical' || current.risk_level == 'High'`
- [ ] Requires role: `giftguard_manager`

**Rule 5: giftguard_admin — Full access**
- [ ] Table: `x_xxxx_giftguard_gift_card_dispute`
- [ ] Operation: `READ, WRITE, DELETE`
- [ ] No condition (admin sees all)
- [ ] Requires role: `giftguard_admin`

---

### DAY 24 — Test Users & Role Verification
**Owner**: Sharaine
**Goal**: Verify each role has correct access

#### Create Test Users
- [ ] Create user: `customer1_test` → assign role `giftguard_customer`
- [ ] Create user: `analyst1_test` → assign role `giftguard_analyst`
- [ ] Create user: `manager1_test` → assign role `giftguard_manager`
- [ ] All users should have working email addresses

#### Role Testing Script
For each test user, log in and verify:

**As giftguard_customer:**
- [ ] Can access Service Portal
- [ ] Can submit a dispute
- [ ] Can see OWN disputes only (not others' disputes)
- [ ] CANNOT see the Approve/Reject buttons
- [ ] CANNOT access admin tables

**As giftguard_analyst:**
- [ ] Can see disputes assigned to them
- [ ] CAN see Approve/Reject/Escalate buttons
- [ ] CANNOT see disputes assigned to other analysts
- [ ] CANNOT delete records

**As giftguard_manager:**
- [ ] Can see ALL high-risk (Critical/High) disputes
- [ ] Can escalate any dispute
- [ ] Can override analyst decisions

---

### DAY 25 — Portal Polish & Week 5 Testing
**Owner**: Kyle + Sharaine
**Goal**: Portal looks good, access control fully verified

#### Kyle: Portal UI Polish
- [ ] Add GiftGuard branding (logo, title) to portal header
- [ ] Ensure form is mobile-friendly
- [ ] Add confirmation message after form submit
- [ ] Test on mobile browser (phone size)

#### Sharaine: Full Access Control Test
- [ ] Test Case: Customer logs in → submits dispute → can see own status
- [ ] Test Case: Analyst logs in → sees assigned dispute → approves it
- [ ] Test Case: Log in as customer → try to access analyst view → BLOCKED
- [ ] Document all access control test results

#### Week 5 Deliverable Check
- [ ] ✅ Service Portal `giftguard` accessible at URL
- [ ] ✅ Record Producer form submissions create backend records
- [ ] ✅ 5 ACL rules created and enforced
- [ ] ✅ All 4 user roles tested and verified
- [ ] ✅ Access control documentation committed to GitHub

---

## ═══════════════════════════════════
## WEEK 6: TESTING, BUG FIXES & DEPLOYMENT
## Days 26–30
## ═══════════════════════════════════

---

### DAY 26 — Full System Test: All 4 Test Cases
**Owner**: Sharaine + All Team
**Goal**: Run all 4 documented test cases end-to-end

#### Test Case 1: Low Risk Auto-Approval
- [ ] Submit via portal: Alice Johnson, $25, has receipt PDF
- [ ] Expected: risk_score ~ 15, risk_level = Low
- [ ] Expected: SLA = 10 days
- [ ] Expected: Analyst assigned to regular queue
- [ ] Pass/Fail: ____

#### Test Case 2: High Risk Escalation
- [ ] Submit: Bob Smith, $950, no evidence, account 2 days old
- [ ] Expected: risk_score ~ 82, risk_level = Critical
- [ ] Expected: Auto-escalated, 24-hour SLA
- [ ] Expected: Manager alert email sent
- [ ] Pass/Fail: ____

#### Test Case 3: Medium Risk — Evidence Request
- [ ] Submit: Carol Davis, $200, screenshot only
- [ ] Expected: risk_score ~ 50, risk_level = Medium
- [ ] Expected: Assigned to regular analyst, 5-day SLA
- [ ] Pass/Fail: ____

#### Test Case 4: Critical — Repeat Disputer
- [ ] Simulate David Wilson (ensure 5+ disputes on same card in test data)
- [ ] Submit new dispute: $500, no evidence
- [ ] Expected: risk_score ~ 95, Critical escalation
- [ ] Pass/Fail: ____

#### All Team: Review Test Results
- [ ] Document which tests passed
- [ ] Create bug list for Day 27

---

### DAY 27 — Bug Fixes
**Owner**: Responsible team member for each bug
**Goal**: Fix all critical bugs found on Day 26

#### Bug Triage
- [ ] List all bugs from Day 26 testing in GitHub Issues
- [ ] Classify each: Critical (blocks demo) / Major (should fix) / Minor (nice to have)
- [ ] Assign each bug to the right person (Korblox = BR bugs, Kyle = CS bugs, etc.)
- [ ] Fix all Critical bugs
- [ ] Fix as many Major bugs as time allows

#### Common Bug Fixes
- [ ] Risk score = 0 always → Check Business Rule is Active + table name correct
- [ ] Email never sends → Check outbound email server + Notification is Active
- [ ] Client script blocks valid submit → Loosen validation regex
- [ ] Flow not triggering → Check Flow is Activated + trigger table matches

---

### DAY 28 — Integration Hub & AI Integration
**Owner**: Lyndon
**Goal**: Integration Hub connection demonstrated; AI/API integration configured

#### Integration Hub Minimum (Must Have)
- [ ] Navigate to: **Integration Hub > Connections & Credentials > Connection & Credential Aliases**
- [ ] Create Connection Alias: `GiftGuard_FraudAPI`
- [ ] Navigate to: **Integration Hub > Actions > Actions**
- [ ] Create Action: `Check Gift Card Fraud Risk`
  - Input: `gift_card_number`, `fraud_amount`, `customer_email`
  - Step: REST Step → call configured endpoint
  - Output: `risk_score` (integer)
- [ ] Test the action manually from Action Designer

#### AI Integration (Choose One)
**Option A: AbuseIPDB (Recommended)**
- [ ] Register at `https://www.abuseipdb.com/register` for free API key
- [ ] In Integration Hub, create REST Message to `https://api.abuseipdb.com/api/v2/check`
- [ ] Add HTTP Header: `Key: [YOUR_API_KEY]`
- [ ] Add parameter: `ipAddress` (from Client Script capturing `${window.location_ip}`)
- [ ] Test with a real IP → verify response

**Option B: Gemini AI (Extra Credit)**
- [ ] Get free API key from `https://aistudio.google.com/app/apikey`
- [ ] Create REST Message to `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- [ ] Send dispute description for risk analysis
- [ ] Parse response to extract risk score

---

### DAY 29 — Update Set Packaging & Export
**Owner**: Lyndon
**Goal**: Complete, deployable Update Set ready to export

#### Package Update Set
- [ ] Navigate to: **System Update Sets > Local Update Sets**
- [ ] Open `GiftGuard_v1.0`
- [ ] Review all entries — ensure all components are included:
  - [ ] Tables (3)
  - [ ] Business Rules (4)
  - [ ] Client Scripts (2)
  - [ ] UI Actions (4)
  - [ ] Notifications (4)
  - [ ] Flow Designer flow (1)
  - [ ] Script Include (1)
  - [ ] Service Portal (1)
  - [ ] ACL rules (5)
  - [ ] Roles (4)
- [ ] Click **Export to XML**
- [ ] Save the XML file
- [ ] Commit XML to GitHub as `delivery/GiftGuard_v1.0_UpdateSet.xml`

#### Final Documentation
- [ ] Update GitHub README with:
  - Project description
  - How to import the Update Set
  - Test user credentials for demo
  - Deployment notes
- [ ] All guide documents are current and in `/docs` folder

---

### DAY 30 — Demo Rehearsal & Final Delivery
**Owner**: All Team
**Goal**: Presentation is polished and demo runs flawlessly

#### Demo Script (10 Minutes)

**Minute 1 — Introduction**
- [ ] Present the problem: Gift card fraud with drained balances
- [ ] Introduce GiftGuard as the solution
- [ ] Name all 8 components you implemented

**Minutes 2–3 — Architecture Overview**
- [ ] Show the 3 custom tables in ServiceNow Studio
- [ ] Explain the 6-factor fraud scoring algorithm
- [ ] Show the Update Set XML (evidence of packaged deployment)

**Minutes 4–8 — Live Demo (5 steps)**
1. [ ] Open Service Portal → `https://[instance].service-now.com/giftguard`
2. [ ] Submit a high-risk dispute (Bob Smith scenario, no attachment, $950)
3. [ ] Show the backend record → `risk_score = 82`, `risk_level = Critical`
4. [ ] Show the analyst receiving the assignment email (pre-staged or shown in Email Log)
5. [ ] Log in as analyst → click "Approve Dispute" → show customer notification email

**Minutes 9–10 — Summary**
- [ ] List the 8 components completed
- [ ] Describe AI integration approach
- [ ] State success metrics (5-day SLA, fraud scoring accuracy)
- [ ] Q&A

#### Pre-Demo Checklist
- [ ] Test demo 3 times before presentation
- [ ] Have a backup: screenshots/video of each step in case live demo fails
- [ ] Confirm PDI is awake (visit it 30 minutes before demo)
- [ ] Log in as admin first, then switch users for demo
- [ ] Have all tabs pre-opened before presentation starts

#### Final Delivery Check
- [ ] ✅ Update Set XML exported and committed
- [ ] ✅ GitHub repo is clean and organized
- [ ] ✅ All 8 required components present and working
- [ ] ✅ 4 test cases documented (pass/fail results)
- [ ] ✅ Demo rehearsed at least 3 times
- [ ] ✅ Team knows who introduces which component
- [ ] ✅ Backup screenshots ready

---

## ═══════════════════════════════════
## FINAL DEMO CHECKLIST
## ═══════════════════════════════════

Run this checklist the morning of your presentation:

### 30 Minutes Before Demo
- [ ] Log into PDI as admin
- [ ] Clear any test data that might confuse the demo
- [ ] Stage 1 "clean" dispute record in "New" state for analyst demo
- [ ] Log into test email accounts to show inbox
- [ ] Open all browser tabs:
  - Tab 1: ServiceNow admin view
  - Tab 2: Service Portal (`/giftguard`)
  - Tab 3: Email inbox (for analyst/customer)
  - Tab 4: GitHub repo (for code reference)

### During Demo
- [ ] Customer submits dispute → show portal
- [ ] Show risk score auto-calculated → click the dispute record
- [ ] Show email sent → switch to email tab
- [ ] Click Approve as analyst → show status change
- [ ] Show customer confirmation email

### Component Call-Out (Have ready to show)
- [ ] Client Script → open browser console, show validation
- [ ] Business Rule → show System Log entry with risk calculation
- [ ] UI Action → point to the Approve/Reject buttons
- [ ] Notification → show Email Log (System Notification > Email Log)
- [ ] Integration Hub → show the Action in Integration Hub
- [ ] Flow Designer → show Execution History entry
- [ ] Service Portal → show the portal URL
- [ ] Roles → show the 4 roles in System Security > Roles

---

## ═══════════════════════════════════
## TEAM CONTACT MATRIX
## ═══════════════════════════════════

| Member | Role | Primary Responsibility | Escalation |
|---|---|---|---|
| **Korblox** | Lead | Architecture, Tables, Business Rules | First point of contact for all issues |
| **Kyle** | UI Dev | Client Scripts, Service Portal | Korblox if blocked |
| **Rudyard** | Workflow | UI Actions, Flow Designer, Notifications | Korblox if blocked |
| **Sharaine** | QA/Security | Testing, ACLs, Test Data | Korblox if blocked |
| **Lyndon** | Docs/Deploy | Integration Hub, Update Set, GitHub, Docs | Korblox if blocked |

### Standup Format (Daily, 15 min)
1. **What did you complete yesterday?** (1 min each)
2. **What are you working on today?** (1 min each)
3. **Are you blocked on anything?** (Address immediately)

---

## ═══════════════════════════════════
## BLOCKER ESCALATION PROCEDURE
## ═══════════════════════════════════

If you are blocked for more than **2 hours**, escalate:

1. **Post in team chat**: Describe the issue clearly (what you tried, what error you see)
2. **Tag Korblox**: Lead should help unblock
3. **Skip and work on next task**: Don't waste time — move to next item on your list
4. **Document the blocker**: Add to GitHub Issues so it can be tracked
5. **Bring to standup**: Discuss as a team

### Common Blockers & Self-Help

| Blocker | Quick Fix |
|---|---|
| Business Rule not triggering | Check Active checkbox, verify table name, read System Log |
| Email not sending | Check Notification Active, verify outbound email in System Properties |
| Client Script error | Open browser console (F12), look for JS errors |
| Flow not executing | Check Flow is Activated, review Execution History |
| Role not working | Log out, log back in as test user, clear cache |
| Risk score = 0 | Verify fraud_amount field has a value, check BR is running |
| Can't create table | Check you are in correct application scope |
| Can't find PDI | Go to `https://developer.servicenow.com` and request/wake instance |

---

## ═══════════════════════════════════
## CURRENT PROGRESS TRACKER
## ═══════════════════════════════════

Update this section at each weekly standup.

### Week 1 Status
- [ ] Scoped App created
- [ ] 3 Tables created
- [ ] 4 Roles created
- [ ] GitHub repo setup
- **Week 1 Owner**: Korblox

### Week 2 Status
- [ ] 4 Business Rules created
- [ ] Script Include (fraud scorer) created
- [ ] Business Rules tested by Sharaine
- **Week 2 Owner**: Korblox

### Week 3 Status
- [ ] 2 Client Scripts created
- [ ] 4 UI Actions created
- [ ] All tested by Sharaine
- **Week 3 Owner**: Kyle + Rudyard

### Week 4 Status
- [ ] Flow Designer workflow built and activated
- [ ] 4 Notifications created
- [ ] Inbound email configured
- [ ] End-to-end flow test passed
- **Week 4 Owner**: Rudyard

### Week 5 Status
- [ ] Service Portal live at `/giftguard` URL
- [ ] Record Producer form submitting correctly
- [ ] 5 ACL rules enforced
- [ ] All role tests passed
- **Week 5 Owner**: Kyle + Sharaine

### Week 6 Status
- [ ] 4 test cases run and documented
- [ ] All critical bugs fixed
- [ ] Integration Hub connection created
- [ ] Update Set packaged and exported
- [ ] Demo rehearsed (3 times)
- **Week 6 Owner**: Lyndon + All

---

**Version**: 1.0
**Team**: Korblox (Lead), Kyle, Rudyard, Sharaine, Lyndon
**Project**: CSIT440 Capstone — GiftGuard
**Last Updated**: April 17, 2026

---

> **Print this. Keep it open. Check off each box as you go. You've got this. 🚀**
