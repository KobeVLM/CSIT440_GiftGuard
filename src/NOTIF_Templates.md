# GiftGuard — All 4 Notification Templates
## Copy-paste these into ServiceNow Notifications

---

## HOW TO CREATE A NOTIFICATION IN SERVICENOW

1. Go to: **System Notification > Email > Notifications**
2. Click **New**
3. Fill in the fields from each template below
4. Click **Submit** then test using the **Test Notification** button

> ⚠️ **Important**: Your PDI must have outbound email enabled.
> Check: **System Properties > Email Properties > Enable Email Sending** = `true`

---

## ⚡ QUICK REFERENCE — "Send when" Settings for All 4 Notifications

| Notif | Send when dropdown | Inserted ✓? | Updated ✓? | Condition |
|---|---|:---:|:---:|---|
| 1 — Dispute Received | Record inserted or updated | ✅ | ❌ | *(none)* |
| 2 — Analyst Assignment | Record inserted or updated | ❌ | ✅ | Assigned Analyst **changes** |
| 3 — Customer Decision | Record inserted or updated | ❌ | ✅ | Status **is one of** Approved, Rejected |
| 4 — Manager Escalation | Record inserted or updated | ❌ | ✅ | Risk Level **is** Critical |

---

## NOTIFICATION 1: DISPUTE RECEIVED (to Customer)

**Purpose**: Auto-email customer immediately when they submit a dispute

### Header tab
| Field | Value |
|---|---|
| **Name** | `GiftGuard - Dispute Received Confirmation` |
| **Table** | `Gift Card Dispute [x_1994889_csit440_gift_card_dispute]` |
| **Active** | ✓ Checked |

### "When to send" tab
| Field | Value |
|---|---|
| Send when | `Record inserted or updated` |
| **Inserted** | ✅ **CHECK THIS** |
| **Updated** | ❌ leave unchecked |
| Conditions | *(leave empty — fires on every insert)* |

### "Who will receive" tab
| Field | Value |
|---|---|
| Send to | `Users/Groups in fields` |
| *(or use Script)* | See script below ↓ |

> **Easiest approach** — click the **Advanced** checkbox / **Script** section and paste:
> ```javascript
> answer = current.customer_email.toString();
> ```

### "What it will contain" tab

**Subject** (paste exactly):
```
GiftGuard: Dispute ${number} Received — We're Investigating
```

**Message body**:
```
Dear ${customer_name},

Thank you for contacting GiftGuard. We have received your gift card fraud dispute.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISPUTE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispute ID:       ${number}
Card Issuer:      ${gift_card_issuer}
Reported Amount:  $${fraud_amount}
Submitted On:     ${sys_created_on}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT HAPPENS NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Our fraud team will review your dispute within 5 business days.
2. We may contact you if additional documentation is needed.
3. You will receive an email when a decision is made.

Your case reference number is: ${number}
Please save this number — you can track your status online at any time.

If you have additional evidence, please reply to this email and attach it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
GiftGuard Fraud Protection Team
```

---

## NOTIFICATION 2: ANALYST ASSIGNMENT ALERT

**Purpose**: Alert an analyst when a dispute is assigned to them

### Header tab
| Field | Value |
|---|---|
| **Name** | `GiftGuard - Analyst Assignment Alert` |
| **Table** | `Gift Card Dispute [x_1994889_csit440_gift_card_dispute]` |
| **Active** | ✓ Checked |

### "When to send" tab
| Field | Value |
|---|---|
| Send when | `Record inserted or updated` |
| **Inserted** | ❌ leave unchecked |
| **Updated** | ✅ **CHECK THIS** |
| Conditions | `Assigned Analyst` → `changes` |

### "Who will receive" tab
> Analyst is a **reference field** to sys_user, so you can use the user field directly:

| Field | Value |
|---|---|
| Send to | `Users/Groups in fields` |
| Add field | `Assigned Analyst` |

### "What it will contain" tab

**Subject**:
```
[ACTION REQUIRED] GiftGuard Dispute ${number} Assigned | Risk: ${risk_level} | $${fraud_amount}
```

**Message body**:
```
Hi ${assigned_analyst.name},

A gift card fraud dispute has been assigned to you for review.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISPUTE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispute ID:       ${number}
Customer:         ${customer_name}
Customer Email:   ${customer_email}
Card Issuer:      ${gift_card_issuer}
Fraud Amount:     $${fraud_amount}
Evidence Type:    ${evidence_type}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRAUD RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Risk Score:       ${risk_score}/100
Risk Level:       ${risk_level}
SLA Target:       ${sla_target}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dispute_description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please log in to ServiceNow to review and take action:
  ✓ APPROVE — if fraud is verified and evidence is sufficient
  ✗ REJECT  — if claim lacks evidence or appears invalid
  ⚠ ESCALATE — if risk is too high for analyst decision

GiftGuard Fraud Protection System
```

