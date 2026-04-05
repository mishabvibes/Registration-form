import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ─── Local file fallback (used when MONGODB_URI is not set) ───────────────────
const CONFIG_FILE = path.join(process.cwd(), 'field-config.json');

function readLocalConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

function writeLocalConfig(fields: unknown) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(fields, null, 2), 'utf-8');
}

// ─── MongoDB storage (used when MONGODB_URI is set — e.g. on Vercel) ─────────
async function getMongoCollection() {
  const mongoose = (await import('mongoose')).default;
  const dbConnect = (await import('@/lib/mongodb')).default;
  await dbConnect();

  const schema = new mongoose.Schema({
    key:    { type: String, required: true, unique: true },
    fields: { type: mongoose.Schema.Types.Mixed, required: true },
  });

  return mongoose.models.FieldConfig ?? mongoose.model('FieldConfig', schema);
}

// ─── Route handlers ───────────────────────────────────────────────────────────
export async function GET() {
  try {
    if (process.env.MONGODB_URI) {
      const Model = await getMongoCollection();
      const doc = await Model.findOne({ key: 'form-field-positions' });
      return NextResponse.json({ fields: doc?.fields ?? null });
    }

    // Local fallback
    return NextResponse.json({ fields: readLocalConfig() });
  } catch (error: any) {
    console.error('[field-config GET]', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { fields } = await req.json();

    if (!Array.isArray(fields)) {
      return NextResponse.json({ message: 'Invalid data: fields must be an array' }, { status: 400 });
    }

    if (process.env.MONGODB_URI) {
      const Model = await getMongoCollection();
      await Model.findOneAndUpdate(
        { key: 'form-field-positions' },
        { key: 'form-field-positions', fields },
        { upsert: true, new: true }
      );
    } else {
      // Local fallback
      writeLocalConfig(fields);
    }

    return NextResponse.json({ message: 'Saved successfully' });
  } catch (error: any) {
    console.error('[field-config POST]', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

