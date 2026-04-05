import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store field positions in a simple JSON file — no database needed for config
const CONFIG_FILE = path.join(process.cwd(), 'field-config.json');

function readConfig(): object | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeConfig(fields: unknown): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(fields, null, 2), 'utf-8');
}

export async function GET() {
  const fields = readConfig();
  return NextResponse.json({ fields });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fields } = body;

    if (!Array.isArray(fields)) {
      return NextResponse.json({ message: 'Invalid data: fields must be an array' }, { status: 400 });
    }

    writeConfig(fields);
    return NextResponse.json({ message: 'Saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
