// ============================================================
// BUSINESS RULE 3: SET SLA DATE & LOG FRAUD SCORE
// ============================================================
// ServiceNow Settings:
//   Name:    GiftGuard - After Insert - Set SLA and Log Score
//   Table:   x_1994889_csit440_gift_card_dispute
//   When:    after
//   Insert:  CHECKED ✓
//   Update:  UNCHECKED
//   Delete:  UNCHECKED
//   Active:  CHECKED ✓
//   Order:   300
//
// NOTE: This runs AFTER the record is inserted (so sys_id exists)
// It updates the SLA field and writes to the Fraud Scoring Log table.
// ============================================================

(function executeRule(current, previous) {
    try {
        var riskLevel = current.risk_level.toString();
        var slaDays = 5; // default

        // SLA based on risk level
        switch (riskLevel) {
            case 'critical': slaDays = 1; break;  // 24 hours
            case 'high':     slaDays = 2; break;  // 2 days
            case 'medium':   slaDays = 3; break;  // 3 days
            case 'low':      slaDays = 5; break;  // 5 days
        }

        // Calculate SLA target date
        var slaDate = new GlideDateTime();
        slaDate.addDaysUTC(slaDays);

        // Update the dispute record with SLA date
        var disputeGR = new GlideRecord(current.getTableName());
        disputeGR.get(current.sys_id);
        disputeGR.sla_target = slaDate;
        disputeGR.autoSysFields(false); // Don't change sys_updated_by etc.
        disputeGR.setWorkflow(false);   // Don't re-trigger business rules
        disputeGR.update();

        // Write to Fraud Scoring Log
        var logGR = new GlideRecord('x_1994889_csit440_fraud_score_log');
        logGR.initialize();
        logGR.gift_card_dispute = current.sys_id;
        logGR.scoring_time      = new GlideDateTime();
        logGR.risk_score        = current.risk_score;
        logGR.ai_service_used   = 'Rule-Based Scoring Engine v1.0';
        logGR.reasoning         = 'Scored using 6 factors: Amount (' + current.fraud_amoun0
                                + '), Evidence (' + current.evidence_type
                                + '), Time, Volume, Account Age, Description. '
                                + 'SLA set to ' + slaDays + ' day(s).';
        logGR.insert();

        gs.info('[GiftGuard] BR_03 SLA set: ' + slaDate + ' | Score logged for dispute: ' + current.number);

    } catch (e) {
        gs.error('[GiftGuard] BR_03 SetSLA Error: ' + e.message);
    }

})(current, previous);
