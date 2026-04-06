'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, Printer, Save, Settings, CheckCircle } from 'lucide-react';
import { DEFAULT_FIELDS, FieldDef } from '@/lib/fieldDefs';

function hexToRgba(hex: string, opacity: number) {
  if (!hex || hex.length < 7) return 'transparent';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity / 100})`;
}

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([...DEFAULT_FIELDS]);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/field-config')
      .then(r => r.json())
      .then(data => {
        if (data.fields && Array.isArray(data.fields) && data.fields.length > 0) {
          setFields(data.fields.map((f: Partial<FieldDef>) => ({ ...DEFAULT_FIELDS[0], ...f })));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined') return;
    const element = formRef.current;
    if (!element) return;

    const [{ jsPDF }, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas').then(m => m.default),
    ]);

    const imgRes  = await fetch('/image/FormFrame.jpeg');
    const imgBlob = await imgRes.blob();
    const imgBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imgBlob);
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    
    // Add original background image with 0 compression (alias: 'FAST' usually preserves best)
    pdf.addImage(imgBase64, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    element.classList.add('pdf-mode');

    // Use higher scale and explicit DPI for razor-sharp text
    const canvas = await html2canvas(element, {
      scale: 4,                  // Captures at 384 DPI (4 * 96)
      useCORS: true,
      backgroundColor: null,     // Transparent background
      logging: false,
    });

    element.classList.remove('pdf-mode');

    // Add high-resolution text layer on top
    const textData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(textData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

    pdf.save(`Registration_${formData['studentName'] || 'Form'}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSuccess('تم حفظ البيانات بنجاح!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const data = await res.json();
        alert(data.message || 'حدث خطأ أثناء الحفظ');
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: FieldDef): React.CSSProperties => ({
    position: 'absolute',
    top: `${field.top}%`,
    left: `${field.left}%`,
    width: `${field.width}%`,
    height: `${field.height}%`,
    fontSize: field.fontSize,
    fontFamily: field.fontFamily,
    fontWeight: field.fontWeight,
    fontStyle: field.fontStyle,
    textDecoration: field.textDecoration,
    textAlign: field.textAlign,
    color: field.color,
    backgroundColor: field.bgOpacity > 0 ? hexToRgba(field.bgColor, field.bgOpacity) : 'transparent',
    border: field.borderStyle === 'none' ? 'none'
      : `${field.borderWidth}px ${field.borderStyle} ${field.borderColor}`,
    borderRadius: field.borderRadius,
    direction: field.dir,
    outline: 'none',
    padding: '2px 6px',
    resize: 'none',
    background: field.bgOpacity > 0 ? hexToRgba(field.bgColor, field.bgOpacity) : 'transparent',
  });

  return (
    <div className="app-container">
      <header className="page-header">
        <h1>استمارة التسجيل</h1>
        <p>يرجى ملء البيانات المطلوبة بعناية</p>
        {success && (
          <div className="success-banner" style={{ 
            background: 'rgba(34, 197, 94, 0.2)', 
            border: '1px solid #22c55e', 
            color: '#22c55e', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <CheckCircle size={20} />
            {success}
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* MOBILE VIEW: Clean Form Cards */}
        <div className="mobile-view">
          <div className="form-card">
            {fields.map(field => (
              <div key={field.id} className="mobile-field">
                <label htmlFor={`mobile-${field.id}`}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`mobile-${field.id}`}
                    className="mobile-input mobile-textarea"
                    name={field.id}
                    value={formData[field.id] ?? ''}
                    onChange={handleChange}
                    placeholder={field.placeholder || field.label}
                  />
                ) : (
                  <input
                    id={`mobile-${field.id}`}
                    type={field.type}
                    className="mobile-input"
                    name={field.id}
                    value={formData[field.id] ?? ''}
                    onChange={handleChange}
                    placeholder={field.placeholder || field.label}
                    dir={field.dir}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW: A4 Paper Preview */}
        <div className="desktop-view">
          <div className="paper" ref={formRef}>
            {fields.map(field => {
              const style = inputStyle(field);
              if (field.type === 'textarea') {
                return (
                  <textarea
                    key={field.id}
                    name={field.id}
                    value={formData[field.id] ?? ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    style={style}
                  />
                );
              }
              return (
                <input
                  key={field.id}
                  type={field.type}
                  name={field.id}
                  value={formData[field.id] ?? ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  dir={field.dir}
                  style={style}
                />
              );
            })}
          </div>
        </div>

        {/* ACTIONS BAR: Responsive (Sticky on Mobile) */}
        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <Save size={18} />
            <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ'}</span>
          </button>

          <Link href="/dashboard" className="btn btn-accent" style={{ textDecoration: 'none' }}>
            <Settings size={18} />
            <span>الإعدادات</span>
          </Link>

          <button type="button" onClick={handlePrint} className="btn btn-secondary">
            <Printer size={18} />
            <span>طباعة</span>
          </button>

          <button type="button" onClick={handleDownloadPDF} className="btn btn-danger">
            <Download size={18} />
            <span>PDF</span>
          </button>
        </div>
      </form>
    </div>
  );
}
