// ============================================================
// UI ACTION 4: CHECK BALANCE NOW (Integration Hub Demo)
// ============================================================
// ServiceNow Settings:
//   Name:         Check Card Balance
//   Table:        x_[prefix]_giftguard_gift_card_dispute
//   Action name:  check_balance
//   Form button:  CHECKED ✓
//   Active:       CHECKED ✓
//   Isolation:    CHECKED ✓
//
//   Condition:
//   gs.hasRole('giftguard_analyst') || gs.hasRole('giftguard_manager') || gs.hasRole('giftguard_admin')
//
// NOTE: This simulates calling the Integration Hub / external API.
// In production it would call a real balance-check endpoint.
// For the capstone demo this shows the Integration Hub concept works.
//
// COPY below into the "Script" field:
// ============================================================

var cardNumber = current.u_gift_card_number.toString();
var issuer     = current.u_gift_card_issuer.getDisplayValue() || 'Unknown Issuer';
var startTime  = new Date().getTime();

// ── Simulate Integration Hub / REST call ────────────────────
// In production: call an IntegrationHub action or REST Message.
// For demo: we call a mock endpoint OR use rule-based calculation.

var balanceResult = {
    success: false,
    balance: 0,
    message: '',
    responseTime: 0
};

try {
    // ── OPTION A: Real REST call (uncomment when API key is available)
    /*
    var rm = new sn_ws.RESTMessageV2('GiftGuard_BalanceCheck', 'get');
    rm.setStringParameterNoEscape('card_number', cardNumber);
    rm.setStringParameterNoEscape('issuer', issuer);
    var response = rm.execute();
    var httpStatus = response.getStatusCode();

    if (httpStatus === 200) {
        var body = JSON.parse(response.getBody());
        balanceResult.success = true;
        balanceResult.balance = body.balance || 0;
        balanceResult.message = 'Live balance retrieved successfully.';
    } else {
        balanceResult.message = 'API returned status: ' + httpStatus;
    }
    */

    // ── OPTION B: Mock/Simulated balance (for demo purposes) ──
    // This demonstrates that the button works and Integration Hub
    // concept is implemented. Show integration logs in demo.
    var mockBalance = (Math.random() * 20).toFixed(2); // Simulate a near-zero balance (fraud scenario)
    balanceResult.success = true;
    balanceResult.balance = parseFloat(mockBalance);
    balanceResult.message = '[DEMO] Balance fetched via Integration Hub. In production, this connects to the issuer\'s API.';

} catch (restErr) {
    balanceResult.success  = false;
    balanceResult.message  = 'REST call failed: ' + restErr.message;
}

var endTime = new Date().getTime();
balanceResult.responseTime = endTime - startTime;

// ── Write to Balance Check History table ────────────────────
var tblPrefix = 'x_' + gs.getProperty('glide.appcreator.company.code') + '_giftguard_';
var balGR = new GlideRecord(tblPrefix + 'balance_check');
balGR.initialize();
balGR.u_gift_card_dispute  = current.sys_id;
balGR.u_balance_check_time = new GlideDateTime();
balGR.u_balance_returned   = balanceResult.balance;
balGR.u_api_response_time  = balanceResult.responseTime;
balGR.u_api_status         = balanceResult.success ? 'success' : 'failed';
balGR.u_api_error_message  = balanceResult.message;
balGR.insert();

// ── Update reported_balance on dispute ───────────────────────
if (balanceResult.success) {
    current.u_reported_balance = balanceResult.balance;

    // Recalculate fraud amount
    var exp = parseFloat(current.u_expected_balance.toString()) || 0;
    if (exp > balanceResult.balance) {
        current.u_fraud_amount = (exp - balanceResult.balance).toFixed(2);
    }

    current.update();

    current.addWorkNotes('Balance checked by ' + gs.getUserDisplayName()
        + '. Live balance: $' + balanceResult.balance
        + ' (response time: ' + balanceResult.responseTime + 'ms).\n'
        + balanceResult.message);

    gs.info('[GiftGuard] Balance check OK for ' + current.number + ': $' + balanceResult.balance);

} else {
    current.addWorkNotes('Balance check FAILED: ' + balanceResult.message);
    gs.warn('[GiftGuard] Balance check failed for ' + current.number + ': ' + balanceResult.message);
}

action.setRedirectURL(current);
