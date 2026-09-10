import { useEffect, useState } from 'react';
import Gauge from './Gauge.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PROVIDER_TYPES = [
  'Internal Medicine', 'Family Practice', 'Cardiology',
  'Orthopedic Surgery', 'Psychiatry', 'Neurology',
  'Emergency Medicine', 'Radiology', 'Anesthesiology',
  'Certified Registered Nurse Anesthetist (CRNA)',
  'Clinical Laboratory', 'Medical Oncology',
  'Pathology', 'Hematology-Oncology', 'Nuclear Medicine',
];
const STATES = ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'WA', 'AZ', 'CO', 'NV', 'OR'];
const CREDENTIALS = ['Physician', 'NP', 'PA', 'CRNA', 'Therapist', 'Other_Doctor', 'Nursing_Other'];
const HCPCS_OPTIONS = [
  '99213 — Office Visit (Low Risk)',
  '99214 — Office Visit Detailed (Low Risk)',
  'J1200 — Drug Injection (High Risk)',
  '88300 — Pathology Exam (High Risk)',
  'A9575 — Radiopharmaceutical (High Risk)',
  '96127 — Behavioral Screening (High Risk)',
  '51798 — Bladder Scan (High Risk)',
];

const initialForm = {
  provider_type: PROVIDER_TYPES[0],
  state: STATES[0],
  credential_group: CREDENTIALS[0],
  hcpcs: HCPCS_OPTIONS[0],
  entity_type: 'Individual (1)',
  participating: 'Yes (1)',
  tot_srvcs: 3.5,
  avg_charge: 5.0,
  avg_payment: 4.5,
  remark_text: '',
  flag_charge: false,
  flag_zero: false,
  flag_srvcs: false,
  drug: 'No (0)',
  pos: 'Office (0)',
};

