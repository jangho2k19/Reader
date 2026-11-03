import React from 'react';
import { X, Sparkles, AlignLeft, AlignJustify, Zap } from 'lucide-react';

export default function AppearanceModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  maxWidth,
  setMaxWidth,
  textAlign,
  setTextAlign,
  autoScroll,
  setAutoScroll,
  bionicReading,
  setBionicReading
}) {
  if (!isOpen) return null;

  const themes = [
    { id: 'light', name: 'Light', bg: '#ffffff', text: '#0f172a', border: '#cbd5e1' },
    { id: 'sepia', name: 'Sepia', bg: '#fdf6e7', text: '#382c1e', border: '#d3c4a6' },
    { id: 'solarized', name: 'Solar', bg: '#eee8d5', text: '#073642', border: '#b8ac92' },
    { id: 'dark', name: 'Slate', bg: '#1e293b', text: '#f8fafc', border: '#475569' },
    { id: 'oled', name: 'OLED', bg: '#000000', text: '#e2e8f0', border: '#22242b' },
  ];

  const fonts = [
    { id: 'serif', name: 'Serif (Editorial)', sample: 'Georgia / Merriweather' },
    { id: 'sans', name: 'Sans-Serif (Modern)', sample: 'Inter / System' },
    { id: 'mono', name: 'Monospace (Code)', sample: 'JetBrains / Mono' },
    { id: 'dyslexic', name: 'Dyslexic-Friendly', sample: 'High Legibility' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '490px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
              Reader Customization
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Theme Picker */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Color Theme
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  padding: '10px 4px',
                  borderRadius: '10px',
                  backgroundColor: t.bg,
                  color: t.text,
                  border: theme === t.id ? '2px solid var(--primary-color)' : `1px solid ${t.border}`,
                  boxShadow: theme === t.id ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'transform 0.1s ease',
                  transform: theme === t.id ? 'scale(1.04)' : 'scale(1)'
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: t.text,
                    opacity: 0.8
                  }}
                />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Picker */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Typography
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {fonts.map(f => (
              <button
                key={f.id}
                onClick={() => setFontFamily(f.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textAlign: 'left',
                  border: fontFamily === f.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: fontFamily === f.id ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{f.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.sample}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bionic Reading Feature Toggle */}
        <div
          style={{
            backgroundColor: 'var(--bg-hover)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={18} color="var(--primary-color)" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                Bionic Reading Mode
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Bolds artificial fixation points to guide eye speed
              </div>
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={bionicReading}
              onChange={e => setBionicReading(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: bionicReading ? 'var(--primary-color)' : 'var(--border-strong)',
                borderRadius: '24px',
                transition: 'background-color 0.2s ease'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: bionicReading ? '23px' : '3px',
                  bottom: '3px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transition: 'left 0.2s ease'
                }}
              />
            </span>
          </label>
        </div>

        {/* Font Size & Line Height Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Font Size</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="28"
              step="1"
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Line Spacing</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lineHeight}</span>
            </div>
            <input
              type="range"
              min="1.4"
              max="2.3"
              step="0.05"
              value={lineHeight}
              onChange={e => setLineHeight(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Reading Column Width</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{maxWidth}px</span>
            </div>
            <input
              type="range"
              min="550"
              max="950"
              step="25"
              value={maxWidth}
              onChange={e => setMaxWidth(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>
        </div>

        {/* Text Alignment & Auto Scroll */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Alignment:</span>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-hover)', borderRadius: '8px', padding: '2px' }}>
              <button
                onClick={() => setTextAlign('left')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: textAlign === 'left' ? 'var(--bg-card)' : 'transparent',
                  color: textAlign === 'left' ? 'var(--primary-color)' : 'var(--text-muted)',
                  boxShadow: textAlign === 'left' ? 'var(--shadow-sm)' : 'none'
                }}
                title="Left Align"
              >
                <AlignLeft size={16} />
              </button>
              <button
                onClick={() => setTextAlign('justify')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: textAlign === 'justify' ? 'var(--bg-card)' : 'transparent',
                  color: textAlign === 'justify' ? 'var(--primary-color)' : 'var(--text-muted)',
                  boxShadow: textAlign === 'justify' ? 'var(--shadow-sm)' : 'none'
                }}
                title="Justified"
              >
                <AlignJustify size={16} />
              </button>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={e => setAutoScroll(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
            />
            Auto-follow audio
          </label>
        </div>
      </div>
    </div>
  );
}
