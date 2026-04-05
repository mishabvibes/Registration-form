import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Simple validation
    if (!body.studentName) {
      return NextResponse.json(
        { message: 'اسم الطالب مطلوب (Student Name is required)' },
        { status: 400 }
      );
    }
    
    const newStudent = await Student.create(body);
    
    return NextResponse.json(
      { message: 'Registered successfully', data: newStudent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
