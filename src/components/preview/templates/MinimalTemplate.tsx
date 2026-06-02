import { Invoice, FreelancerProfile } from '@/types';
import { formatCurrency, formatDate, getCurrencySymbol } from '@/lib/formatters';

interface TemplateProps {
  invoice: Invoice;
  profile: FreelancerProfile;
}

export function MinimalTemplate({ invoice, profile }: TemplateProps) {
  const accent = profile.accentColor || '#3b82f6';
  const sym = getCurrencySymbol(invoice.currency);
  const { client } = invoice;
  const clientLocation = [client.address, client.country].filter(Boolean).join(', ');

  return (
    <div className="bg-white min-h-full p-12 font-sans text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {profile.logo ? (
            <img src={profile.logo} alt="Logo" className="h-14 w-auto object-contain mb-3" />
          ) : (
            <div className="text-2xl font-bold mb-1" style={{ color: accent }}>
              {profile.businessName || profile.fullName || 'Your Business'}
            </div>
          )}
          {profile.businessName && profile.logo && (
            <div className="text-sm font-medium text-gray-700">{profile.businessName}</div>
          )}
          <div className="text-sm text-gray-500 mt-2 leading-relaxed">
            {profile.fullName && <div>{profile.fullName}</div>}
            {profile.address && <div>{profile.address}</div>}
            {profile.email && <div>{profile.email}</div>}
            {profile.phone && <div>{profile.phone}</div>}
            {profile.website && <div>{profile.website}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light text-gray-300 tracking-tight mb-2">INVOICE</div>
          <div className="text-lg font-semibold" style={{ color: accent }}>#{invoice.invoiceNumber}</div>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <div className="flex justify-end gap-4">
              <span className="text-gray-400">Date</span>
              <span className="font-medium text-gray-700">{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div className="flex justify-end gap-4">
              <span className="text-gray-400">Due</span>
              <span className="font-medium text-gray-700">{formatDate(invoice.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 mb-8" />

      {/* Bill To */}
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent }}>
          Bill To
        </div>
        {client.name ? (
          <div className="text-sm leading-relaxed">
            <div className="font-semibold text-gray-900 text-base">{client.name}</div>
            {client.company && <div className="text-gray-600">{client.company}</div>}
            {clientLocation && <div className="text-gray-500">{clientLocation}</div>}
            {client.email && <div className="text-gray-500">{client.email}</div>}
            {client.phone && <div className="text-gray-500">{client.phone}</div>}
          </div>
        ) : (
          <div className="text-gray-400 italic text-sm">No client selected</div>
        )}
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr style={{ borderBottom: `2px solid ${accent}` }}>
            <th className="text-left py-3 pr-4 text-xs uppercase tracking-widest font-semibold text-gray-400">Service</th>
            <th className="text-left py-3 pr-4 text-xs uppercase tracking-widest font-semibold text-gray-400">Description</th>
            <th className="text-right py-3 pr-4 text-xs uppercase tracking-widest font-semibold text-gray-400">Qty</th>
            <th className="text-right py-3 pr-4 text-xs uppercase tracking-widest font-semibold text-gray-400">Rate</th>
            <th className="text-right py-3 text-xs uppercase tracking-widest font-semibold text-gray-400">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-300 italic">No items added</td>
            </tr>
          ) : (
            invoice.items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="py-3 pr-4 font-medium text-gray-800">{item.service || '—'}</td>
                <td className="py-3 pr-4 text-gray-500">{item.description || '—'}</td>
                <td className="py-3 pr-4 text-right text-gray-700">{item.quantity}</td>
                <td className="py-3 pr-4 text-right text-gray-700">{sym}{item.rate.toLocaleString()}</td>
                <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(item.amount, invoice.currency)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.discount && invoice.discount.value > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Discount{invoice.discount.type === 'percentage' ? ` (${invoice.discount.value}%)` : ''}</span>
              <span>−{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Tax ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
          )}
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between font-bold text-base" style={{ color: accent }}>
            <span>Total</span>
            <span>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(invoice.paymentInstructions || invoice.notes || invoice.terms) && (
        <>
          <div className="h-px bg-gray-100 mb-6" />
          <div className="grid grid-cols-2 gap-8 text-sm">
            {invoice.paymentInstructions && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">Payment Details</div>
                <div className="text-gray-600 whitespace-pre-line leading-relaxed">{invoice.paymentInstructions}</div>
              </div>
            )}
            <div className="space-y-4">
              {invoice.notes && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">Notes</div>
                  <div className="text-gray-600 whitespace-pre-line leading-relaxed">{invoice.notes}</div>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">Terms</div>
                  <div className="text-gray-500 text-xs whitespace-pre-line leading-relaxed">{invoice.terms}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Signature */}
      {profile.signature && (
        <div className="mt-10 pt-6 border-t border-gray-100">
          <img src={profile.signature} alt="Signature" className="h-12 w-auto object-contain" />
          <div className="text-xs text-gray-400 mt-1">{profile.fullName}</div>
        </div>
      )}

      <div className="mt-10 pt-4 border-t border-gray-100 text-center text-xs text-gray-300">
        Thank you for your business
      </div>
    </div>
  );
}
