import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const customerId = url.searchParams.get('customerId') || undefined;
    const query = url.searchParams.get('query') || undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;

    const result = dbStore.getInvoices({ status, customerId, query, limit, offset });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Batch Billing Run (Novelty #2: Zero-Leakage Cryptographic Idempotency Ledger)
export async function POST(req: NextRequest) {
  try {
    const { targetDate, actorId = 'user-staff', actorRole = 'INTERNAL_STAFF' } = await req.json();
    const billingDate = targetDate || new Date().toISOString().split('T')[0];

    const result = await dbStore.executeBatchBilling(billingDate, actorId, actorRole);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
