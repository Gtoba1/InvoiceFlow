/**
 * API route: /api/invoices
 * GET  — list all saved invoices for the authenticated user
 * POST — save a new invoice (with its line items)
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch invoices with their line items in one query
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items, ...invoiceData } = await request.json();

  // Insert the invoice header
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({ ...invoiceData, user_id: user.id })
    .select()
    .single();

  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 });

  // Insert all line items linked to the new invoice
  if (items && items.length > 0) {
    const lineItems = items.map((item: Record<string, unknown>, index: number) => ({
      invoice_id: invoice.id,
      service_name: item.service,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      sort_order: index,
    }));

    const { error: itemsError } = await supabase.from('invoice_items').insert(lineItems);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json(invoice, { status: 201 });
}
