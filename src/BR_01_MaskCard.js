// ============================================================
// BUSINESS RULE 1: MASK GIFT CARD NUMBER
// ============================================================
// ServiceNow Settings (copy these EXACTLY):
//   Name:    GiftGuard - Before Insert - Mask Card Number
//   Table:   x_[prefix]_giftguard_gift_card_dispute
//   When:    before
//   Insert:  CHECKED ✓
//   Update:  UNCHECKED
//   Delete:  UNCHECKED
//   Active:  CHECKED ✓
//   Order:   100
//
// Paste the function below into the "Script" field:
// ============================================================

(function executeRule(current, previous) {
    try {
        var cardNumber = current.u_gift_card_number.toString();

        if (cardNumber && cardNumber.length > 4) {
            // Strip any spaces/dashes, keep only digits
            var digitsOnly = cardNumber.replace(/\D/g, '');

            if (digitsOnly.length > 4) {
                var lastFour = digitsOnly.substring(digitsOnly.length - 4);
                current.u_gift_card_number = '****-****-****-' + lastFour;
            }
        }

    } catch (e) {
        gs.error('[GiftGuard] BR_01 MaskCard Error: ' + e.message);
    }

})(current, previous);
