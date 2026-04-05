export interface FieldDef {
  id: string;
  label: string;       // Arabic label for display
  type: 'text' | 'tel' | 'date' | 'textarea';
  dir?: 'ltr' | 'rtl';
  // position as % of paper container
  top: number;
  left: number;
  width: number;
  height: number;
  fontSize: number;
  // textarea min-height in px (only for textarea)
  rows?: number;
}

export const DEFAULT_FIELDS: FieldDef[] = [
  { id: 'registrationNumber', label: 'رقم التسجيل',     type: 'text',     top: 22,  left: 5,  width: 30, height: 3, fontSize: 16 },
  { id: 'studentName',        label: 'اسم الطالب',       type: 'text',     top: 26,  left: 5,  width: 60, height: 3, fontSize: 16 },
  { id: 'dob',                label: 'تاريخ الولادة',    type: 'date',     top: 30,  left: 5,  width: 30, height: 3, fontSize: 16, dir: 'ltr' },
  { id: 'address',            label: 'العنوان الكامل',   type: 'textarea', top: 34,  left: 5,  width: 60, height: 8, fontSize: 16, rows: 3 },
  { id: 'fatherName',         label: 'اسم الوالد',       type: 'text',     top: 44,  left: 5,  width: 60, height: 3, fontSize: 16 },
  { id: 'fatherPhone',        label: 'رقم الهاتف (والد)', type: 'tel',    top: 48,  left: 5,  width: 40, height: 3, fontSize: 16, dir: 'ltr' },
  { id: 'guardianName',       label: 'اسم الولي',        type: 'text',     top: 52,  left: 5,  width: 60, height: 3, fontSize: 16 },
  { id: 'guardianPhone',      label: 'رقم الهاتف (ولي)', type: 'tel',     top: 56,  left: 5,  width: 40, height: 3, fontSize: 16, dir: 'ltr' },
  { id: 'guardianJob',        label: 'وظيفته',           type: 'text',     top: 60,  left: 5,  width: 60, height: 3, fontSize: 16 },
  { id: 'institutes',         label: 'أ - المعاهد',      type: 'text',     top: 65,  left: 5,  width: 60, height: 3, fontSize: 16 },
  { id: 'teachers',           label: 'ب - الأساتذة',     type: 'text',     top: 69,  left: 5,  width: 60, height: 3, fontSize: 16 },
  { id: 'booksLearned',       label: 'ج - الكتب',        type: 'text',     top: 73,  left: 5,  width: 60, height: 3, fontSize: 16 },
  { id: 'secularEducation',   label: 'الدراسة المادية',  type: 'text',     top: 78,  left: 5,  width: 60, height: 3, fontSize: 16 },
  { id: 'date',               label: 'التاريخ',          type: 'date',     top: 85,  left: 15, width: 22, height: 3, fontSize: 16, dir: 'ltr' },
  { id: 'place',              label: 'المحل',            type: 'text',     top: 89,  left: 15, width: 22, height: 3, fontSize: 16 },
];
