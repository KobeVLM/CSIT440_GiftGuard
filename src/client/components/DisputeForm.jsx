import React, { useState } from 'react'
import './DisputeForm.css'

const EVIDENCE_OPTIONS = [
    { value: 'none',               label: 'No Evidence Available' },
    { value: 'receipt',            label: 'Receipt (PDF/Image)' },
    { value: 'bank_statement',     label: 'Bank Statement' },
    { value: 'email_confirmation', label: 'Email Confirmation' },
    { value: 'screenshot',         label: 'Screenshot' },
    { value: 'other',              label: 'Other' },
]

const ISSUERS = [
    'Amazon', 'Apple', 'Best Buy', 'eBay', 'Google Play',
    'Home Depot', 'iTunes', 'Macy\'s', 'Netflix', 'Nike',
    'PlayStation', 'Starbucks', 'Steam', 'Target', 'Walmart',
    'Xbox', 'Other',
]

const EMPTY = {
    customerName:    '',
    customerEmail:   '',
    customerPhone:   '',
    giftCardNumber:  '',
    giftCardIssuer:  '',
    expectedBalance: '',
    reportedBalance: '',
    transactionDate: '',
    description:     '',
    evidenceType:    'none',
}

export default function DisputeForm({ onSubmit, onCancel, submitting }) {
    const [form, setForm]     = useState(EMPTY)
    const [errors, setErrors] = useState({})
    const [step, setStep]     = useState(1) // 1 = info, 2 = details, 3 = review

    const fraudAmount = (() => {
        const exp = parseFloat(form.expectedBalance)
        const rep = parseFloat(form.reportedBalance)
        if (!isNaN(exp) && !isNaN(rep) && exp > rep) return (exp - rep).toFixed(2)
        return null
    })()

    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    function validate(fields) {
        const e = {}
        if (fields.includes('customerName')    && !form.customerName.trim())
            e.customerName    = 'Full name is required'
        if (fields.includes('customerEmail')) {
            if (!form.customerEmail.trim())
                e.customerEmail = 'Email is required'
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
                e.customerEmail = 'Invalid email format'
        }
        if (fields.includes('customerPhone') && form.customerPhone) {
            const digits = form.customerPhone.replace(/\D/g, '')
            if (digits.length < 7) e.customerPhone = 'Phone must be at least 7 digits'
        }
        if (fields.includes('giftCardNumber') && !form.giftCardNumber.trim())
            e.giftCardNumber  = 'Gift card number is required'
        if (fields.includes('giftCardIssuer') && !form.giftCardIssuer)
            e.giftCardIssuer  = 'Please select an issuer'
        if (fields.includes('expectedBalance')) {
            if (!form.expectedBalance) e.expectedBalance = 'Expected balance is required'
            else if (parseFloat(form.expectedBalance) <= 0) e.expectedBalance = 'Must be greater than 0'
        }
        if (fields.includes('reportedBalance')) {
            if (form.reportedBalance === '') e.reportedBalance = 'Current balance is required'
            else if (parseFloat(form.reportedBalance) >= parseFloat(form.expectedBalance))
                e.reportedBalance = 'Must be less than expected balance'
        }
        if (fields.includes('transactionDate') && !form.transactionDate)
            e.transactionDate = 'Date is required'
        if (fields.includes('description') && form.description.trim().length < 20)
            e.description     = 'Please provide at least 20 characters describing what happened'
        return e
    }

    function nextStep() {
        const stepFields = {
            1: ['customerName', 'customerEmail', 'customerPhone'],
            2: ['giftCardNumber', 'giftCardIssuer', 'expectedBalance', 'reportedBalance', 'transactionDate', 'description'],
        }
        const e = validate(stepFields[step] || [])
        if (Object.keys(e).length > 0) { setErrors(e); return }
        setStep(s => s + 1)
    }

    function handleSubmit(e) {
        e.preventDefault()
        const all = Object.keys(EMPTY)
        const e2 = validate(all)
        if (Object.keys(e2).length > 0) { setErrors(e2); setStep(1); return }
        onSubmit(form)
    }

    const field = (label, child, error, hint) => (
        <div className={`gg-field ${error ? 'gg-field--error' : ''}`}>
            <label className="gg-label">{label}</label>
            {child}
            {error && <span className="gg-error">{error}</span>}
            {hint  && !error && <span className="gg-hint">{hint}</span>}
        </div>
    )

    return (
        <div className="gg-form-wrap">
            {/* ── Progress bar ── */}
            <div className="gg-steps">
                {['Your Info', 'Dispute Details', 'Review'].map((label, i) => (
                    <div key={i} className={`gg-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
                        <div className="gg-step-circle">{step > i + 1 ? '✓' : i + 1}</div>
                        <span className="gg-step-label">{label}</span>
                    </div>
                ))}
            </div>

            <form className="gg-form" onSubmit={handleSubmit} noValidate>

                {/* ── STEP 1: Customer Info ── */}
                {step === 1 && (
                    <div className="gg-section">
                        <h3 className="gg-section-title">Your Contact Information</h3>
                        {field('Full Name *',
                            <input className="gg-input" value={form.customerName}
                                onChange={e => set('customerName', e.target.value)}
                                placeholder="e.g. Jane Smith" />,
                            errors.customerName
                        )}
                        {field('Email Address *',
                            <input className="gg-input" type="email" value={form.customerEmail}
                                onChange={e => set('customerEmail', e.target.value)}
                                placeholder="you@email.com" />,
                            errors.customerEmail
                        )}
                        {field('Phone Number',
                            <input className="gg-input" type="tel" value={form.customerPhone}
                                onChange={e => set('customerPhone', e.target.value)}
                                placeholder="+1 (555) 000-0000" />,
                            errors.customerPhone,
                            'Optional — helps us reach you faster'
                        )}
                    </div>
                )}

                {/* ── STEP 2: Dispute Details ── */}
                {step === 2 && (
                    <div className="gg-section">
                        <h3 className="gg-section-title">Gift Card & Fraud Details</h3>

                        <div className="gg-row">
                            {field('Gift Card Number *',
                                <input className="gg-input" value={form.giftCardNumber}
                                    onChange={e => set('giftCardNumber', e.target.value)}
                                    placeholder="Card number (will be masked on submit)" />,
                                errors.giftCardNumber,
                                'Enter the full number — it will be masked to last 4 digits'
                            )}
                            {field('Card Issuer / Brand *',
                                <select className="gg-input gg-select" value={form.giftCardIssuer}
                                    onChange={e => set('giftCardIssuer', e.target.value)}>
                                    <option value="">Select issuer...</option>
                                    {ISSUERS.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>,
                                errors.giftCardIssuer
                            )}
                        </div>

                        <div className="gg-row">
                            {field('Original/Expected Balance ($) *',
                                <input className="gg-input" type="number" min="0.01" step="0.01"
                                    value={form.expectedBalance}
                                    onChange={e => set('expectedBalance', e.target.value)}
                                    placeholder="100.00" />,
                                errors.expectedBalance,
                                'What should your balance have been?'
                            )}
                            {field('Current Balance You See ($) *',
                                <input className="gg-input" type="number" min="0" step="0.01"
                                    value={form.reportedBalance}
                                    onChange={e => set('reportedBalance', e.target.value)}
                                    placeholder="0.00" />,
                                errors.reportedBalance,
                                'What balance is showing now?'
                            )}
                        </div>

                        {fraudAmount && (
                            <div className="gg-fraud-calc">
                                <span className="gg-fraud-label">Calculated Fraud Amount:</span>
                                <span className="gg-fraud-amount">${fraudAmount}</span>
                            </div>
                        )}

                        {field('Date You Noticed the Fraud *',
                            <input className="gg-input" type="date" value={form.transactionDate}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={e => set('transactionDate', e.target.value)} />,
                            errors.transactionDate
                        )}

                        {field('Describe What Happened *',
                            <textarea className="gg-input gg-textarea" rows={5}
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                placeholder="Describe the fraud in detail. When did it happen? How did you notice? Have you used the card recently? Any suspicious activity?" />,
                            errors.description,
                            `${form.description.length} chars (min 20)`
                        )}

                        {field('Type of Evidence You Have',
                            <div className="gg-evidence-grid">
                                {EVIDENCE_OPTIONS.map(opt => (
                                    <label key={opt.value}
                                        className={`gg-evidence-card ${form.evidenceType === opt.value ? 'selected' : ''}`}>
                                        <input type="radio" name="evidenceType" value={opt.value}
                                            checked={form.evidenceType === opt.value}
                                            onChange={() => set('evidenceType', opt.value)} />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>,
                            errors.evidenceType,
                            'You can upload actual files after submission via email'
                        )}
                    </div>
                )}

                {/* ── STEP 3: Review ── */}
                {step === 3 && (
                    <div className="gg-section">
                        <h3 className="gg-section-title">Review Your Dispute</h3>
                        <div className="gg-review-grid">
                            <ReviewRow label="Name"              value={form.customerName} />
                            <ReviewRow label="Email"             value={form.customerEmail} />
                            <ReviewRow label="Phone"             value={form.customerPhone || '—'} />
                            <ReviewRow label="Card Issuer"       value={form.giftCardIssuer} />
                            <ReviewRow label="Card Number"       value={`****-****-****-${form.giftCardNumber.slice(-4)}`} />
                            <ReviewRow label="Expected Balance"  value={`$${parseFloat(form.expectedBalance).toFixed(2)}`} />
                            <ReviewRow label="Current Balance"   value={`$${parseFloat(form.reportedBalance).toFixed(2)}`} />
                            <ReviewRow label="Fraud Amount"      value={fraudAmount ? `$${fraudAmount}` : '—'} highlight />
                            <ReviewRow label="Date"              value={form.transactionDate} />
                            <ReviewRow label="Evidence"         value={EVIDENCE_OPTIONS.find(o => o.value === form.evidenceType)?.label} />
                        </div>
                        <div className="gg-review-desc">
                            <p className="gg-label">Description</p>
                            <p className="gg-review-desc-text">{form.description}</p>
                        </div>
                        <div className="gg-disclaimer">
                            By submitting you confirm this information is accurate to the best of your knowledge.
                            Fraudulent claims may result in account suspension.
                        </div>
                    </div>
                )}

                {/* ── Navigation ── */}
                <div className="gg-form-actions">
                    {step > 1 && (
                        <button type="button" className="gg-btn gg-btn--ghost"
                            onClick={() => setStep(s => s - 1)}>
                            ← Back
                        </button>
                    )}
                    <button type="button" className="gg-btn gg-btn--ghost" onClick={onCancel}>
                        Cancel
                    </button>
                    {step < 3 ? (
                        <button type="button" className="gg-btn gg-btn--primary" onClick={nextStep}>
                            Next Step →
                        </button>
                    ) : (
                        <button type="submit" className="gg-btn gg-btn--submit" disabled={submitting}>
                            {submitting ? (
                                <><span className="gg-spinner" /> Submitting...</>
                            ) : (
                                '🛡 Submit Dispute'
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

function ReviewRow({ label, value, highlight }) {
    return (
        <div className="gg-review-row">
            <span className="gg-review-label">{label}</span>
            <span className={`gg-review-value ${highlight ? 'gg-review-value--highlight' : ''}`}>{value}</span>
        </div>
    )
}
