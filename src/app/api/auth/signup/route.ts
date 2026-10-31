import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { validatePassword } from '@/lib/validation/password';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, companyName } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 });
    }

    // Check email uniqueness
    const existing = dbStore.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists at Brightloop.' },
        { status: 409 }
      );
    }

    // Strict Password Policy
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('. ') }, { status: 400 });
    }

    const newUser = dbStore.createUser({
      email,
      passwordHash: password,
      fullName,
      companyName: companyName || fullName,
      role: 'CUSTOMER',
      isActive: true,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
