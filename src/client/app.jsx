import React, { useState, useEffect, useMemo } from 'react'
import { DisputeService } from './services/DisputeService'
import DisputeForm   from './components/DisputeForm'
import DisputeList   from './components/DisputeList'
import DisputeStatus from './components/DisputeStatus'
import './app.css'

// Resolve current user from ServiceNow global NOW context (injected by sdk:now-ux-globals)
function getCurrentUser() {
    try {
        const now = window.NOW || {}
        return {
            name:       now.user?.name       || 'Guest',
            firstName:  now.user?.firstName  || '',
            email:      now.user?.userID     || '',
            isAnalyst:  (now.user?.roles || []).some(r =>
                ['giftguard_analyst','giftguard_manager','giftguard_admin','admin'].includes(r)
            ),
        }
    } catch {
        return { name: 'Guest', firstName: '', isAnalyst: false }
    }
}

const TABS = {
    home:     { label: '🏠 Home',              show: 'always'   },
    submit:   { label: '📝 Submit Dispute',     show: 'always'   },
    status:   { label: '🔍 Check Status',       show: 'always'   },
    analyst:  { label: '📊 Analyst Dashboard',  show: 'analyst'  },
}

export default function App() {
    const service  = useMemo(() => new DisputeService(), [])
    const user     = useMemo(() => getCurrentUser(), [])

    const [tab,        setTab]        = useState('home')
    const [disputes,   setDisputes]   = useState([])
    const [loading,    setLoading]    = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [toast,      setToast]      = useState(null)
    const [submitted,  setSubmitted]  = useState(null) // Holds the created dispute after success

    // Load disputes for analyst view
    async function loadDisputes() {
        if (!user.isAnalyst) return
        setLoading(true)
        try {
            const data = await service.list()
            setDisputes(data)
        } catch (err) {
            showToast('Failed to load disputes: ' + err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (tab === 'analyst') loadDisputes()
    }, [tab])

    function showToast(message, type = 'success') {
        setToast({ message, type })
        setTimeout(() => setToast(null), 5000)
    }

    async function handleSubmitDispute(formData) {
        setSubmitting(true)
        try {
            const result = await service.create(formData)
            setSubmitted(result)
            setTab('home')
            showToast(`Dispute ${result.number} submitted successfully!`, 'success')
        } catch (err) {
            showToast('Failed to submit dispute: ' + err.message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const visibleTabs = Object.entries(TABS).filter(([, cfg]) =>
        cfg.show === 'always' || (cfg.show === 'analyst' && user.isAnalyst)
    )

    return (
        <div className="gg-app">
            {/* ── Header ───────────────────────────────────────── */}
            <header className="gg-header">
                <div className="gg-header-inner">
                    <div className="gg-logo" onClick={() => { setTab('home'); setSubmitted(null); }}>
                        <div className="gg-logo-shield">🛡</div>
                        <div className="gg-logo-text">
                            <span className="gg-logo-title">GiftGuard</span>
                            <span className="gg-logo-sub">Fraud Protection Portal</span>
                        </div>
                    </div>

                    <nav className="gg-nav">
                        {visibleTabs.map(([key, cfg]) => (
                            <button key={key}
                                className={`gg-nav-btn ${tab === key ? 'active' : ''}`}
                                onClick={() => { setTab(key); setSubmitted(null); }}>
                                {cfg.label}
                            </button>
                        ))}
                    </nav>

                    <div className="gg-user">
                        <div className="gg-user-avatar">
                            {(user.firstName || user.name || '?')[0].toUpperCase()}
                        </div>
                        <div className="gg-user-info">
                            <span className="gg-user-name">{user.name}</span>
                            <span className="gg-user-role">{user.isAnalyst ? 'Analyst' : 'Customer'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main ─────────────────────────────────────────── */}
            <main className="gg-main">

                {/* Toast */}
                {toast && (
                    <div className={`gg-toast gg-toast--${toast.type}`} onClick={() => setToast(null)}>
                        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                    </div>
                )}

                {/* ── HOME ─────────────────────────────────────── */}
                {tab === 'home' && (
                    <div className="gg-home">
                        {/* Success state after submission */}
                        {submitted ? (
                            <div className="gg-success-card">
                                <div className="gg-success-icon">✅</div>
                                <h2>Dispute Submitted!</h2>
                                <p>Your gift card fraud dispute has been received and is now under review.</p>
                                <div className="gg-success-num">{submitted.number}</div>
                                <p className="gg-success-hint">
                                    Save this number — use it to check your status anytime.<br />
                                    A confirmation email has been sent to <strong>{submitted.customerEmail}</strong>.
                                </p>
                                <div className="gg-success-actions">
                                    <button className="gg-cta gg-cta--outline"
                                        onClick={() => { setSubmitted(null); setTab('status'); }}>
                                        Check Status →
                                    </button>
                                    <button className="gg-cta gg-cta--ghost"
                                        onClick={() => setSubmitted(null)}>
                                        Back to Home
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Hero */}
                                <div className="gg-hero">
                                    <div className="gg-hero-badge">Trusted Fraud Protection</div>
                                    <h1 className="gg-hero-title">
                                        Gift Card Fraud?<br />
                                        <span className="gg-hero-accent">We've Got You Covered.</span>
                                    </h1>
                                    <p className="gg-hero-sub">
                                        Report drained gift card balances, track your dispute, and get a decision
                                        within 5 business days. Backed by AI-powered fraud detection.
                                    </p>
                                    <div className="gg-hero-actions">
                                        <button className="gg-cta gg-cta--primary" onClick={() => setTab('submit')}>
                                            📝 Report Fraud Now
                                        </button>
                                        <button className="gg-cta gg-cta--outline" onClick={() => setTab('status')}>
                                            🔍 Check My Dispute
                                        </button>
                                    </div>
                                </div>

                                {/* Feature cards */}
                                <div className="gg-features">
                                    <FeatureCard icon="🛡" title="Secure Intake"
                                        desc="Your card details are masked immediately. We protect your data end-to-end." />
                                    <FeatureCard icon="🤖" title="AI Risk Scoring"
                                        desc="Our 6-factor algorithm assesses each dispute automatically within seconds." />
                                    <FeatureCard icon="⚡" title="Fast Resolution"
                                        desc="Low-risk disputes with evidence can be auto-approved in minutes, not days." />
                                    <FeatureCard icon="📧" title="Email Updates"
                                        desc="Get notified at every step — submission, review, and final decision." />
                                </div>

                                {/* How it works */}
                                <div className="gg-how">
                                    <h2 className="gg-how-title">How It Works</h2>
                                    <div className="gg-how-steps">
                                        <HowStep n={1} title="Submit Your Dispute"
                                            desc="Fill in the 3-step form with your card details and describe what happened." />
                                        <div className="gg-how-arrow">→</div>
                                        <HowStep n={2} title="Automated Risk Assessment"
                                            desc="Our system scores your dispute instantly using 6 fraud indicators." />
                                        <div className="gg-how-arrow">→</div>
                                        <HowStep n={3} title="Review & Decision"
                                            desc="Low-risk cases are auto-approved. Others go to our analyst team." />
                                        <div className="gg-how-arrow">→</div>
                                        <HowStep n={4} title="Refund Processed"
                                            desc="Approved disputes receive a full refund within 3 business days." />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── SUBMIT DISPUTE ────────────────────────────── */}
                {tab === 'submit' && (
                    <div className="gg-page">
                        <div className="gg-page-header">
                            <h2 className="gg-page-title">Submit a Fraud Dispute</h2>
                            <p className="gg-page-sub">
                                Complete all steps below. Your card number will be masked as soon as you submit.
                            </p>
                        </div>
                        <div className="gg-card">
                            <DisputeForm
                                onSubmit={handleSubmitDispute}
                                onCancel={() => setTab('home')}
                                submitting={submitting}
                            />
                        </div>
                    </div>
                )}

                {/* ── CHECK STATUS ──────────────────────────────── */}
                {tab === 'status' && (
                    <div className="gg-page">
                        <div className="gg-card">
                            <DisputeStatus />
                        </div>
                    </div>
                )}

                {/* ── ANALYST DASHBOARD ─────────────────────────── */}
                {tab === 'analyst' && user.isAnalyst && (
                    <div className="gg-page">
                        <div className="gg-page-header">
                            <h2 className="gg-page-title">Analyst Dashboard</h2>
                            <p className="gg-page-sub">
                                All active fraud disputes. Click a row to expand details.
                                Use Approve / Reject / Escalate buttons in ServiceNow native view.
                            </p>
                        </div>
                        <DisputeList
                            disputes={disputes}
                            loading={loading}
                            onRefresh={loadDisputes}
                        />
                    </div>
                )}

                {/* Access denied */}
                {tab === 'analyst' && !user.isAnalyst && (
                    <div className="gg-page">
                        <div className="gg-access-denied">
                            <span style={{ fontSize: 48 }}>🔒</span>
                            <h2>Access Restricted</h2>
                            <p>You need the <code>giftguard_analyst</code> or <code>giftguard_manager</code> role to access this view.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* ── Footer ───────────────────────────────────────── */}
            <footer className="gg-footer">
                <span>🛡 GiftGuard — CSIT440 Capstone | Team 33</span>
                <span>Scope: x_1994889_csit440</span>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="gg-feature-card">
            <div className="gg-feature-icon">{icon}</div>
            <h3 className="gg-feature-title">{title}</h3>
            <p className="gg-feature-desc">{desc}</p>
        </div>
    )
}

function HowStep({ n, title, desc }) {
    return (
        <div className="gg-how-step">
            <div className="gg-how-num">{n}</div>
            <h4 className="gg-how-step-title">{title}</h4>
            <p className="gg-how-step-desc">{desc}</p>
        </div>
    )
}
