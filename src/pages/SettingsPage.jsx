import React, { useState } from 'react'
import Icons from '../components/Icons'
import { useBreakpoint } from '../hooks/useBreakpoint'

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 38, height: 22, borderRadius: 999, position: 'relative',
      background: on ? 'var(--accent)' : 'var(--bg-3)', transition: 'background .2s',
    }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: 999, background: '#fff',
        transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}></span>
    </button>
  );
}

function SettingsPage() {
  const I = Icons;
  const { isMobile } = useBreakpoint();
  const [s, setS] = useState({
    localAI: true, modelId: 'gemma-2-9b-it',
    fridayTime: '15:00', privacyVoice: false, retention: 90,
    confetti: true, soundOn: false,
  });
  const set = (k, v) => setS(p => ({ ...p, [k]: v }));

  const Section = ({ title, sub, children }) => (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="h3">{title}</div>
        {sub && <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{sub}</div>}
      </div>
      <div className="col gap-3">{children}</div>
    </div>
  );

  const Row = ({ label, sub, children }) => (
    <div className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {sub && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  const gridCols = isMobile ? '1fr' : '1fr 1fr';

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Settings</div>
        <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>Make Steppr yours.</h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: gridCols, gap: 16 }}>
        <Section title="Local AI mode" sub="Run reflections privately on your machine.">
          <Row label="Local-first" sub="All journals stay on this device.">
            <Toggle on={s.localAI} onChange={(v) => set('localAI', v)}/>
          </Row>
          <Row label="Models" sub="Which weights run locally for reflections + summaries.">
            <select className="input" style={{ width: isMobile ? '100%' : 280 }} value={s.modelId} onChange={(e) => set('modelId', e.target.value)}>
              <optgroup label="Google · Gemma">
                <option value="gemma-2-2b-it">gemma-2-2b-it · 2B · 1.6GB</option>
                <option value="gemma-2-9b-it">gemma-2-9b-it · 9B · 5.4GB</option>
                <option value="gemma-2-27b-it">gemma-2-27b-it · 27B · 16GB</option>
              </optgroup>
              <optgroup label="Meta · Llama">
                <option value="llama-3.2-3b-instruct">llama-3.2-3b-instruct · 3B · 2.0GB</option>
                <option value="llama-3.1-8b-instruct">llama-3.1-8b-instruct · 8B · 4.7GB</option>
                <option value="llama-3.3-70b-instruct">llama-3.3-70b-instruct · 70B · 40GB</option>
              </optgroup>
              <optgroup label="Mistral">
                <option value="mistral-7b-instruct-v0.3">mistral-7b-instruct-v0.3 · 7B · 4.1GB</option>
                <option value="mixtral-8x7b-instruct">mixtral-8x7b-instruct · 47B · 26GB</option>
              </optgroup>
              <optgroup label="Microsoft · Phi">
                <option value="phi-3.5-mini-instruct">phi-3.5-mini-instruct · 3.8B · 2.3GB</option>
                <option value="phi-4">phi-4 · 14B · 8.5GB</option>
              </optgroup>
              <optgroup label="Alibaba · Qwen">
                <option value="qwen-2.5-7b-instruct">qwen-2.5-7b-instruct · 7B · 4.4GB</option>
                <option value="qwen-2.5-32b-instruct">qwen-2.5-32b-instruct · 32B · 19GB</option>
              </optgroup>
            </select>
          </Row>
        </Section>

        <Section title="Reports" sub="Schedule and delivery preferences.">
          <Row label="Friday report" sub="When to auto-generate.">
            <input type="time" className="input" value={s.fridayTime} onChange={(e) => set('fridayTime', e.target.value)} style={{ width: 120 }}/>
          </Row>
          <Row label="Auto-send to manager" sub="Email the manager version.">
            <Toggle on={false} onChange={() => {}}/>
          </Row>
          <Row label="Default tone" sub="">
            <select className="input" style={{ width: 180 }}>
              <option>Direct</option><option>Warm</option><option>Concise</option>
            </select>
          </Row>
        </Section>

        <Section title="Privacy" sub="What Steppr remembers and shares.">
          <Row label="Voice transcripts" sub="Process voice notes locally only.">
            <Toggle on={s.privacyVoice} onChange={(v) => set('privacyVoice', v)}/>
          </Row>
          <Row label="Memory retention" sub={`Keep entries for ${s.retention} days.`}>
            <input type="range" min="30" max="365" value={s.retention} onChange={(e) => set('retention', +e.target.value)} style={{ accentColor: 'var(--accent)' }}/>
          </Row>
          <Row label="Export all data" sub="Download as ZIP.">
            <button className="btn"><I.Download size={13}/> Export</button>
          </Row>
        </Section>

        <Section title="Theme & feel" sub="Tweak how Steppr looks and reacts.">
          <Row label="Confetti on wins"><Toggle on={s.confetti} onChange={(v) => set('confetti', v)}/></Row>
          <Row label="Subtle sounds"><Toggle on={s.soundOn} onChange={(v) => set('soundOn', v)}/></Row>
          <Row label="Voice settings" sub="Choose dictation language.">
            <select className="input" style={{ width: 180 }}><option>English (US)</option><option>English (UK)</option></select>
          </Row>
        </Section>
      </div>

      <div className="card" style={{ padding: 24, marginTop: 16, background: 'linear-gradient(135deg, #14120E, #2B2823)', color: '#fff', borderColor: 'transparent' }}>
        <div className="between">
          <div>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Danger zone</div>
            <div className="h3" style={{ marginTop: 6 }}>Reset all of Steppr</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>Deletes all entries, wins, and graph data.</div>
          </div>
          <button className="btn" style={{ background: 'var(--rose)', color: '#fff', borderColor: 'var(--rose)' }}>Reset</button>
        </div>
      </div>
      <div className="dock-spacer"></div>
    </div>
  );
}

export default SettingsPage;
