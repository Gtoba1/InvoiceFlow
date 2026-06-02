import { Invoice, FreelancerProfile } from '@/types';
import { formatCurrency, formatDate, getCurrencySymbol } from '@/lib/formatters';

interface TemplateProps {
  invoice: Invoice;
  profile: FreelancerProfile;
}

export function CorporateTemplate({ invoice, profile }: TemplateProps) {
  const accent = profile.accentColor || '#1e3a8a';
  const sym = getCurrencySymbol(invoice.currency);
  const { client } = invoice;
  const clientLocation = [client.address, client.country].filter(Boolean).join(', ');

  return (
    <div className="bg-white min-h-full font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="h-2" style={{ backgroundColor: accent }} />

      {/* Header */}
      <div className="px-12 py-8 border-b-2" style={{ borderColor: accent + '20' }}>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            {profile.logo && <img src={profile.logo} alt="Logo" className="h-16 w-auto object-contain" />}
            <div>
              <div className="text-xl font-bold" style={{ color: accent }}>
                {profile.businessName || profile.fullName || 'Your Business'}
              </div>
              <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                {profile.fullName && profile.businessName && <div>{profile.fullName}</div>}
                {profile.address && <div>{profile.address}</div>}
                {profile.email && <div>{profile.email}</div>}
                {profile.phone && <div>{profile.phone}</div>}
                {profile.website && <div>{profile.website}</div>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: accent }}>INVOICE</div>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-end gap-6">
                <span className="text-gray-400 font-medium">Invoice No.</span>
                <span className="font-bold text-gray-900 min-w-[100px] text-right">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-end gap-6">
                <span className="text-gray-400 font-medium">Issue Date</span>
                <span className="text-gray-700 min-w-[100px] text-right">{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex justify-end gap-6">
                <span className="text-gray-400 font-medium">Due Date</span>
                <span className="font-semibold text-gray-900 min-w-[100px] text-right">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To / Payment */}
      <div className="px-12 py-6 grid grid-cols-2 gap-8 bg-gray-50 border-b" style={{ borderColor: accent + '20' }}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3 pb-2 border-b-2" style={{ color: accent, borderColor: accent }}>
            Billed To
          </div>
          {client.name ? (
            <div className="text-sm space-y-0.5">
              <div className="font-bold text-gray-900 text-base">{client.name}</div>
              {client.company && <div className="text-gray-700 font-medium">{client.company}</div>}
              {clientLocation && <div className="text-gray-500">{clientLocation}</div>}
              {client.email && <div className="text-gray-500">{client.email}</div>}
              {client.phone && <div className="text-gray-500">{client.phone}</div>}
            </div>
          ) : (
            <div className="text-gray-400 italic text-sm">No client selected</div>
          )}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3 pb-2 border-b-2" style={{ color: accent, borderColor: accent }}>
            Payment Method
          </div>
          {invoice.paymentInstructions ? (
            <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{invoice.paymentInstructions}</div>
          ) : (
            <div className="text-gray-400 italic text-sm">No payment details</div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="px-12 py-8">
        <table className="w-full text-sm mb-8">
          <thead>
            <tr style={{ backgroundColor: accent, color: 'white' }}>
              <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Service</th>
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase tracking-wider">Description</th>
              <th className="text-center py-3 px-3 font-semibold text-xs uppercase tracking-wider">Qty</th>
              <th className="text-right py-3 px-3 font-semibold text-xs uppercase tracking-wider">Rate</th>
              <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-300 italic border border-t-0 border-gray-100">
                  No items added
                </td>
              </tr>
            ) : (
              invoice.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100" style={{ backgroundColor: idx % 2 === 1 ? accent + '05' : 'white' }}>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{item.service || '—'}</td>
                  <td className="py-3.5 px-3 text-gray-500 text-xs">{item.description || '—'}</td>
                  <td className="py-3.5 px-3 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-3.5 px-3 text-right text-gray-700">{sym}{item.rate.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-gray-900">{formatCurrency(item.amount, invoice.currency)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 border border-gray-200 rounded overflow-hidden">
            <div className="flex justify-between px-4 py-2.5 text-sm border-b border-gray-100">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            {invoice.discount && invoice.discount.value > 0 && (
              <div className="flex justify-between px-4 py-2.5 text-sm border-b border-gray-100">
                <span className="text-gray-500">Discount{invoice.discount.type === 'percentage' ? ` (${invoice.discount.value}%)` : ''}</span>
                <span className="font-medium text-red-600">−{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
              </div>
            )}
            {invoice.taxRate > 0 && (
              <div className="flex justify-between px-4 py-2.5 text-sm border-b border-gray-100">
                <span className="text-gray-500">Tax ({invoice.taxRate}%)</span>
                <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3 font-bold text-white" style={{ backgroundColor: accent }}>
              <span className="text-sm uppercase tracking-wide">Total Due</span>
              <span className="text-lg">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-8 text-sm">
            {invoice.notes && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Notes</div>
                <div className="text-gray-600 whitespace-pre-line leading-relaxed">{invoice.notes}</div>
              </div>
            )}
            {invoice.terms && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Terms &amp; Conditions</div>
                <div className="text-gray-500 text-xs whitespace-pre-line leading-relaxed">{invoice.terms}</div>
              </div>
            )}
          </div>
        )}

        {/* Signature */}
        {profile.signature && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <img src={profile.signature} alt="Signature" className="h-12 w-auto object-contain" />
            <div className="border-t border-gray-300 mt-2 pt-1 text-xs text-gray-500">
              {profile.fullName} — Authorized Signature
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-12 py-4 text-xs text-gray-400 border-t border-gray-100 flex justify-between">
        <span>{profile.businessName || profile.fullName}</span>
        <span>Thank you for your business</span>
        <span>{invoice.invoiceNumber}</span>
      </div>

      <div className="h-1.5" style={{ backgroundColor: accent }} />
    </div>
  );
}
