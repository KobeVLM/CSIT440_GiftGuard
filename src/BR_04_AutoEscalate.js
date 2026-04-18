// ============================================================
// BUSINESS RULE 4: AUTO-ESCALATE HIGH RISK DISPUTES
// ============================================================
// ServiceNow Settings:
//   Name:    GiftGuard - After Update - Auto Escalate High Risk
//   Table:   x_[prefix]_giftguard_gift_card_dispute
//   When:    after
//   Insert:  UNCHECKED
//   Update:  CHECKED ✓
//   Delete:  UNCHECKED
//   Active:  CHECKED ✓
//   Order:   100
//   Filter Condition: [u_risk_level] [changes] []
//               AND   [u_risk_level] [is] [critical]
//
// TIP: Set the Filter Condition in the "Condition" tab (not Advanced).
// ============================================================

(function executeRule(current, previous) {
    try {
        // Only run when risk_level just changed TO critical
        if (current.u_risk_level.toString() !== 'critical') {
            return;
        }
        if (current.u_risk_level.toString() === previous.u_risk_level.toString()) {
            return; // No change - skip
        }

        // Already escalated? Skip.
        if (current.u_status.toString() === 'escalated') {
            return;
        }

        // Find a user with the giftguard_manager role
        var managerGR = new GlideRecord('sys_user_has_role');
        managerGR.addQuery('role.name', 'giftguard_manager');
        managerGR.addQuery('user.active', true);
        managerGR.setLimit(1);
        managerGR.query();

        var managerSysId = '';
        var managerEmail = '';
        var managerName  = '';

        if (managerGR.next()) {
            managerSysId  = managerGR.user.toString();
            managerEmail  = managerGR.user.email.toString();
            managerName   = managerGR.user.getDisplayValue();
        }

        // Update the dispute — set status to Escalated, assign to manager
        var upd = new GlideRecord(current.getTableName());
        upd.get(current.sys_id);
        upd.u_status = 'escalated';
        if (managerSysId) {
            upd.u_assigned_analyst = managerSysId;
        }
        upd.autoSysFields(false);
        upd.setWorkflow(false);
        upd.update();

        // Send email notification via gs.eventQueue or direct notification
        // The Notification "GiftGuard - Escalation Alert" handles the email.
        // Trigger the event so the notification fires:
        gs.eventQueue(
            'x_giftguard.dispute.escalated',
            current,
            managerEmail,
            'Risk Score: ' + current.u_risk_score + ' | Amount: $' + current.u_fraud_amount
        );

        gs.info('[GiftGuard] BR_04 Auto-escalated dispute: ' + current.number + ' to manager: ' + managerName);

    } catch (e) {
        gs.error('[GiftGuard] BR_04 AutoEscalate Error: ' + e.message);
    }

})(current, previous);
