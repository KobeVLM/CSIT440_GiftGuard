/**
 * DisputeService.js
 * Handles all REST API calls to the GiftGuard dispute table.
 * Table: x_1994889_csit440_gift_card_dispute
 */

const TABLE = 'x_1994889_csit440_gift_card_dispute'

const FIELDS = [
    'sys_id',
    'number',
    'u_customer_name',
    'u_customer_email',
    'u_customer_phone',
    'u_gift_card_number',
    'u_gift_card_issuer',
    'u_expected_balance',
    'u_reported_balance',
    'u_fraud_amount',
    'u_transaction_date',
    'u_dispute_description',
    'u_evidence_type',
    'u_risk_score',
    'u_risk_level',
    'u_status',
    'u_decision',
    'u_decision_reason',
    'u_decision_date',
    'u_refund_amount',
    'u_refund_date',
    'u_sla_target',
    'sys_created_on',
].join(',')

function getHeaders() {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-UserToken': window.g_ck || '',
    }
}

function val(field) {
    if (!field) return ''
    if (typeof field === 'object') {
        return field.display_value ?? field.value ?? ''
    }
    return field
}

export class DisputeService {
    /**
     * List all disputes (analyst view — ordered newest first)
     */
    async list(query = '') {
        const params = new URLSearchParams({
            sysparm_display_value: 'all',
            sysparm_fields: FIELDS,
            sysparm_query: query || 'ORDERBYDESCsys_created_on',
            sysparm_limit: '100',
        })

        const res = await fetch(`/api/now/table/${TABLE}?${params}`, {
            method: 'GET',
            headers: getHeaders(),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const { result } = await res.json()
        return (result || []).map(normalizeDispute)
    }

    /**
     * Get a single dispute by sys_id
     */
    async get(sysId) {
        const params = new URLSearchParams({ sysparm_display_value: 'all' })
        const res = await fetch(`/api/now/table/${TABLE}/${sysId}?${params}`, {
            method: 'GET',
            headers: getHeaders(),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const { result } = await res.json()
        return normalizeDispute(result)
    }

    /**
     * Look up a dispute by its dispute number (e.g. GCD1001)
     */
    async getByNumber(disputeNumber) {
        const clean = disputeNumber.trim().toUpperCase()
        const params = new URLSearchParams({
            sysparm_display_value: 'all',
            sysparm_fields: FIELDS,
            sysparm_query: `number=${clean}`,
            sysparm_limit: '1',
        })

        const res = await fetch(`/api/now/table/${TABLE}?${params}`, {
            method: 'GET',
            headers: getHeaders(),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const { result } = await res.json()
        if (!result || result.length === 0) return null
        return normalizeDispute(result[0])
    }

    /**
     * Submit a new dispute (customer)
     */
    async create(data) {
        const payload = {
            u_customer_name:        data.customerName,
            u_customer_email:       data.customerEmail,
            u_customer_phone:       data.customerPhone || '',
            u_gift_card_number:     data.giftCardNumber,
            u_gift_card_issuer:     data.giftCardIssuer,
            u_expected_balance:     data.expectedBalance,
            u_reported_balance:     data.reportedBalance,
            u_fraud_amount:         (parseFloat(data.expectedBalance) - parseFloat(data.reportedBalance)).toFixed(2),
            u_transaction_date:     data.transactionDate,
            u_dispute_description:  data.description,
            u_evidence_type:        data.evidenceType || 'none',
            u_status:               'new',
            u_decision:             'pending',
        }

        const res = await fetch(`/api/now/table/${TABLE}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const { result } = await res.json()
        return normalizeDispute(result)
    }

    /**
     * Update a dispute (analyst — decision, status, etc.)
     */
    async update(sysId, data) {
        const res = await fetch(`/api/now/table/${TABLE}/${sysId}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const { result } = await res.json()
        return normalizeDispute(result)
    }
}

/**
 * Normalizes the ServiceNow REST response (display_value/value objects)
 * into flat, usable strings for the React components.
 */
function normalizeDispute(raw) {
    if (!raw) return null
    return {
        sysId:           val(raw.sys_id),
        number:          val(raw.number),
        customerName:    val(raw.u_customer_name),
        customerEmail:   val(raw.u_customer_email),
        customerPhone:   val(raw.u_customer_phone),
        giftCardNumber:  val(raw.u_gift_card_number),
        giftCardIssuer:  val(raw.u_gift_card_issuer),
        expectedBalance: val(raw.u_expected_balance),
        reportedBalance: val(raw.u_reported_balance),
        fraudAmount:     val(raw.u_fraud_amount),
        transactionDate: val(raw.u_transaction_date),
        description:     val(raw.u_dispute_description),
        evidenceType:    val(raw.u_evidence_type),
        riskScore:       val(raw.u_risk_score),
        riskLevel:       val(raw.u_risk_level),
        status:          val(raw.u_status),
        decision:        val(raw.u_decision),
        decisionReason:  val(raw.u_decision_reason),
        decisionDate:    val(raw.u_decision_date),
        refundAmount:    val(raw.u_refund_amount),
        refundDate:      val(raw.u_refund_date),
        slaTarget:       val(raw.u_sla_target),
        createdOn:       val(raw.sys_created_on),
    }
}
