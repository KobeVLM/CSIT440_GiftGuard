// ============================================================
// CLIENT SCRIPT 1: FORM VALIDATION
// ============================================================
// ServiceNow Settings:
//   Name:    GiftGuard - Form Validation
//   Table:   x_[prefix]_giftguard_gift_card_dispute
//   UI Type: Desktop
//   Type:    onSubmit
//   Active:  CHECKED ✓
//   Inherited: UNCHECKED
//
// COPY EVERYTHING BELOW THIS LINE into the "Script" field:
// ============================================================

function onSubmit() {
    // ── Required field check ────────────────────────────────
    var requiredFields = [
        'u_customer_name',
        'u_customer_email',
        'u_gift_card_number',
        'u_expected_balance',
        'u_reported_balance',
        'u_transaction_date',
        'u_dispute_description'
    ];

    var hasErrors = false;

    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        var val = g_form.getValue(field);
        if (!val || val.trim() === '') {
            g_form.showFieldMsg(field, 'This field is required.', 'error');
            hasErrors = true;
        } else {
            g_form.hideFieldMsg(field, true);
        }
    }

    // ── Email format validation ─────────────────────────────
    var email = g_form.getValue('u_customer_email') || '';
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.trim())) {
        g_form.showFieldMsg('u_customer_email', 'Please enter a valid email address (e.g. name@domain.com).', 'error');
        hasErrors = true;
    }

    // ── Phone format (if provided) ──────────────────────────
    var phone = g_form.getValue('u_customer_phone') || '';
    if (phone) {
        var digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length < 7 || digitsOnly.length > 15) {
            g_form.showFieldMsg('u_customer_phone', 'Phone number must be 7–15 digits.', 'error');
            hasErrors = true;
        }
    }

    // ── Card number length check ────────────────────────────
    var cardNum = g_form.getValue('u_gift_card_number') || '';
    if (cardNum) {
        var cardDigits = cardNum.replace(/\D/g, '');
        if (cardDigits.length < 8 || cardDigits.length > 20) {
            g_form.showFieldMsg('u_gift_card_number', 'Gift card number must be 8–20 digits.', 'error');
            hasErrors = true;
        }
    }

    // ── Balance sanity check ────────────────────────────────
    var expected = parseFloat(g_form.getValue('u_expected_balance')) || 0;
    var reported = parseFloat(g_form.getValue('u_reported_balance')) || 0;

    if (expected > 0 && reported >= expected) {
        g_form.showFieldMsg('u_reported_balance',
            'Reported balance cannot be equal to or greater than expected balance. Fraud amount would be zero or negative.',
            'warning');
        // Don't block submit for this — just warn
    }

    if (expected <= 0 && g_form.getValue('u_expected_balance')) {
        g_form.showFieldMsg('u_expected_balance', 'Expected balance must be greater than zero.', 'error');
        hasErrors = true;
    }

    // ── Auto-calculate fraud amount display ─────────────────
    if (expected > 0 && reported >= 0 && expected > reported) {
        var fraudAmt = (expected - reported).toFixed(2);
        g_form.setValue('u_fraud_amount', fraudAmt);
    }

    // ── Block submission if errors ──────────────────────────
    if (hasErrors) {
        g_form.addErrorMessage('Please fix the highlighted fields before submitting.');
        return false; // Blocks form submission
    }

    return true; // Allow submission
}

// ── onChange: Real-time balance fraud amount calc ───────────
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) return;

    var fieldName = control ? control.id : '';

    if (fieldName === 'u_expected_balance' || fieldName === 'u_reported_balance') {
        var exp = parseFloat(g_form.getValue('u_expected_balance')) || 0;
        var rep = parseFloat(g_form.getValue('u_reported_balance')) || 0;
        if (exp > rep && exp > 0) {
            var fraud = (exp - rep).toFixed(2);
            g_form.setValue('u_fraud_amount', fraud);
            g_form.hideFieldMsg('u_reported_balance', true);
        }
    }

    // Real-time email validation
    if (fieldName === 'u_customer_email') {
        var em = g_form.getValue('u_customer_email') || '';
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (em && !re.test(em)) {
            g_form.showFieldMsg('u_customer_email', 'Invalid email format', 'error');
        } else {
            g_form.hideFieldMsg('u_customer_email', true);
        }
    }
}

// ── onLoad: Hide analyst-only fields from customers ─────────
function onLoad() {
    // If current user has customer role only, hide risk/decision fields
    if (g_user.hasRole('giftguard_customer') && !g_user.hasRole('giftguard_analyst')
        && !g_user.hasRole('giftguard_manager') && !g_user.hasRole('admin')) {

        g_form.setReadOnly('u_risk_score', true);
        g_form.setReadOnly('u_risk_level', true);
        g_form.setReadOnly('u_decision', true);
        g_form.setReadOnly('u_decision_reason', true);
        g_form.setReadOnly('u_decision_date', true);
        g_form.setReadOnly('u_assigned_analyst', true);
        g_form.setReadOnly('u_refund_amount', true);
        g_form.setReadOnly('u_refund_date', true);
        g_form.setReadOnly('u_sla_target', true);

        // Hide the risk section entirely if you have a section called 'Risk Assessment'
        g_form.setSectionDisplay('risk_assessment', false);
    }
}
