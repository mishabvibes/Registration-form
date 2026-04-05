'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { DEFAULT_FIELDS, FieldDef } from '@/lib/fieldDefs';

// ─── helpers ──────────────────────────────────────────────────────────────────
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PropertiesPanel({
  field,
  onChange,
}: {
  field: FieldDef;
  onChange: (updated: FieldDef) => void;
}) {
  const num = (key: keyof FieldDef) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...field, [key]: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="db-props-panel">
      <h3 className="db-props-title">⚙️ خصائص الحقل</h3>
      <div className="db-props-label">{field.label}</div>

      <div className="db-prop-group">
        <label>أعلى (%) <span className="db-prop-val">{field.top.toFixed(1)}</span></label>
        <input type="range" min="0" max="95" step="0.1" value={field.top} onChange={num('top')} />
        <input type="number" step="0.1" value={field.top.toFixed(1)} onChange={num('top')} className="db-num-input"/>
      </div>

      <div className="db-prop-group">
        <label>يسار (%) <span className="db-prop-val">{field.left.toFixed(1)}</span></label>
        <input type="range" min="0" max="95" step="0.1" value={field.left} onChange={num('left')} />
        <input type="number" step="0.1" value={field.left.toFixed(1)} onChange={num('left')} className="db-num-input"/>
      </div>

      <div className="db-prop-group">
        <label>العرض (%) <span className="db-prop-val">{field.width.toFixed(1)}</span></label>
        <input type="range" min="5" max="100" step="0.5" value={field.width} onChange={num('width')} />
        <input type="number" step="0.5" value={field.width.toFixed(1)} onChange={num('width')} className="db-num-input"/>
      </div>

      <div className="db-prop-group">
        <label>الارتفاع (%) <span className="db-prop-val">{field.height.toFixed(1)}</span></label>
        <input type="range" min="2" max="30" step="0.1" value={field.height} onChange={num('height')} />
        <input type="number" step="0.1" value={field.height.toFixed(1)} onChange={num('height')} className="db-num-input"/>
      </div>

      <div className="db-prop-group">
        <label>حجم الخط (px) <span className="db-prop-val">{field.fontSize}</span></label>
        <input type="range" min="8" max="36" step="1" value={field.fontSize} onChange={num('fontSize')} />
        <input type="number" step="1" value={field.fontSize} onChange={num('fontSize')} className="db-num-input"/>
      </div>

      <div className="db-prop-group">
        <label>اتجاه النص</label>
        <select
          value={field.dir || 'rtl'}
          onChange={(e) => onChange({ ...field, dir: e.target.value as 'ltr' | 'rtl' })}
          className="db-select"
        >
          <option value="rtl">RTL (عربي)</option>
          <option value="ltr">LTR (إنجليزي)</option>
        </select>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [fields, setFields] = useState<FieldDef[]>([...DEFAULT_FIELDS]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const paperRef = useRef<HTMLDivElement>(null);

  // Load saved config from DB on mount
  useEffect(() => {
    fetch('/api/field-config')
      .then((r) => r.json())
      .then((data) => {
        if (data.fields && Array.isArray(data.fields)) {
          setFields(data.fields);
        }
      })
      .catch(() => {/* use defaults */});
  }, []);

  // ── Drag logic ────────────────────────────────────────────────────────────
  const dragState = useRef<{
    fieldId: string;
    startMouseX: number;
    startMouseY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent, fieldId: string) => {
    e.preventDefault();
    const paper = paperRef.current;
    if (!paper) return;
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    setSelected(fieldId);
    dragState.current = {
      fieldId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startLeft: field.left,
      startTop: field.top,
    };
  }, [fields]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const ds = dragState.current;
      const paper = paperRef.current;
      if (!ds || !paper) return;

      const rect = paper.getBoundingClientRect();
      const dx = ((e.clientX - ds.startMouseX) / rect.width) * 100;
      const dy = ((e.clientY - ds.startMouseY) / rect.height) * 100;

      setFields((prev) =>
        prev.map((f) =>
          f.id === ds.fieldId
            ? { ...f, left: clamp(ds.startLeft + dx, 0, 95), top: clamp(ds.startTop + dy, 0, 95) }
            : f
        )
      );
    };

    const onUp = () => { dragState.current = null; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ── Resize handle drag ─────────────────────────────────────────────────────
  const resizeState = useRef<{
    fieldId: string;
    startMouseX: number;
    startMouseY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const onResizeMouseDown = useCallback((e: React.MouseEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    resizeState.current = {
      fieldId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startWidth: field.width,
      startHeight: field.height,
    };
  }, [fields]);

  useEffect(() => {
    const paper = paperRef.current;
    const onMove = (e: MouseEvent) => {
      const rs = resizeState.current;
      if (!rs || !paper) return;
      const rect = paper.getBoundingClientRect();
      const dx = ((e.clientX - rs.startMouseX) / rect.width) * 100;
      const dy = ((e.clientY - rs.startMouseY) / rect.height) * 100;

      setFields((prev) =>
        prev.map((f) =>
          f.id === rs.fieldId
            ? {
                ...f,
                width: clamp(rs.startWidth + dx, 5, 100),
                height: clamp(rs.startHeight + dy, 2, 40),
              }
            : f
        )
      );
    };
    const onUp = () => { resizeState.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/field-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const handleReset = () => {
    setFields([...DEFAULT_FIELDS]);
    setSelected(null);
  };

  const selectedField = fields.find((f) => f.id === selected) ?? null;

  const updateField = (updated: FieldDef) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  return (
    <div className="db-root">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-header">
          <div className="db-logo">📋</div>
          <h1 className="db-title">لوحة التحكم</h1>
          <p className="db-subtitle">اسحب الحقول لتحديد موقعها</p>
        </div>

        <nav className="db-nav">
          <Link href="/" className="db-nav-link">
            🏠 العودة للاستمارة
          </Link>
        </nav>

        <div className="db-field-list">
          <h2 className="db-section-title">الحقول</h2>
          {fields.map((f) => (
            <button
              key={f.id}
              className={`db-field-item ${selected === f.id ? 'active' : ''}`}
              onClick={() => setSelected(f.id)}
            >
              <span className="db-field-type-badge">{f.type}</span>
              <span className="db-field-label">{f.label}</span>
            </button>
          ))}
        </div>

        {selectedField && (
          <PropertiesPanel field={selectedField} onChange={updateField} />
        )}

        <div className="db-actions">
          <button
            className={`db-btn db-btn-save ${saveStatus === 'saving' ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? '⏳ جاري الحفظ...' :
             saveStatus === 'saved'  ? '✅ تم الحفظ!' :
             saveStatus === 'error'  ? '❌ خطأ في الحفظ' : '💾 حفظ المواضع'}
          </button>
          <button className="db-btn db-btn-reset" onClick={handleReset}>
            🔄 إعادة الضبط
          </button>
        </div>
      </aside>

      {/* ── Canvas area ─────────────────────────────────────────────────── */}
      <main className="db-canvas">
        <div className="db-canvas-toolbar">
          <span className="db-toolbar-hint">
            💡 اسحب أي حقل لتغيير موضعه · اسحب المقبض (◢) لتغيير الحجم · انقر للاختيار
          </span>
        </div>

        <div className="db-paper-wrapper">
          <div className="db-paper" ref={paperRef}>
            {fields.map((field) => {
              const isActive = selected === field.id;
              return (
                <div
                  key={field.id}
                  className={`db-field-overlay ${isActive ? 'db-field-active' : ''}`}
                  style={{
                    top: `${field.top}%`,
                    left: `${field.left}%`,
                    width: `${field.width}%`,
                    height: `${field.height}%`,
                    fontSize: `${field.fontSize}px`,
                    direction: field.dir || 'rtl',
                    cursor: 'move',
                  }}
                  onMouseDown={(e) => onMouseDown(e, field.id)}
                  onClick={() => setSelected(field.id)}
                >
                  <span className="db-field-badge">{field.label}</span>

                  {/* Resize handle */}
                  <div
                    className="db-resize-handle"
                    onMouseDown={(e) => onResizeMouseDown(e, field.id)}
                    title="اسحب لتغيير الحجم"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
