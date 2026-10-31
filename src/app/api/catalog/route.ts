import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      products: dbStore.getProducts(),
      plans: dbStore.getPlans(),
      templates: dbStore.getTemplates(),
      taxRules: dbStore.getTaxRules(),
      discountRules: dbStore.getDiscountRules(),
      users: dbStore.getUsers().map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        companyName: u.companyName,
        role: u.role,
        department: u.department,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorRole = req.headers.get('x-user-role') || 'ADMIN';
    if (actorRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can modify catalog definitions.' },
        { status: 403 }
      );
    }

    const { type, data } = await req.json();

    if (type === 'PRODUCT') {
      const prod = dbStore.createProduct(data);
      return NextResponse.json({ success: true, product: prod });
    }
    if (type === 'PLAN') {
      const plan = dbStore.createPlan(data);
      return NextResponse.json({ success: true, plan });
    }
    if (type === 'TAX_RULE') {
      const tax = dbStore.createTaxRule(data);
      return NextResponse.json({ success: true, taxRule: tax });
    }
    if (type === 'DISCOUNT_RULE') {
      const disc = dbStore.createDiscountRule(data);
      return NextResponse.json({ success: true, discountRule: disc });
    }

    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
