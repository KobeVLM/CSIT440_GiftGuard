# GiftGuard — All 4 Notification Templates
## Copy-paste these into ServiceNow Notifications

---

## HOW TO CREATE A NOTIFICATION IN SERVICENOW

1. Go to: **System Notification > Email > Notifications**
2. Click **New**
3. Fill in the fields from each template below
4. Click **Save**
5. Test by clicking the **Test Notification** button

> ⚠️ **Important**: Your PDI must have outbound email enabled.
> Check: **System Properties > Email Properties > Enable Email Sending** = `true`

---

## NOTIFICATION 1: DISPUTE RECEIVED (to Customer)

**When to send**: Immediately when customer submits a dispute

| Field | Value |
|---|---|
| **Name** | GiftGuard - Dispute Received Confirmation |
| **Table** | x_[prefix]_giftguard_gift_card_dispute |
| **When to send** | Record inserted |
| **Who will receive** | Specific email address |
| **Specific recipient** | `${u_customer_email}` |
| **Active** | ✓ Checked |
| **Send when** | Event is fired |
| **Weight** | 50 |

**Subject line** (paste exactly):
```
GiftGuard: Dispute ${number} Received — We're Investigating
```

**Email body** (paste in the Message field):
```
Dear ${u_customer_name},

Thank you for contacting GiftGuard. We have received your gift card fraud dispute.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISPUTE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispute ID:       ${number}
Card Issuer:      ${u_gift_card_issuer.name}
Reported Amount:  $${u_fraud_amount}
Submitted On:     ${sys_created_on}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT HAPPENS NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Our fraud team will review your dispute within 5 business days.
2. We may contact you if additional documentation is needed.
3. You will receive an email when a decision is made.

Your case has been assigned Dispute ID: ${number}
Please reference this ID in all future communications.

If you have additional evidence to submit, please reply to this email and attach it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
GiftGuard Fraud Protection Team
support@giftguard.com | 1-800-GIFTGRD
```

---

## NOTIFICATION 2: ANALYST ASSIGNMENT ALERT

**When to send**: When `assigned_analyst` field changes (dispute is assigned to an analyst)

| Field | Value |
|---|---|
| **Name** | GiftGuard - Analyst Assignment Alert |
| **Table** | x_[prefix]_giftguard_gift_card_dispute |
| **When to send** | Fields changes |
| **Field** | Assigned Analyst |
| **Who will receive** | Field on target record |
| **Field** | Assigned Analyst → Email |
| **Active** | ✓ Checked |

**Subject line**:
```
[ACTION REQUIRED] GiftGuard Dispute ${number} Assigned | Risk: ${u_risk_level} | $${u_fraud_amount}
```

**Email body**:
```
Hi ${u_assigned_analyst.name},

A gift card fraud dispute has been assigned to you for review.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISPUTE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispute ID:       ${number}
Customer:         ${u_customer_name}
Customer Email:   ${u_customer_email}
Card Issuer:      ${u_gift_card_issuer.name}
Fraud Amount:     $${u_fraud_amount}
Evidence Type:    ${u_evidence_type}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRAUD RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Risk Score:       ${u_risk_score}/100
Risk Level:       ${u_risk_level}
SLA Target:       ${u_sla_target}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${u_dispute_description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please review this dispute and take one of the following actions:
  ✓ APPROVE — if fraud is verified and evidence is sufficient
  ✗ REJECT  — if claim lacks evidence or appears invalid
  ⚠ ESCALATE — if risk is too high for analyst decision

Log in to ServiceNow to review: [Your ServiceNow Instance URL]/x_[prefix]_giftguard_gift_card_dispute.do?sys_id=${sys_id}

GiftGuard Fraud Protection System
```

---

## NOTIFICATION 3: CUSTOMER DECISION NOTICE (Approval or Rejection)

**When to send**: When `u_status` changes to `approved` OR `rejected`

