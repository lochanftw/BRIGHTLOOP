import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inv = dbStore.getInvoiceById(params.id);
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    return NextResponse.json({ success: true, invoice: inv });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action, reason } = await req.json();

    if (action === 'CONFIRM') {
      const updated = dbStore.confirmInvoice(params.id);
      return NextResponse.json({ success: true, invoice: updated });
    }

    if (action === 'CANCEL') {
      const updated = dbStore.cancelInvoice(params.id, reason);
      return NextResponse.json({ success: true, invoice: updated });
    }

    if (action === 'SEND') {
      const email = dbStore.sendInvoiceEmail(params.id);
      const inv = dbStore.getInvoiceById(params.id);
      return NextResponse.json({ success: true, email, invoice: inv });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