export default function App() {
  const [apiOk, setApiOk] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) })
      .then((r) => { if (!cancelled) setApiOk(r.ok); })
      .catch(() => { if (!cancelled) setApiOk(false); });
    return () => { cancelled = true; };
  }, []);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const hcpcsCode = form.hcpcs.split(' — ')[0].trim();
    const payload = {
      provider_type: form.provider_type,
      state: form.state,
      credential_group: form.credential_group,
      entity_type: form.entity_type.includes('1') ? 1 : 0,
      participating: form.participating.includes('1') ? 1 : 0,
      hcpcs_code: hcpcsCode,
      drug_indicator: form.drug.includes('1') ? 1 : 0,
      place_of_service: form.pos.includes('1') ? 1 : 0,
      total_services_log: form.tot_srvcs,
      avg_submitted_charge_log: form.avg_charge,
      avg_medicare_payment_log: form.avg_payment,
      avg_allowed_amount_log: form.avg_payment + 0.1,
      total_beneficiaries_log: form.tot_srvcs - 0.5,
      flag_charge_lt_payment: form.flag_charge ? 1 : 0,
      flag_zero_payment: form.flag_zero ? 1 : 0,
      flag_services_lt_benes: form.flag_srvcs ? 1 : 0,
      flag_zero_allowed: 0,
      flag_invalid_state: 0,
      flag_non_us_country: 0,
      ruca_code: 1.0,
      remark_text: form.remark_text,
    };

    try {
      const res = await fetch(`${API_URL}/predict/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const risk = result?.denial_risk;
  const cause = result?.root_cause;

  return (
    <>
      <div className="navbar">
        <div className="nav-brand">
          <div className="nav-logo">⚡</div>
          <div>
            <div className="nav-title">Claim Denial Intelligence</div>
            <div className="nav-tagline">CMS Medicare PUF 2023 · X12 RARC</div>
          </div>
        </div>
        <div className="nav-right">
          <span className="nav-badge">⚒ Live Demo</span>
          <div className="nav-status">
            <span className={`status-dot ${apiOk ? 'status-connected' : 'status-disconnected'}`} />
            {apiOk ? <span style={{ color: '#34D399' }}>API Connected</span> : <span style={{ color: '#F87171' }}>API Offline</span>}
          </div>
        </div>
      </div>

      <div className="page">
        {apiOk === false && (
          <div className="warning-bar">⚠️ FastAPI backend offline — check that VITE_API_URL points to a running instance.</div>
        )}

        <div className="top-header">
          <h1>Claim Denial Predictor</h1>
          <p>Enter claim details — get denial probability + root cause before you submit</p>
        </div>

        <div className="columns">
          {/* ── FORM ── */}
          <form className="card" onSubmit={handleSubmit}>
            <div className="form-section">Provider Info</div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Provider Type</label>
                <select value={form.provider_type} onChange={(e) => setField('provider_type', e.target.value)}>
                  {PROVIDER_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">HCPCS / CPT Code</label>
                <select value={form.hcpcs} onChange={(e) => setField('hcpcs', e.target.value)}>
                  {HCPCS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">State</label>
                <select value={form.state} onChange={(e) => setField('state', e.target.value)}>
                  {STATES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Entity Type</label>
                <select value={form.entity_type} onChange={(e) => setField('entity_type', e.target.value)}>
                  <option>Individual (1)</option>
                  <option>Organization (0)</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Credential Group</label>
                <select value={form.credential_group} onChange={(e) => setField('credential_group', e.target.value)}>
                  {CREDENTIALS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Medicare Participating</label>
                <select value={form.participating} onChange={(e) => setField('participating', e.target.value)}>
                  <option>Yes (1)</option>
                  <option>No (0)</option>
                </select>
              </div>
            </div>

            <div className="form-section">Utilization</div>
            <div className="field-row-3">
              <div className="slider-row">
                <label className="field-label">Services (log) <span className="slider-val">{form.tot_srvcs.toFixed(1)}</span></label>
                <input type="range" min="0" max="10" step="0.1" value={form.tot_srvcs}
                  onChange={(e) => setField('tot_srvcs', parseFloat(e.target.value))} />
              </div>
              <div className="slider-row">
                <label className="field-label">Charge (log) <span className="slider-val">{form.avg_charge.toFixed(1)}</span></label>
                <input type="range" min="0" max="10" step="0.1" value={form.avg_charge}
                  onChange={(e) => setField('avg_charge', parseFloat(e.target.value))} />
              </div>
              <div className="slider-row">
                <label className="field-label">Payment (log) <span className="slider-val">{form.avg_payment.toFixed(1)}</span></label>
                <input type="range" min="0" max="10" step="0.1" value={form.avg_payment}
                  onChange={(e) => setField('avg_payment', parseFloat(e.target.value))} />
              </div>
            </div>

            <div className="form-section">Denial Remark — for Root Cause (optional)</div>
            <div className="field">
              <textarea
                placeholder="e.g. Prior authorization was required but not obtained before service was rendered..."
                value={form.remark_text}
                onChange={(e) => setField('remark_text', e.target.value)}
              />
            </div>

            <div className="form-section">Risk Flags</div>
            <div className="checkbox-row">
              <label className="checkbox-item">
                <input type="checkbox" checked={form.flag_charge} onChange={(e) => setField('flag_charge', e.target.checked)} />
                Charge &lt; Payment
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={form.flag_zero} onChange={(e) => setField('flag_zero', e.target.checked)} />
                Zero Payment
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={form.flag_srvcs} onChange={(e) => setField('flag_srvcs', e.target.checked)} />
                Services &lt; Benes
              </label>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Drug Claim</label>
                <select value={form.drug} onChange={(e) => setField('drug', e.target.value)}>
                  <option>No (0)</option>
                  <option>Yes (1)</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Place of Service</label>
                <select value={form.pos} onChange={(e) => setField('pos', e.target.value)}>
                  <option>Office (0)</option>
                  <option>Facility (1)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Analyzing…' : '⚡ Analyze Denial Risk'}
            </button>
          </form>

          {/* ── RESULT ── */}
          <div>
            {error && <div className="error-bar">{error}</div>}

            {loading && (
              <div className="card">
                <div className="spinner-wrap">
                  <div className="spinner" />
                  Analyzing claim...
                </div>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="ready-card">
                <div className="ready-icon">⚡</div>
                <div className="ready-title">Ready to Analyze</div>
                <div className="ready-subtitle">
                  Fill in claim details on the left and click<br />
                  <strong>Analyze Denial Risk</strong> to get instant results.
                </div>
                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-icon fi-blue">●</div>
                    <div>
                      <div className="feature-title">Denial Probability Score</div>
                      <div className="feature-desc">Real-time ML-based denial risk from 0–100%</div>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon fi-amber">▲</div>
                    <div>
                      <div className="feature-title">Risk Tier · HIGH / MEDIUM / LOW</div>
                      <div className="feature-desc">Categorized using optimized probability thresholds</div>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon fi-green">≡</div>
                    <div>
                      <div className="feature-title">Top Feature Drivers</div>
                      <div className="feature-desc">SHAP-based explainability for each prediction</div>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon fi-red">◆</div>
                    <div>
                      <div className="feature-title">Root Cause + Remediation Fix</div>
                      <div className="feature-desc">NLP classifier maps remark text to X12 RARC taxonomy</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && result && (
              <>
                {risk && (
                  <div className="card">
                    <Gauge probPct={risk.denial_probability * 100} tier={risk.risk_tier} thresholdPct={risk.threshold_used * 100} />
                    <div style={{ textAlign: 'center', marginTop: -8, marginBottom: 20 }}>
                      <span className={`badge badge-${risk.risk_tier}`}>{risk.risk_tier} RISK</span>
                    </div>

                    {risk.top3_drivers?.length > 0 && (
                      <>
                        <div className="card-title">Top Denial Drivers</div>
                        {(() => {
                          const maxVal = Math.max(...risk.top3_drivers.map((d) => Math.abs(d.shap_value))) || 1;
                          return risk.top3_drivers.map((d, i) => {
                            const pct = Math.min(Math.round((Math.abs(d.shap_value) / maxVal) * 100), 100);
                            const barCls = d.direction === 'increases_risk' ? 'driver-bar-high' : 'driver-bar-low';
                            const arrow = d.direction === 'increases_risk' ? '⬆' : '⬇';
                            return (
                              <div className="driver-row" key={i}>
                                <div className="driver-name">{arrow} {d.feature}</div>
                                <div className="driver-bar-wrap"><div className={barCls} style={{ width: `${pct}%` }} /></div>
                                <div className="driver-val">{d.shap_value >= 0 ? '+' : ''}{d.shap_value.toFixed(2)}</div>
                              </div>
                            );
                          });
                        })()}
                      </>
                    )}
                  </div>
                )}

                {cause && (
                  <div className="cause-card">
                    <div className="cause-head">
                      <div className="cause-icon">◆</div>
                      <div>
                        <div className="cause-label">{cause.display_name}</div>
                        <div className="cause-conf">Confidence: {(cause.confidence * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="fix-block">
                      <div className="fix-label-row">
                        <span style={{ color: '#34D399', fontSize: 14 }}>✦</span>
                        <span className="fix-label">First-Pass Fix</span>
                      </div>
                      <div className="fix-text">{cause.first_pass_fix}</div>
                    </div>
                    <div className="pill-row">
                      {cause.top3?.map((item, i) => (
                        <span className="pill" key={i}>{item.label} · {(item.confidence * 100).toFixed(0)}%</span>
                      ))}
                    </div>
                  </div>
                )}

                {!cause && form.remark_text.trim() && (
                  <div className="warning-bar">Root cause model not loaded on the backend.</div>
                )}

                <div className="disclaimer-bar">
                  ⏰ {result.latency_ms}ms &nbsp;·&nbsp; Request {result.request_id} &nbsp;·&nbsp; CMS PUF 2023 · Portfolio demo only
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