---

## NOTIFICATION 3: CUSTOMER DECISION NOTICE (Approved or Rejected)

**Purpose**: Notify the customer of the final decision on their dispute

### Header tab
| Field | Value |
|---|---|
| **Name** | `GiftGuard - Customer Decision Notice` |
| **Table** | `Gift Card Dispute [x_1994889_csit440_gift_card_dispute]` |
| **Active** | ✓ Checked |

### "When to send" tab
| Field | Value |
|---|---|
| Send when | `Record inserted or updated` |
| **Inserted** | ❌ leave unchecked |
| **Updated** | ✅ **CHECK THIS** |
| Conditions (Row 1) | `Status` → `changes` |
| Conditions (Row 2) | `Status` → `is one of` → select `Approved` AND `Rejected` |

> To add Row 2: click **Add Filter Condition** after Row 1.

### "Who will receive" tab
> Use script since `customer_email` is a free-text String field:

Click the **Advanced** / Script checkbox and paste:
```javascript
answer = current.customer_email.toString();
```

### "What it will contain" tab

**Subject**:
```
GiftGuard: Decision on Dispute ${number} — ${status}
```

**Message body**:
```
Dear ${customer_name},

We have completed our review of your gift card fraud dispute.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispute ID:       ${number}
Decision:         ${decision}
Decision Date:    ${decision_date}
Reason:           ${decision_reason}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF APPROVED:
Your refund of $${refund_amount} will be processed by ${refund_date}.
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

**Purpose**: Alert managers immediately when a dispute scores as Critical risk

### Header tab
| Field | Value |
|---|---|
| **Name** | `GiftGuard - Manager Escalation Alert` |
| **Table** | `Gift Card Dispute [x_1994889_csit440_gift_card_dispute]` |
| **Active** | ✓ Checked |

### "When to send" tab
| Field | Value |
|---|---|
| Send when | `Record inserted or updated` |
| **Inserted** | ❌ leave unchecked |
| **Updated** | ✅ **CHECK THIS** |
| Conditions (Row 1) | `Risk Level` → `changes` |
| Conditions (Row 2) | `Risk Level` → `is` → `Critical` |

### "Who will receive" tab
| Field | Value |
|---|---|
| Send to | `Roles` |
| Role | `giftguard_manager` |

### "What it will contain" tab

**Subject**:
```
⚠️ URGENT: Critical Fraud Alert — Dispute ${number} | Score: ${risk_score}/100
```

**Message body**:
```
URGENT ESCALATION — GiftGuard Fraud Protection

Hello,

A gift card fraud dispute has been flagged as CRITICAL and requires your IMMEDIATE attention.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CRITICAL RISK DISPUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispute ID:       ${number}
Customer:         ${customer_name}
Fraud Amount:     $${fraud_amount}
Risk Score:       ${risk_score}/100  ← CRITICAL
SLA Target:       ${sla_target}  ← 24 HOURS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK FACTORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Evidence Type:    ${evidence_type}
Transaction Date: ${transaction_date}

Customer Description:
${dispute_description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION REQUIRED WITHIN 24 HOURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLA breach will occur if not reviewed immediately.
Please log in to ServiceNow to action this dispute.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GiftGuard Automated Alert System
This is a system-generated message.
```

---

## INBOUND EMAIL ACTION

**Where**: System Notification > Email > Inbound Actions > New

| Field | Value |
|---|---|
| **Name** | `GiftGuard - Create Dispute from Email` |
| **Table** | `Gift Card Dispute [x_1994889_csit440_gift_card_dispute]` |
| **Active** | ✓ Checked |
| **Stop Processing** | CHECKED ✓ |
| **Conditions** | Subject contains: `GIFTGUARD` OR `fraud` OR `gift card` |
| **Action** | Create record |

**Field Mapping** (in the Variables/Mappings section):
| Source | Target Field |
|---|---|
| `${mail.from.email}` | `customer_email` |
| `${mail.from.name}` | `customer_name` |
| `${mail.body_text}` | `dispute_description` |
| (fixed value) `email_confirmation` | `evidence_type` |

> **Note for demo**: If inbound email is not testable in your PDI, show the configuration
> screen to demonstrate you have it **configured**. Explain that "in production this
> creates disputes from customer emails automatically."
