import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { validatePassword } from '@/lib/validation/password';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('. ') }, { status: 400 });
    }

    const user = dbStore.resetPasswordWithToken(token, newPassword);
    return NextResponse.json({
      success: true,
      message: 'Password successfully updated.',
      user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
