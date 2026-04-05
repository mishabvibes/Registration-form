'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, Printer, Save, Settings } from 'lucide-react';
import { DEFAULT_FIELDS, FieldDef } from '@/lib/fieldDefs';

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([...DEFAULT_FIELDS]);

  // Load field positions from API (set by dashboard)
  useEffect(() => {
    fetch('/api/field-config')
      .then((r) => r.json())
      .then((data) => {
        if (data.fields && Array.isArray(data.fields)) {
          setFields(data.fields);
        }
      })
      .catch(() => {/* use defaults */ });
  }, []);

  const [formData, setFormData] = useState<Record<string, string>>({
    registrationNumber: '',
    studentName: '',
    dob: '',
    address: '',
    fatherName: '',
    fatherPhone: '',
    guardianName: '',
    guardianPhone: '',
    guardianJob: '',
    institutes: '',
    teachers: '',
    booksLearned: '',
    secularEducation: '',
    date: '',
    place: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined') return;
    const html2pdf = (await import('html2pdf.js')).default;
    const element = formRef.current;
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `Registration_${formData.studentName || 'Form'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };
    html2pdf().set(opt).from(element).save();
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
      const data = await res.json();
      if (res.ok) {
        setSuccess('تم حفظ البيانات بنجاح!');
      } else {
        alert(data.message || 'حدث خطأ أثناء الحفظ');
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {success && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="paper" ref={formRef}>
          {fields.map((field) => {
            const style: React.CSSProperties = {
              top: `${field.top}%`,
              left: `${field.left}%`,
              width: `${field.width}%`,
              height: `${field.height}%`,
              fontSize: field.fontSize,
              direction: field.dir || 'rtl',
            };

            if (field.type === 'textarea') {
              return (
                <textarea
                  key={field.id}
                  name={field.id}
                  value={formData[field.id] ?? ''}
                  onChange={handleChange}
                  className="form-overlay-input"
                  style={{ ...style, resize: 'none' }}
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
                className="form-overlay-input"
                style={style}
                dir={field.dir}
              />
            );
          })}
        </div>

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <Save size={20} />
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </button>

          <Link href="/dashboard" className="btn btn-primary" style={{ backgroundColor: '#6366f1', textDecoration: 'none' }}>
            <Settings size={20} />
            لوحة التحكم
          </Link>

          <button type="button" onClick={handlePrint} className="btn btn-secondary">
            <Printer size={20} />
            طباعة
          </button>

          <button type="button" onClick={handleDownloadPDF} className="btn btn-primary" style={{ backgroundColor: '#E3342F' }}>
            <Download size={20} />
            تحميل PDF
          </button>
        </div>
      </form>
    </div>
  );
}
