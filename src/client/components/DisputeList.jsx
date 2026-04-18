import React, { useState } from 'react'
import './DisputeList.css'

const STATUS_COLORS = {
    new:          '#4fc3f7',
    under_review: '#ffa726',
    escalated:    '#ef5350',
    approved:     '#66bb6a',
    rejected:     '#ef5350',
    closed:       '#78909c',
}

const RISK_COLORS = {
    low:      '#66bb6a',
    medium:   '#ffa726',
    high:     '#ef5350',
    critical: '#f44336',
}

export default function DisputeList({ disputes, onRefresh, loading }) {
    const [filter, setFilter] = useState('all')
    const [sort,   setSort]   = useState('date_desc')
    const [expanded, setExpanded] = useState(null)

    const filtered = disputes
        .filter(d => filter === 'all' || d.status === filter || d.riskLevel === filter)
        .sort((a, b) => {
            if (sort === 'date_desc')  return new Date(b.createdOn) - new Date(a.createdOn)
            if (sort === 'date_asc')   return new Date(a.createdOn) - new Date(b.createdOn)
            if (sort === 'risk_desc')  return (parseInt(b.riskScore) || 0) - (parseInt(a.riskScore) || 0)
            if (sort === 'amount_desc')return (parseFloat(b.fraudAmount) || 0) - (parseFloat(a.fraudAmount) || 0)
            return 0
        })

    const stats = {
        total:    disputes.length,
        pending:  disputes.filter(d => d.status === 'new' || d.status === 'under_review').length,
        critical: disputes.filter(d => d.riskLevel === 'critical').length,
        approved: disputes.filter(d => d.status === 'approved').length,
    }

    return (
        <div className="dl-wrap">
            {/* Stats bar */}
            <div className="dl-stats">
                <StatCard label="Total Disputes"      value={stats.total}    color="#4fc3f7" />
                <StatCard label="Pending Review"       value={stats.pending}  color="#ffa726" />
                <StatCard label="Critical Risk"        value={stats.critical} color="#ef5350" />
                <StatCard label="Approved"             value={stats.approved} color="#66bb6a" />
            </div>

            {/* Controls */}
            <div className="dl-controls">
                <div className="dl-filters">
                    {['all','new','under_review','escalated','approved','rejected'].map(f => (
                        <button key={f}
                            className={`dl-filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}>
                            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </button>
                    ))}
                </div>
                <div className="dl-sort-wrap">
                    <select className="dl-sort" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="risk_desc">Highest Risk</option>
                        <option value="amount_desc">Highest Amount</option>
                    </select>
                    <button className="dl-refresh-btn" onClick={onRefresh} disabled={loading} title="Refresh">
                        {loading ? '⟳' : '↺'} Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="dl-empty">
                    <span style={{ fontSize: 32 }}>📂</span>
                    <p>No disputes match the current filter.</p>
                </div>
            ) : (
                <div className="dl-table-wrap">
                    <table className="dl-table">
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Customer</th>
                                <th>Issuer</th>
                                <th>Fraud $</th>
                                <th>Risk</th>
                                <th>Status</th>
                                <th>SLA</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => (
                                <React.Fragment key={d.sysId}>
                                    <tr className={`dl-row ${expanded === d.sysId ? 'expanded' : ''}`}
                                        onClick={() => setExpanded(expanded === d.sysId ? null : d.sysId)}>
                                        <td><code className="dl-num">{d.number}</code></td>
                                        <td>
                                            <div className="dl-customer">
                                                <span className="dl-customer-name">{d.customerName}</span>
                                                <span className="dl-customer-email">{d.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td>{d.giftCardIssuer}</td>
                                        <td className="dl-amount">
                                            ${parseFloat(d.fraudAmount || 0).toFixed(2)}
                                        </td>
                                        <td>
                                            <RiskBadge score={d.riskScore} level={d.riskLevel} />
                                        </td>
                                        <td>
                                            <StatusBadge status={d.status} />
                                        </td>
                                        <td>
                                            <SlaIndicator target={d.slaTarget} status={d.status} />
                                        </td>
                                        <td className="dl-expand-col">
                                            <span className="dl-expand-icon">
                                                {expanded === d.sysId ? '▲' : '▼'}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Expanded detail row */}
                                    {expanded === d.sysId && (
                                        <tr className="dl-detail-row">
                                            <td colSpan={8}>
                                                <div className="dl-detail">
                                                    <div className="dl-detail-grid">
                                                        <DetailItem label="Card Number"   value={d.giftCardNumber} />
                                                        <DetailItem label="Evidence"      value={d.evidenceType} />
                                                        <DetailItem label="Transaction"   value={d.transactionDate} />
                                                        <DetailItem label="Expected Bal." value={`$${parseFloat(d.expectedBalance||0).toFixed(2)}`} />
                                                        <DetailItem label="Current Bal."  value={`$${parseFloat(d.reportedBalance||0).toFixed(2)}`} />
                                                        <DetailItem label="Decision"      value={d.decision} />
                                                        {d.decisionReason && (
                                                            <DetailItem label="Reason" value={d.decisionReason} />
                                                        )}
                                                        {d.refundAmount && d.decision === 'approved' && (
                                                            <DetailItem label="Refund" value={`$${parseFloat(d.refundAmount).toFixed(2)} by ${d.refundDate || 'TBD'}`} />
                                                        )}
                                                    </div>
                                                    <div className="dl-detail-desc">
                                                        <span className="dl-detail-desc-label">Customer Description</span>
                                                        <p className="dl-detail-desc-text">{d.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="dl-count">Showing {filtered.length} of {disputes.length} disputes</p>
        </div>
    )
}

function StatCard({ label, value, color }) {
    return (
        <div className="dl-stat" style={{ borderColor: color }}>
            <span className="dl-stat-value" style={{ color }}>{value}</span>
            <span className="dl-stat-label">{label}</span>
        </div>
    )
}

function RiskBadge({ score, level }) {
    const color = RISK_COLORS[level] || '#90a4ae'
    return (
        <div className="dl-risk-badge">
            <div className="dl-risk-mini-bar-wrap">
                <div className="dl-risk-mini-bar" style={{ width: `${score || 0}%`, background: color }} />
            </div>
            <span style={{ color, fontSize: 11, fontWeight: 700 }}>
                {score || '?'} {level ? `(${level})` : ''}
            </span>
        </div>
    )
}

function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || '#90a4ae'
    const label = (status || '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    return (
        <span className="dl-status-badge" style={{ color, borderColor: color, background: `${color}18` }}>
            {label}
        </span>
    )
}

function SlaIndicator({ target, status }) {
    if (!target || ['approved','rejected','closed'].includes(status)) {
        return <span className="dl-sla dl-sla--done">—</span>
    }
    const now  = new Date()
    const sla  = new Date(target)
    const diff = sla - now
    const days = Math.ceil(diff / 86400000)

    if (days < 0) return <span className="dl-sla dl-sla--breached">BREACHED</span>
    if (days <= 1) return <span className="dl-sla dl-sla--urgent">{days}d left</span>
    return <span className="dl-sla dl-sla--ok">{days}d left</span>
}

function DetailItem({ label, value }) {
    return (
        <div className="dl-detail-item">
            <span className="dl-detail-label">{label}</span>
            <span className="dl-detail-value">{value || '—'}</span>
        </div>
    )
}
