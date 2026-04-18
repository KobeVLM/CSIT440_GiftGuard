// ============================================================
// SCRIPT INCLUDE: GIFT CARD FRAUD SCORER MODULE
// ============================================================
// ServiceNow Settings:
//   Name:          GiftGuardFraudScorer
//   API Name:      x_1994889_csit440.GiftGuardFraudScorer
//   Accessible From: All application scopes
//   Active:        CHECKED ✓
//   Client Callable: UNCHECKED (server-side only)
//
// This is a REUSABLE class — Business Rules and Flow Designer
// call this instead of duplicating scoring logic.
//
// How to CALL this from a Business Rule:
//   var scorer = new GiftGuardFraudScorer();
//   var result = scorer.score(current);
//   current.risk_score = result.risk_score;
//   current.risk_level = result.risk_level;
// ============================================================

var GiftGuardFraudScorer = Class.create();

GiftGuardFraudScorer.prototype = {

    initialize: function() {
        this.disputeTable  = 'x_1994889_csit440_gift_card_dispute';
        this.scoreLogTable = 'x_1994889_csit440_fraud_score_log';
    },

    /**
     * Main entry point — calculate risk for a dispute GlideRecord
     * @param {GlideRecord} dispute  The dispute record (from Business Rule: current)
     * @returns {Object} { risk_score, risk_level, factors, reasoning }
     */
    score: function(dispute) {
        var riskScore = 0;
        var factors   = {};

        // ── FACTOR 1: FRAUD AMOUNT ──────────────────────────
        var exBal    = parseFloat(dispute.expected_balance.toString()) || 0;
        var rpBal    = parseFloat(dispute.reported_balance.toString()) || 0;
        var fraudAmt = (exBal > rpBal) ? (exBal - rpBal) : (parseFloat(dispute.fraud_amount.toString()) || 0);

        var amtScore = 0;
        if      (fraudAmt >= 1000) { amtScore = 35; factors.amount = 'Large amount ($1000+): +35'; }
        else if (fraudAmt >= 500)  { amtScore = 25; factors.amount = 'High amount ($500-999): +25'; }
        else if (fraudAmt >= 200)  { amtScore = 15; factors.amount = 'Medium amount ($200-499): +15'; }
        else if (fraudAmt >= 50)   { amtScore = 8;  factors.amount = 'Small amount ($50-199): +8'; }
        else                        { amtScore = 0;  factors.amount = 'Very small (<$50): +0'; }
        riskScore += amtScore;

        // ── FACTOR 2: EVIDENCE QUALITY ──────────────────────
        var evType  = (dispute.evidence_type.toString() || '').toLowerCase();
        var evScore = 0;

        if (!evType || evType === 'none' || evType === '') {
            evScore = 30; factors.evidence = 'No evidence provided: +30';
        } else if (evType === 'receipt') {
            evScore = 0;  factors.evidence = 'Receipt PDF (best): +0';
        } else if (evType === 'bank_statement') {
            evScore = 8;  factors.evidence = 'Bank statement: +8';
        } else if (evType === 'email_confirmation') {
            evScore = 5;  factors.evidence = 'Email confirmation: +5';
        } else if (evType === 'screenshot') {
            evScore = 20; factors.evidence = 'Screenshot (can be faked): +20';
        } else {
            evScore = 25; factors.evidence = 'Unknown evidence type: +25';
        }
        riskScore += evScore;

        // ── FACTOR 3: TIME-BASED RISK ────────────────────────
        var timeScore = 0;
        var txDate = dispute.transaction_date.toString();
        if (txDate && txDate.length >= 13) {
            try {
                var hourStr = txDate.substring(11, 13);
                var hour = parseInt(hourStr, 10);
                if (hour >= 23 || hour <= 5) {
                    timeScore = 12; factors.time = 'Late night (11PM-5AM): +12';
                } else if (hour <= 7 || hour >= 22) {
                    timeScore = 5;  factors.time = 'Unusual hours: +5';
                } else {
                    factors.time = 'Normal business hours: +0';
                }
            } catch(te) {
                factors.time = 'Date parse error: +0';
            }
        }
        riskScore += timeScore;

        // ── FACTOR 4: VOLUME / CARD HISTORY ─────────────────
        var volScore = 0;
        var maskedCard = dispute.gift_card_number.toString();
        if (maskedCard && maskedCard.length >= 4) {
            var lastFour = maskedCard.slice(-4);
            var monthAgo = gs.dateAdd(gs.now(), -30, 'day');
            var volGR = new GlideRecord(this.disputeTable);
            volGR.addQuery('gift_card_number', 'ENDSWITH', lastFour);
            volGR.addQuery('sys_created_on', '>=', monthAgo);
            volGR.addQuery('sys_id', '!=', dispute.sys_id);
            volGR.query();
            var cnt = volGR.getRowCount();

            if      (cnt >= 5) { volScore = 30; factors.volume = 'Pattern fraud (5+ disputes/30d): +30'; }
            else if (cnt >= 3) { volScore = 20; factors.volume = 'Multiple disputes (3+/30d): +20'; }
            else if (cnt >= 1) { volScore = 10; factors.volume = 'Prior dispute on card: +10'; }
            else                { factors.volume = 'First dispute: +0'; }
        }
        riskScore += volScore;

        // ── FACTOR 5: ACCOUNT AGE ────────────────────────────
        var acctScore = 0;
        var email = dispute.customer_email.toString();
        if (email) {
            var uGR = new GlideRecord('sys_user');
            uGR.addQuery('email', email);
            uGR.setLimit(1);
            uGR.query();
            if (uGR.next()) {
                var created = uGR.sys_created_on.toString();
                var ageDays = gs.dateDiff(created, gs.now(), true) / 86400000;
                if      (ageDays < 7)  { acctScore = 25; factors.account = 'Very new (<7 days): +25'; }
                else if (ageDays < 30) { acctScore = 15; factors.account = 'New account (<30d): +15'; }
                else if (ageDays < 90) { acctScore = 5;  factors.account = 'Relatively new (<90d): +5'; }
                else                   { factors.account = 'Established account: +0'; }
            } else {
                acctScore = 10; factors.account = 'Customer not found in system: +10';
            }
        }
        riskScore += acctScore;

        // ── FACTOR 6: DESCRIPTION NLP ────────────────────────
        var descScore = 0;
        var desc = (dispute.dispute_description.toString() || '').toLowerCase();
        var highRiskKw = ['hacked', 'stolen', 'unauthorized', 'compromised', 'scammed', 'drained', 'phished'];
        var kwMatches = 0;
        for (var i = 0; i < highRiskKw.length; i++) {
            if (desc.indexOf(highRiskKw[i]) > -1) kwMatches++;
        }
        if      (kwMatches >= 2)  { descScore = 15; factors.description = 'Multiple fraud keywords: +15'; }
        else if (kwMatches === 1) { descScore = 8;  factors.description = 'Fraud keyword detected: +8'; }
        else if (desc.length < 20){ descScore = 10; factors.description = 'Vague/brief description: +10'; }
        else                       { factors.description = 'Detailed description: +0'; }
        riskScore += descScore;

        // ── CAP + LEVEL ──────────────────────────────────────
        riskScore = Math.min(Math.max(riskScore, 0), 100);

        var riskLevel = 'low';
        if      (riskScore >= 80) riskLevel = 'critical';
        else if (riskScore >= 60) riskLevel = 'high';
        else if (riskScore >= 40) riskLevel = 'medium';

        var reasoning = [];
        for (var k in factors) { reasoning.push(factors[k]); }

        return {
            risk_score:   riskScore,
            risk_level:   riskLevel,
            factors:      factors,
            fraud_amount: fraudAmt,
            reasoning:    reasoning.join(' | ')
        };
    },

    /**
     * Log scoring result to the Fraud Score Log table
     */
    logScore: function(disputeSysId, result) {
        try {
            var logGR = new GlideRecord(this.scoreLogTable);
            logGR.initialize();
            logGR.gift_card_dispute = disputeSysId;
            logGR.scoring_time      = new GlideDateTime();
            logGR.risk_score        = result.risk_score;
            logGR.ai_service_used   = 'GiftGuard Rule-Based Engine v1.0';
            logGR.input_factors     = JSON.stringify(result.factors);
            logGR.reasoning         = result.reasoning;
            logGR.insert();
        } catch(e) {
            gs.error('[GiftGuard] Scoring log error: ' + e.message);
        }
    },

    type: 'GiftGuardFraudScorer'
};
