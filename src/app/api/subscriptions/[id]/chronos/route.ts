import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { cyclesAhead = 6, additionalSeats = 0, toggleAddonId, pauseDays = 0 } = await req.json();
    const result = dbStore.simulateChronosFuture(
      params.id,
      cyclesAhead,
      additionalSeats,
      toggleAddonId,
      pauseDays
    );
    return NextResponse.json({ success: true, simulation: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
