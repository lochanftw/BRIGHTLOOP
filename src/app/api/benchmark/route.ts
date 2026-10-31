import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'ALL';
    const telemetry = dbStore.getExecutiveTelemetry(period);
    return NextResponse.json({ success: true, telemetry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, count = 2500 } = await req.json();

    if (action === 'RESET') {
      dbStore.resetToDefault();
      return NextResponse.json({
        success: true,
        message: 'System reset to default seed state',
        telemetry: dbStore.getExecutiveTelemetry(),
      });
    }

    if (action === 'SEED_BENCHMARK') {
      const benchmarkResult = dbStore.seedBenchmark(count);
      return NextResponse.json({
        success: true,
        benchmark: benchmarkResult,
        telemetry: dbStore.getExecutiveTelemetry(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
