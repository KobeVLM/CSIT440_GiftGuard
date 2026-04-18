// ============================================================
// BUSINESS RULE 2: CALCULATE FRAUD RISK SCORE
// ============================================================
// ServiceNow Settings:
//   Name:    GiftGuard - Before Insert - Calculate Risk Score
//   Table:   x_1994889_csit440_gift_card_dispute
//   When:    before
//   Insert:  CHECKED ✓
//   Update:  UNCHECKED
//   Delete:  UNCHECKED
//   Active:  CHECKED ✓
//   Order:   200  (MUST run AFTER BR_01 so card is already masked)
//
// Paste the function below into the "Script" field:
// ============================================================

(function executeRule(current, previous) {
    try {
        var riskScore = 0;
        var factors = {};

        // ── FACTOR 1: FRAUD AMOUNT ──────────────────────────────
        var expectedBal = parseFloat(current.expected_balance) || 0;
        var reportedBal = parseFloat(current.reported_balance) || 0;
        var fraudAmount = expectedBal - reportedBal;

        // Auto-calculate fraud_amount field
        if (fraudAmount > 0) {
            current.fraud_amount = fraudAmount;
        } else {
            fraudAmount = parseFloat(current.fraud_amount) || 0;
        }

        var amtScore = 0;
        if (fraudAmount >= 1000)      { amtScore = 35; factors.amount = 'Large ($1000+) +35'; }
        else if (fraudAmount >= 500)  { amtScore = 25; factors.amount = 'High ($500-999) +25'; }
        else if (fraudAmount >= 200)  { amtScore = 15; factors.amount = 'Medium ($200-499) +15'; }
        else if (fraudAmount >= 50)   { amtScore = 8;  factors.amount = 'Small ($50-199) +8'; }
        else                           { amtScore = 0;  factors.amount = 'Very small (<$50) +0'; }
        riskScore += amtScore;

        // ── FACTOR 2: EVIDENCE QUALITY ──────────────────────────
        var hasAttachment = (current.evidence_type.toString() !== '' && current.evidence_type.toString() !== 'none');
        var evidenceType  = current.evidence_type.toString();
        var evScore = 0;

        if (!hasAttachment || evidenceType === 'none' || evidenceType === '') {
            evScore = 30; factors.evidence = 'No evidence +30';
        } else if (evidenceType === 'receipt') {
            evScore = 0;  factors.evidence = 'Receipt (best) +0';
        } else if (evidenceType === 'bank_statement') {
            evScore = 8;  factors.evidence = 'Bank statement +8';
        } else if (evidenceType === 'email_confirmation') {
            evScore = 5;  factors.evidence = 'Email confirmation +5';
        } else if (evidenceType === 'screenshot') {
            evScore = 20; factors.evidence = 'Screenshot only +20';
        } else {
            evScore = 25; factors.evidence = 'Other evidence +25';
        }
        riskScore += evScore;

        // ── FACTOR 3: TIME-BASED RISK ───────────────────────────
        var timeScore = 0;
        var txDateStr = current.transaction_date.toString();
        if (txDateStr) {
            try {
                var hour = parseInt(txDateStr.substring(11, 13)) || 12;
                if (hour >= 23 || hour <= 5) {
                    timeScore = 12; factors.time = 'Late night (11PM-5AM) +12';
                } else if (hour >= 22 || hour <= 7) {
                    timeScore = 5;  factors.time = 'Early/late hour +5';
                } else {
                    factors.time = 'Normal hours +0';
                }
            } catch(te) { factors.time = 'Could not parse time +0'; }
        }
        riskScore += timeScore;

        // ── FACTOR 4: VOLUME RISK (same card, last 30 days) ─────
        var volScore = 0;
        var maskedCard = current.gift_card_number.toString();
        if (maskedCard) {
            var monthAgo = gs.dateAdd(gs.now(), -30, 'day');
            var gr = new GlideRecord('x_1994889_csit440_gift_card_dispute');
            gr.addQuery('gift_card_number', 'CONTAINS', maskedCard.slice(-4));
            gr.addQuery('sys_created_on', '>=', monthAgo);
            gr.query();
            var cnt = gr.getRowCount();

            if (cnt >= 5)      { volScore = 30; factors.volume = 'Pattern fraud (5+) +30'; }
            else if (cnt >= 3) { volScore = 20; factors.volume = 'Multiple disputes (3+) +20'; }
            else if (cnt >= 1) { volScore = 10; factors.volume = 'Prior dispute exists +10'; }
            else               { factors.volume = 'First dispute +0'; }
        }
        riskScore += volScore;

        // ── FACTOR 5: ACCOUNT AGE ───────────────────────────────
        var acctScore = 0;
        var custEmail = current.customer_email.toString();
        if (custEmail) {
            var userGR = new GlideRecord('sys_user');
            userGR.addQuery('email', custEmail);
            userGR.query();
            if (userGR.next()) {
                var ageDays = gs.dateDiff(userGR.sys_created_on.toString(), gs.now(), true) / (1000 * 60 * 60 * 24);
                if (ageDays < 7)        { acctScore = 25; factors.account = 'Very new account (<7d) +25'; }
                else if (ageDays < 30)  { acctScore = 15; factors.account = 'New account (<30d) +15'; }
                else if (ageDays < 90)  { acctScore = 5;  factors.account = 'Relatively new (<90d) +5'; }
                else                    { factors.account = 'Established account +0'; }
            } else {
                acctScore = 10; factors.account = 'Customer not in system +10';
            }
        }
        riskScore += acctScore;

        // ── FACTOR 6: DESCRIPTION KEYWORD ANALYSIS ─────────────
        var descScore = 0;
        var desc = (current.dispute_description.toString() || '').toLowerCase();
        var highRiskWords = ['hacked', 'stolen', 'unauthorized', 'compromised', 'scammed', 'drained'];
        var matchCount = 0;
        for (var w = 0; w < highRiskWords.length; w++) {
            if (desc.indexOf(highRiskWords[w]) > -1) matchCount++;
        }
        if (matchCount >= 2)         { descScore = 15; factors.description = 'Multiple fraud keywords +15'; }
        else if (matchCount === 1)   { descScore = 8;  factors.description = 'Fraud keyword found +8'; }
        else if (desc.length < 20)   { descScore = 10; factors.description = 'Vague description +10'; }
        else                          { factors.description = 'Detailed description +0'; }
        riskScore += descScore;

        // ── CAP & SET FIELDS ────────────────────────────────────
        riskScore = Math.min(Math.max(riskScore, 0), 100);

        var riskLevel = 'low';
        if (riskScore >= 80)      riskLevel = 'critical';
        else if (riskScore >= 60) riskLevel = 'high';
        else if (riskScore >= 40) riskLevel = 'medium';

        current.risk_score = riskScore;
        current.risk_level = riskLevel;

        gs.info('[GiftGuard] Risk Score calculated: ' + riskScore + ' (' + riskLevel + ') | Factors: ' + JSON.stringify(factors));

    } catch (e) {
        gs.error('[GiftGuard] BR_02 CalculateRisk Error: ' + e.message);
    }

})(current, previous);
