/**
 * API route: /api/invoices/[id]
 * GET    — fetch one invoice with its line items
 * PUT    — update an invoice and replace its line items
 * DELETE — delete an invoice (items cascade automatically)
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { items, ...invoiceData } = await request.json();

  // Update the invoice header
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .update({ ...invoiceData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 });

  // Replace all line items: delete old ones, insert new ones
  await supabase.from('invoice_items').delete().eq('invoice_id', id);

  if (items && items.length > 0) {
    const lineItems = items.map((item: Record<string, unknown>, index: number) => ({
      invoice_id: id,
      service_name: item.service,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      sort_order: index,
    }));
    await supabase.from('invoice_items').insert(lineItems);
  }

  return NextResponse.json(invoice);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
