import React, { useState } from 'react'
import { DisputeService } from '../services/DisputeService'
import './DisputeStatus.css'

const service = new DisputeService()

const STATUS_CONFIG = {
    new:          { label: 'Received',       color: '#4fc3f7', icon: '📥' },
    under_review: { label: 'Under Review',   color: '#ffa726', icon: '🔍' },
    escalated:    { label: 'Escalated',      color: '#ef5350', icon: '⚠️' },
    approved:     { label: 'Approved ✓',    color: '#66bb6a', icon: '✅' },
    rejected:     { label: 'Rejected',       color: '#ef5350', icon: '❌' },
    closed:       { label: 'Closed',         color: '#90a4ae', icon: '🔒' },
}

const RISK_CONFIG = {
    low:      { label: 'Low',      color: '#66bb6a', bg: 'rgba(102,187,106,0.12)' },
    medium:   { label: 'Medium',   color: '#ffa726', bg: 'rgba(255,167,38,0.12)' },
    high:     { label: 'High',     color: '#ef5350', bg: 'rgba(239,83,80,0.12)' },
    critical: { label: 'Critical', color: '#f44336', bg: 'rgba(244,67,54,0.15)' },
}

export default function DisputeStatus() {
    const [query,   setQuery]   = useState('')
    const [dispute, setDispute] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState(null)
    const [searched, setSearched] = useState(false)

    async function handleSearch(e) {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        setError(null)
        setDispute(null)
        setSearched(true)

        try {
            const result = await service.getByNumber(query.trim())
            setDispute(result)
        } catch (err) {
            setError('Unable to retrieve dispute. Please check the number and try again.')
        } finally {
            setLoading(false)
        }
    }

    const statusCfg = dispute ? (STATUS_CONFIG[dispute.status] || { label: dispute.status, color: '#90a4ae', icon: '📋' }) : null
    const riskCfg   = dispute ? (RISK_CONFIG[dispute.riskLevel] || null) : null

    return (
        <div className="ds-wrap">
            <div className="ds-header">
                <div className="ds-icon">🔍</div>
                <h2 className="ds-title">Check Dispute Status</h2>
                <p className="ds-subtitle">Enter your dispute number to see the latest update on your case</p>
            </div>

            {/* Search */}
            <form className="ds-search-form" onSubmit={handleSearch}>
                <div className="ds-search-row">
                    <input
                        id="dispute-number-input"
                        className="ds-search-input"
                        value={query}
                        onChange={e => setQuery(e.target.value.toUpperCase())}
                        placeholder="e.g. GCD1001"
                        spellCheck={false}
                    />
                    <button className="ds-search-btn" type="submit" disabled={loading || !query.trim()}>
                        {loading ? <span className="ds-spinner" /> : 'Search →'}
                    </button>
                </div>
                <p className="ds-search-hint">
                    Your dispute number was emailed to you when you submitted your report
                </p>
            </form>

            {/* Error */}
            {error && (
                <div className="ds-alert ds-alert--error">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Not found */}
            {searched && !loading && !dispute && !error && (
                <div className="ds-alert ds-alert--info">
                    <span>🔎</span> No dispute found with number <strong>{query}</strong>.
                    Double-check your confirmation email for the correct number.
                </div>
            )}

            {/* Result */}
            {dispute && (
                <div className="ds-result">
                    {/* Status Banner */}
                    <div className="ds-status-banner" style={{ borderColor: statusCfg.color }}>
                        <span className="ds-status-icon">{statusCfg.icon}</span>
                        <div>
                            <p className="ds-status-label">Current Status</p>
                            <p className="ds-status-value" style={{ color: statusCfg.color }}>
                                {statusCfg.label}
                            </p>
                        </div>
                        <div className="ds-dispute-num">{dispute.number}</div>
                    </div>

                    {/* Info grid */}
                    <div className="ds-info-grid">
                        <InfoCard label="Card Issuer"      value={dispute.giftCardIssuer} />
                        <InfoCard label="Card Number"      value={dispute.giftCardNumber} />
                        <InfoCard label="Fraud Amount"     value={`$${parseFloat(dispute.fraudAmount || 0).toFixed(2)}`} highlight />
                        <InfoCard label="Submitted On"     value={dispute.createdOn} />
                        <InfoCard label="SLA Target"       value={dispute.slaTarget || '—'} />
                        <InfoCard label="Decision"         value={dispute.decision || 'Pending'} />
                    </div>

                    {/* Risk score pill */}
                    {riskCfg && (
                        <div className="ds-risk" style={{ background: riskCfg.bg, borderColor: riskCfg.color }}>
                            <span className="ds-risk-label">Fraud Risk Assessment</span>
                            <div className="ds-risk-right">
                                <div className="ds-risk-bar-wrap">
                                    <div className="ds-risk-bar"
                                        style={{ width: `${dispute.riskScore || 0}%`, background: riskCfg.color }} />
                                </div>
                                <span className="ds-risk-score" style={{ color: riskCfg.color }}>
                                    {dispute.riskScore}/100 &mdash; {riskCfg.label}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Decision / Refund */}
                    {dispute.decision === 'approved' && (
                        <div className="ds-alert ds-alert--success">
                            ✅ <strong>Your dispute has been approved!</strong> A refund of{' '}
                            <strong>${parseFloat(dispute.refundAmount || 0).toFixed(2)}</strong> will be processed
                            {dispute.refundDate ? ` by ${dispute.refundDate}` : ' within 3 business days'}.
                        </div>
                    )}

                    {dispute.decision === 'rejected' && (
                        <div className="ds-alert ds-alert--error">
                            ❌ <strong>Dispute rejected.</strong>{' '}
                            {dispute.decisionReason && <span>Reason: {dispute.decisionReason}</span>}
                            <br />You may appeal within 30 days by replying to your confirmation email.
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="ds-timeline">
                        <p className="ds-timeline-title">Case Timeline</p>
                        <TimelineItem done icon="📥" label="Dispute Submitted"       date={dispute.createdOn} />
                        <TimelineItem done={['under_review','escalated','approved','rejected','closed'].includes(dispute.status)}
                            icon="🔍" label="Under Review" date="" />
                        <TimelineItem done={['escalated','approved','rejected','closed'].includes(dispute.status)}
                            icon="👤" label="Analyst Assigned" date="" />
                        <TimelineItem done={['approved','rejected','closed'].includes(dispute.status)}
                            icon="⚖️" label="Decision Made" date={dispute.decisionDate} />
                        <TimelineItem done={dispute.status === 'closed'}
                            icon="🔒" label="Case Closed" date="" />
                    </div>
                </div>
            )}
        </div>
    )
}

function InfoCard({ label, value, highlight }) {
    return (
        <div className="ds-info-card">
            <span className="ds-info-label">{label}</span>
            <span className={`ds-info-value ${highlight ? 'ds-info-value--highlight' : ''}`}>{value || '—'}</span>
        </div>
    )
}

function TimelineItem({ done, icon, label, date }) {
    return (
        <div className={`ds-tl-item ${done ? 'done' : ''}`}>
            <div className="ds-tl-dot">{done ? '✓' : icon}</div>
            <div className="ds-tl-content">
                <span className="ds-tl-label">{label}</span>
                {date && <span className="ds-tl-date">{date}</span>}
            </div>
        </div>
    )
}
