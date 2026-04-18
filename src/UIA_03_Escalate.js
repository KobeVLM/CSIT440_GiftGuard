// ============================================================
// UI ACTION 3: ESCALATE DISPUTE
// ============================================================
// ServiceNow Settings:
//   Name:         Escalate to Manager
//   Table:        x_[prefix]_giftguard_gift_card_dispute
//   Action name:  escalate_dispute
//   Form button:  CHECKED ✓
//   Active:       CHECKED ✓
//   Isolation:    CHECKED ✓
//
//   Condition:
//   (gs.hasRole('giftguard_analyst') || gs.hasRole('giftguard_manager'))
//   && current.u_status != 'approved' && current.u_status != 'rejected'
//
// COPY below into the "Script" field:
// ============================================================

// Find the first active manager
var mgrRole = new GlideRecord('sys_user_has_role');
mgrRole.addQuery('role.name', 'giftguard_manager');
mgrRole.addQuery('user.active', true);
mgrRole.setLimit(1);
mgrRole.query();

var managerSysId  = '';
var managerEmail  = '';
var managerName   = '';

if (mgrRole.next()) {
    managerSysId  = mgrRole.user.toString();
    managerEmail  = mgrRole.user.email.toString();
    managerName   = mgrRole.user.getDisplayValue();
} else {
    // Fallback: find any admin
    var adminGR = new GlideRecord('sys_user');
    adminGR.addQuery('active', true);
    adminGR.addQuery('sys_user_role.name', 'admin');
    adminGR.setLimit(1);
    adminGR.query();
    if (adminGR.next()) {
        managerSysId  = adminGR.sys_id;
        managerEmail  = adminGR.email.toString();
        managerName   = adminGR.getDisplayValue();
    }
}

// Update dispute
current.u_status        = 'escalated';
current.u_risk_level    = 'critical';
if (managerSysId) {
    current.u_assigned_analyst = managerSysId;
}
current.update();

// ── Send urgent email to manager ─────────────────────────────
if (managerEmail) {
    var subject = '⚠️ URGENT ESCALATION: GiftGuard Dispute ' + current.number
                + ' | Risk: ' + current.u_risk_score + '/100';

    var body = 'Hello ' + managerName + ',\n\n'
        + 'A gift card fraud dispute has been ESCALATED and requires your immediate review.\n\n'
        + '── DISPUTE DETAILS ─────────────────────────────\n'
        + 'Dispute ID:     ' + current.number + '\n'
        + 'Customer:       ' + current.u_customer_name + '\n'
        + 'Fraud Amount:   $' + current.u_fraud_amount + '\n'
        + 'Risk Score:     ' + current.u_risk_score + '/100\n'
        + 'Risk Level:     ' + current.u_risk_level.getDisplayValue() + '\n'
        + 'SLA Target:     ' + current.u_sla_target.getDisplayValue() + '\n\n'
        + '── DESCRIPTION ─────────────────────────────────\n'
        + current.u_dispute_description + '\n\n'
        + '── ACTION REQUIRED ─────────────────────────────\n'
        + 'Please log into ServiceNow and review this dispute IMMEDIATELY.\n'
        + 'SLA breach may occur if not addressed within 24 hours.\n\n'
        + 'Escalated by: ' + gs.getUserDisplayName() + '\n\n'
        + 'GiftGuard Fraud Protection System';

    gs.sendEmail(managerEmail, subject, body);
}

// ── Notify Customer ───────────────────────────────────────────
var custEmail = current.u_customer_email.toString();
gs.sendEmail(
    custEmail,
    'GiftGuard Dispute ' + current.number + ' — Under Senior Review',
    'Dear ' + current.u_customer_name + ',\n\n'
    + 'Your dispute has been escalated for senior management review due to its priority level.\n'
    + 'We expect to have a decision within 24 hours.\n\n'
    + 'Dispute ID: ' + current.number + '\n\n'
    + 'GiftGuard Fraud Protection Team'
);

// ── Log ───────────────────────────────────────────────────────
current.addWorkNotes('Dispute ESCALATED to manager (' + managerName + ') by '
    + gs.getUserDisplayName() + '.');

gs.info('[GiftGuard] Dispute ' + current.number + ' ESCALATED to manager: ' + managerName);

action.setRedirectURL(current);
