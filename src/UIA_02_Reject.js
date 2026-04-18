// ============================================================
// UI ACTION 2: REJECT DISPUTE
// ============================================================
// ServiceNow Settings:
//   Name:         Reject Dispute
//   Table:        x_[prefix]_giftguard_gift_card_dispute
//   Action name:  reject_dispute
//   Form button:  CHECKED ✓
//   Active:       CHECKED ✓
//   Isolation:    CHECKED ✓
//
//   Condition:
//   gs.hasRole('giftguard_analyst') && (current.u_status == 'new' || current.u_status == 'under_review' || current.u_status == 'escalated')
//
// ⚠️  IMPORTANT: In the "Onclick" field of the UI Action (Client tab),
//     paste this to show a reason prompt BEFORE submitting to server:
//
//   var reason = prompt('Enter reason for rejection (required):');
//   if (!reason || reason.trim() === '') {
//       alert('Rejection requires a reason. Please enter one.');
//       return false;
//   }
//   g_form.setValue('u_decision_reason', reason);
//   gsftSubmit(null, g_form.getFormElement(), 'reject_dispute');
//
// COPY THE SERVER SCRIPT below into the "Script" field:
// ============================================================

// Update dispute status and decision
current.u_decision      = 'rejected';
current.u_decision_date = new GlideDateTime();
current.u_status        = 'rejected';
current.u_refund_amount = 0;

current.update();

// ── Send rejection email to customer ────────────────────────
var mailto  = current.u_customer_email.toString();
var subject = 'GiftGuard: Dispute ' + current.number + ' — Decision Update';
var reason  = current.u_decision_reason.toString() || 'Insufficient evidence provided.';

var body = 'Dear ' + current.u_customer_name + ',\n\n'
    + 'We have completed our review of your gift card fraud dispute.\n\n'
    + 'Unfortunately, we are unable to approve your claim at this time.\n\n'
    + 'Dispute ID: ' + current.number + '\n'
    + 'Status: REJECTED\n'
    + 'Reason: ' + reason + '\n\n'
    + 'WHAT YOU CAN DO:\n'
    + '1. If you have additional evidence (receipts, statements), reply to this email.\n'
    + '2. You have 30 days from this notice to appeal.\n'
    + '3. Contact our support team if you have questions.\n\n'
    + 'To appeal: Reply to this email with your additional documentation.\n\n'
    + 'We take fraud seriously and will reconsider with sufficient evidence.\n\n'
    + 'Best regards,\nGiftGuard Fraud Protection Team';

gs.sendEmail(mailto, subject, body);

// ── Log activity ─────────────────────────────────────────────
current.addWorkNotes('Dispute REJECTED by ' + gs.getUserDisplayName()
    + '. Reason: ' + reason);

gs.info('[GiftGuard] Dispute ' + current.number + ' REJECTED by ' + gs.getUserDisplayName());

action.setRedirectURL(current);
