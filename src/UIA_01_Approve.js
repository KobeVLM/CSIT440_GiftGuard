// ============================================================
// UI ACTION 1: APPROVE DISPUTE
// ============================================================
// ServiceNow Settings:
//   Name:         Approve Dispute
//   Table:        x_[prefix]_giftguard_gift_card_dispute
//   Action name:  approve_dispute
//   Form button:  CHECKED ✓
//   Form link:    UNCHECKED
//   List banner button: UNCHECKED
//   Active:       CHECKED ✓
//   Isolation:    CHECKED ✓ (runs on server)
//
//   Condition (paste exactly):
//   gs.hasRole('giftguard_analyst') && (current.u_status == 'new' || current.u_status == 'under_review' || current.u_status == 'escalated')
//
// COPY EVERYTHING BELOW into the "Script" field:
// ============================================================

// Approve the current dispute
current.u_decision        = 'approved';
current.u_decision_date   = new GlideDateTime();
current.u_status          = 'approved';

// Set refund to full fraud amount
var fraudAmt = parseFloat(current.u_fraud_amount.toString()) || 0;
current.u_refund_amount   = fraudAmt;

// Refund date = 3 business days from now
var refundDate = new GlideDateTime();
refundDate.addDaysUTC(3);
current.u_refund_date = refundDate;

// Default reason if not already set
if (!current.u_decision_reason.toString()) {
    current.u_decision_reason = 'Fraud verified by analyst review. Full refund approved.';
}

current.update();

// ── Send approval email to customer ─────────────────────────
var mailto = current.u_customer_email.toString();
var subject = 'GiftGuard: Dispute ' + current.number + ' APPROVED — Refund Coming';
var body = 'Dear ' + current.u_customer_name + ',\n\n'
    + 'Great news! Your gift card fraud dispute has been reviewed and APPROVED.\n\n'
    + 'Dispute ID: ' + current.number + '\n'
    + 'Fraud Amount: $' + current.u_fraud_amount + '\n'
    + 'Refund Amount: $' + current.u_refund_amount + '\n'
    + 'Expected Refund By: ' + current.u_refund_date.getDisplayValue() + '\n\n'
    + 'Your refund will be processed to your original payment method within 3 business days.\n\n'
    + 'Thank you for reporting this fraud. Security matters to us.\n\n'
    + 'Best regards,\nGiftGuard Fraud Protection Team';

gs.sendEmail(mailto, subject, body);

// ── Log activity ─────────────────────────────────────────────
current.addWorkNotes('Dispute approved by ' + gs.getUserDisplayName()
    + '. Refund: $' + current.u_refund_amount
    + ' by ' + current.u_refund_date.getDisplayValue() + '.');

gs.info('[GiftGuard] Dispute ' + current.number + ' APPROVED by ' + gs.getUserDisplayName());

// Redirect back to the dispute record
action.setRedirectURL(current);
