import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const rows = dbStore.getBankStatements();
    return NextResponse.json({ success: true, items: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rowId, actor = 'Marcus Chen' } = await req.json();
    if (!rowId) return NextResponse.json({ error: 'Bank row ID is required' }, { status: 400 });

    const result = dbStore.reconcileBankRow(rowId, actor);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
