import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { validatePassword } from '@/lib/validation/password';

export async function POST(req: NextRequest) {
  try {
    const actorRole = req.headers.get('x-user-role') || 'ADMIN';
    if (actorRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can create staff accounts.' },
        { status: 403 }
      );
    }

    const { email, password, fullName, department } = await req.json();
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required staff fields' }, { status: 400 });
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('. ') }, { status: 400 });
    }

    const newStaff = dbStore.createUser({
      email,
      passwordHash: password,
      fullName,
      companyName: 'Brightloop Software Corp',
      role: 'INTERNAL_STAFF',
      department: department || 'Operations',
      isActive: true,
    });

    return NextResponse.json({ success: true, user: newStaff });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
