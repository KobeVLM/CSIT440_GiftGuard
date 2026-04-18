// ============================================================
// CLIENT SCRIPT 2: BALANCE CHECKER (onLoad)
// ============================================================
// ServiceNow Settings:
//   Name:    GiftGuard - Balance Checker Button
//   Table:   x_[prefix]_giftguard_gift_card_dispute
//   UI Type: Desktop
//   Type:    onLoad
//   Active:  CHECKED ✓
//
// NOTE: This client script adds a "Check Balance" button to the
// form header. When clicked, it calls a Script Include via
// GlideAjax to simulate a balance check API call and updates
// the reported_balance field.
//
// COPY EVERYTHING BELOW THIS LINE into the "Script" field:
// ============================================================

function onLoad() {
    // Only add button when creating a new record or when card number is present
    var cardNum = g_form.getValue('u_gift_card_number');

    // Inject the Check Balance button into the form
    injectBalanceCheckButton();

    // Make fraud_amount read-only — it's auto-calculated
    g_form.setReadOnly('u_fraud_amount', true);

    // Make risk fields always read-only (set by Business Rule)
    g_form.setReadOnly('u_risk_score', true);
    g_form.setReadOnly('u_risk_level', true);
    g_form.setReadOnly('u_sla_target', true);
}

/**
 * Injects a "Check Balance" button below the gift card number field.
 * Uses ServiceNow's GlideAjax to call the server-side balance check.
 */
function injectBalanceCheckButton() {
    // Check if button already exists
    if (document.getElementById('gg_check_balance_btn')) return;

    // Build button
    var btn = document.createElement('button');
    btn.id        = 'gg_check_balance_btn';
    btn.type      = 'button';
    btn.innerHTML = '&#128179; Check Live Balance';
    btn.title     = 'Click to fetch current balance from the gift card issuer';
    btn.style.cssText = [
        'margin: 8px 0 0 4px',
        'padding: 6px 14px',
        'background: #0272a2',
        'color: #fff',
        'border: none',
        'border-radius: 4px',
        'cursor: pointer',
        'font-size: 13px'
    ].join(';');

    btn.onclick = function() { checkGiftCardBalance(); };

    // Try to inject after the gift_card_number field cell
    var fieldCell = gel('element.u_gift_card_number');
    if (fieldCell) {
        fieldCell.parentNode.appendChild(btn);
    } else {
        // Fallback: add to form header area if field cell not found
        var header = document.querySelector('.form-group') || document.body;
        header.appendChild(btn);
    }
}

/**
 * Performs a GlideAjax call to the server-side Script Include to
 * simulate fetching a balance. Updates the reported_balance field.
 */
function checkGiftCardBalance() {
    var cardNum = g_form.getValue('u_gift_card_number');
    var issuer  = g_form.getValue('u_gift_card_issuer_display') || g_form.getValue('u_gift_card_issuer');

    if (!cardNum) {
        g_form.showFieldMsg('u_gift_card_number', 'Please enter a gift card number first.', 'error');
        return;
    }

    // Show loading state
    var btn = document.getElementById('gg_check_balance_btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '&#8987; Checking...';
    }

    // Call server-side Script Include via GlideAjax
    var ga = new GlideAjax('GiftGuardBalanceChecker');
    ga.addParam('sysparm_name', 'checkBalance');
    ga.addParam('sysparm_card_number', cardNum);
    ga.addParam('sysparm_issuer', issuer || '');

    ga.getXMLAnswer(function(response) {
        // Re-enable button
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '&#128179; Check Live Balance';
        }

        try {
            var result = JSON.parse(response);
            if (result.success) {
                g_form.setValue('u_reported_balance', result.balance);
                g_form.hideFieldMsg('u_gift_card_number', true);
                alert('Current balance fetched: $' + result.balance + '\n\nThe "Reported Balance" field has been updated.');
            } else {
                alert('Balance check returned an error:\n' + result.message
                    + '\n\nPlease enter the balance manually.');
            }
        } catch(e) {
            alert('Could not parse balance response. Please enter balance manually.\n\nRaw response: ' + response);
        }
    });
}
