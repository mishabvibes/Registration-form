import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: false },
  studentName: { type: String, required: true },
  dob: { type: String, required: false },
  address: { type: String, required: false },
  fatherName: { type: String, required: false },
  fatherPhone: { type: String, required: false },
  guardianName: { type: String, required: false },
  guardianPhone: { type: String, required: false },
  guardianJob: { type: String, required: false },
  institutes: { type: String, required: false },
  teachers: { type: String, required: false },
  booksLearned: { type: String, required: false },
  secularEducation: { type: String, required: false },
  date: { type: String, required: false },
  place: { type: String, required: false },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
