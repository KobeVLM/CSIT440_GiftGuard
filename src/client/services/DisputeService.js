/**
 * DisputeService.js
 * Handles all REST API calls to the GiftGuard dispute table.
 * Table: x_1994889_csit440_gift_card_dispute
 *
 * NOTE: Fields in this scoped app do NOT have the u_ prefix —
 * they were created natively in the scoped app's own table.
 */

const TABLE = 'x_1994889_csit440_gift_card_dispute'

const FIELDS = [
    'sys_id',
    'number',
    'customer_name',
    'customer_email',
    'customer_phone',
    'gift_card_number',
    'gift_card_issuer',
    'expected_balance',
    'reported_balance',
    'fraud_amoun0',
    'transaction_dat0',
    'dispute_description',
    'evidence_type',
    'risk_score',
    'risk_level',
    'status',
    'decision',
    'decision_reason',
    'decision_date',
    'assigned_analyst',
    'refund_amount',
    'refund_date',
    'sla_target',
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
            customer_name:        data.customerName,
            customer_email:       data.customerEmail,
            customer_phone:       data.customerPhone || '',
            gift_card_number:     data.giftCardNumber,
            gift_card_issuer:     data.giftCardIssuer,
            expected_balance:     data.expectedBalance,
            reported_balance:     data.reportedBalance,
            fraud_amoun0:         (parseFloat(data.expectedBalance) - parseFloat(data.reportedBalance)).toFixed(2),
            transaction_dat0:     data.transactionDate,
            dispute_description:  data.description,
            evidence_type:        data.evidenceType || 'none',
            status:               'new',
            decision:             'pending',
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
        customerName:    val(raw.customer_name),
        customerEmail:   val(raw.customer_email),
        customerPhone:   val(raw.customer_phone),
        giftCardNumber:  val(raw.gift_card_number),
        giftCardIssuer:  val(raw.gift_card_issuer),
        expectedBalance: val(raw.expected_balance),
        reportedBalance: val(raw.reported_balance),
        fraudAmount:     val(raw.fraud_amoun0),
        transactionDate: val(raw.transaction_dat0),
        description:     val(raw.dispute_description),
        evidenceType:    val(raw.evidence_type),
        riskScore:       val(raw.risk_score),
        riskLevel:       val(raw.risk_level),
        status:          val(raw.status),
        decision:        val(raw.decision),
        decisionReason:  val(raw.decision_reason),
        decisionDate:    val(raw.decision_date),
        assignedAnalyst: val(raw.assigned_analyst),
        refundAmount:    val(raw.refund_amount),
        refundDate:      val(raw.refund_date),
        slaTarget:       val(raw.sla_target),
        createdOn:       val(raw.sys_created_on),
    }
}
