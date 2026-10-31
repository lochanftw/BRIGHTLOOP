import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sub = dbStore.getSubscriptionById(params.id);
    if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    return NextResponse.json({ success: true, subscription: sub });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action, status, reason } = await req.json();

    if (action === 'TRANSITION' && status) {
      const updated = dbStore.updateSubscriptionStatus(params.id, status, reason);
      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === 'PAUSE') {
      const updated = dbStore.updateSubscriptionStatus(params.id, 'PAUSED', reason || 'Customer requested pause');
      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === 'RESUME') {
      const updated = dbStore.updateSubscriptionStatus(params.id, 'ACTIVE', 'Resumed billing from pause');
      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === 'CLOSE') {
      const updated = dbStore.updateSubscriptionStatus(params.id, 'CLOSED', reason || 'Cancelled/Closed');
      return NextResponse.json({ success: true, subscription: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