| Field | Value |
|---|---|
| **Name** | GiftGuard - Customer Decision Notice |
| **Table** | x_[prefix]_giftguard_gift_card_dispute |
| **When to send** | Field changes |
| **Field** | Status |
| **Condition** | `current.u_status == 'approved' \|\| current.u_status == 'rejected'` |
| **Who will receive** | Specific email address |
| **Specific recipient** | `${u_customer_email}` |
| **Active** | ✓ Checked |

**Subject line**:
```
GiftGuard: Decision on Dispute ${number} — ${u_status}
```

**Email body**:
```
Dear ${u_customer_name},

We have completed our review of your gift card fraud dispute.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispute ID:       ${number}
Decision:         ${u_decision}
Decision Date:    ${u_decision_date}
Reason:           ${u_decision_reason}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF APPROVED:
Your refund of $${u_refund_amount} will be processed by ${u_refund_date}.
Please allow 3–5 business days for the refund to appear.

IF REJECTED:
You may appeal this decision within 30 days by replying to this email
with additional supporting documentation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for using GiftGuard.

Best regards,
GiftGuard Fraud Protection Team
```

---

## NOTIFICATION 4: MANAGER ESCALATION ALERT (URGENT)

**When to send**: When `u_risk_level` changes to `critical` OR when `u_status` changes to `escalated`

| Field | Value |
|---|---|
| **Name** | GiftGuard - Manager Escalation Alert |
| **Table** | x_[prefix]_giftguard_gift_card_dispute |
| **When to send** | Field changes |
| **Field** | Risk Level |
| **Condition** | `current.u_risk_level == 'critical'` |
| **Who will receive** | Users with role |
| **Role** | giftguard_manager |
| **Active** | ✓ Checked |

**Subject line**:
```
⚠️ URGENT: Critical Fraud Dispute ${number} Requires Immediate Review | Score: ${u_risk_score}/100
```

**Email body**:
```
URGENT ESCALATION — GiftGuard Fraud Protection

Hello,

A gift card fraud dispute has been flagged as CRITICAL and requires your IMMEDIATE attention.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CRITICAL RISK DISPUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispute ID:       ${number}
Customer:         ${u_customer_name}
Fraud Amount:     $${u_fraud_amount}
Risk Score:       ${u_risk_score}/100 (CRITICAL)
SLA Target:       ${u_sla_target}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK FACTORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Evidence Type:    ${u_evidence_type}
Transaction Date: ${u_transaction_date}

Customer Description:
${u_dispute_description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION REQUIRED WITHIN 24 HOURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLA breach will occur if not reviewed immediately.

Please log in to ServiceNow to action this dispute:
[Your ServiceNow Instance URL]/x_[prefix]_giftguard_gift_card_dispute.do?sys_id=${sys_id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GiftGuard Automated Alert System
This is a system-generated message. Do not reply to this address.
```

---

## INBOUND EMAIL ACTION

**Where**: System Notification > Email > Inbound Actions > New

| Field | Value |
|---|---|
| **Name** | GiftGuard - Create Dispute from Email |
| **Table** | x_[prefix]_giftguard_gift_card_dispute |
| **Active** | ✓ Checked |
| **Stop Processing** | CHECKED ✓ |
| **Conditions** | Subject contains: `GIFTGUARD` OR `fraud` OR `gift card` |
| **Action** | Create record |

**Field Mapping** (in the Variables/Mappings section):
| Source | Target Field |
|---|---|
| `${mail.from.email}` | `u_customer_email` |
| `${mail.from.name}` | `u_customer_name` |
| `${mail.subject}` | `short_description` |
| `${mail.body_text}` | `u_dispute_description` |
| `Email` | `u_evidence_type` |

> **Note for demo**: If inbound email is not testable in your PDI, show the configuration screen to demonstrate you have it **configured**. Explain that "in production this creates disputes from customer emails automatically."
