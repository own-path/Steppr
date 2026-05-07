import React, { useState, useEffect } from 'react'
import { TopBar, Dock } from './components/Shell'
import { TweaksPanel, TweakSection, TweakRadio, useTweaks } from './components/TweaksPanel'
import { ToastProvider } from './components/Primitives'
import DashboardPage from './pages/DashboardPage'
import DailyLogPage from './pages/DailyLogPage'
import KnowledgeGraphPage from './pages/KnowledgeGraphPage'
import ReportsPage from './pages/ReportsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import TasksPage from './pages/TasksPage'
import WinsPage from './pages/WinsPage'
import SettingsPage from './pages/SettingsPage'
import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'

const TWEAK_DEFAULTS = {
  accent: '#003594',
  canvas: 'bone',
  density: 'comfortable',
};

const ACCENTS = {
  '#003594': { name: 'Navy',    soft: '#C8D5EE', tint: '#E6ECF8', dark: '#002570' },
  '#FFB81C': { name: 'Amber',   soft: '#FFF0C2', tint: '#FFF8E6', dark: '#E6A318' },
  '#1D4ED8': { name: 'Blue',    soft: '#DBEAFE', tint: '#EFF6FF', dark: '#1E40AF' },
  '#7C3AED': { name: 'Violet',  soft: '#EDE9FE', tint: '#F5F3FF', dark: '#6D28D9' },
  '#0891B2': { name: 'Cyan',    soft: '#CFFAFE', tint: '#ECFEFF', dark: '#0E7490' },
  '#0C1A35': { name: 'Ink',     soft: '#DDE1EE', tint: '#ECEEF5', dark: '#060D1A' },
};

const PROTECTED_PAGES = {
  dashboard: DashboardPage,
  log: DailyLogPage,
  graph: KnowledgeGraphPage,
  reports: ReportsPage,
  analytics: AnalyticsPage,
  tasks: TasksPage,
  wins: WinsPage,
  settings: SettingsPage,
};


function App({ onSignIn, onSignUp, isAuthenticated = false, currentUser = null }) {
  const [route, setRoute] = useState(window.location.hash.slice(1) || 'landing');
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || 'landing');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    window.location.hash = route;
  }, [route]);

  useEffect(() => {
    if (!isAuthenticated || route !== 'landing') return;
    setRoute(currentUser?.onboardingComplete ? 'dashboard' : 'onboarding');
  }, [isAuthenticated, currentUser?.onboardingComplete, route]);

  useEffect(() => {
    const a = ACCENTS[tweaks.accent] || ACCENTS['#003594'];
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    document.documentElement.style.setProperty('--accent-2', a.dark);
    document.documentElement.style.setProperty('--accent-soft', a.soft);
    document.documentElement.style.setProperty('--accent-tint', a.tint);
    document.documentElement.dataset.canvas = tweaks.canvas;
    document.documentElement.dataset.density = tweaks.density;
  }, [tweaks]);

  const isLanding = route === 'landing';
  const isOnboarding = route === 'onboarding';
  const hideShell = isLanding || isOnboarding;
  const Page = PROTECTED_PAGES[route];

  return (
    <ToastProvider>
      <div className="app-bg">
        {!hideShell && <TopBar route={route} setRoute={setRoute}/>}
        <main key={route}>
          {isLanding
            ? <LandingPage setRoute={setRoute} onSignIn={onSignIn} onSignUp={onSignUp}/>
            : isOnboarding
            ? <OnboardingPage setRoute={setRoute}/>
            : Page ? <Page/>
            : <DashboardPage/>}
        </main>
        {!hideShell && <Dock route={route} setRoute={setRoute}/>}

        <TweaksPanel title="Tweaks">
          <TweakSection label="Accent color">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(ACCENTS).map(([hex, info]) => (
                <button key={hex} onClick={() => setTweak('accent', hex)} title={info.name}
                  style={{ width: 30, height: 30, borderRadius: 999, background: hex,
                    border: tweaks.accent === hex ? '2px solid var(--ink)' : '2px solid transparent',
                    boxShadow: '0 0 0 2px ' + (tweaks.accent === hex ? '#fff' : 'transparent'),
                    cursor: 'pointer' }}/>
              ))}
            </div>
          </TweakSection>
          <TweakSection label="Canvas tone">
            <TweakRadio value={tweaks.canvas} onChange={(v) => setTweak('canvas', v)}
              options={[{ value: 'bone', label: 'Bone' }, { value: 'warm', label: 'Warm' }, { value: 'stone', label: 'Stone' }, { value: 'linen', label: 'Linen' }]}/>
          </TweakSection>
          <TweakSection label="Density">
            <TweakRadio value={tweaks.density} onChange={(v) => setTweak('density', v)}
              options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfy' }, { value: 'cozy', label: 'Cozy' }]}/>
          </TweakSection>
        </TweaksPanel>
      </div>
    </ToastProvider>
  );
}

export default App;
