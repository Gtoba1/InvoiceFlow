import { Invoice, FreelancerProfile } from '@/types';
import { formatCurrency, formatDate, getCurrencySymbol } from '@/lib/formatters';

interface TemplateProps {
  invoice: Invoice;
  profile: FreelancerProfile;
}

export function ModernTemplate({ invoice, profile }: TemplateProps) {
  const accent = profile.accentColor || '#3b82f6';
  const sym = getCurrencySymbol(invoice.currency);
  const { client } = invoice;
  const clientLocation = [client.address, client.country].filter(Boolean).join(', ');

  return (
    <div className="bg-gray-50 min-h-full font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Coloured header */}
      <div className="p-10 pb-8" style={{ background: `linear-gradient(135deg, ${accent}ee, ${accent})` }}>
        <div className="flex justify-between items-start">
          <div>
            {profile.logo ? (
              <img src={profile.logo} alt="Logo" className="h-12 w-auto object-contain mb-3 brightness-0 invert" />
            ) : (
              <div className="text-2xl font-bold text-white mb-1">
                {profile.businessName || profile.fullName || 'Your Business'}
              </div>
            )}
            <div className="text-white/70 text-sm leading-relaxed mt-2">
              {profile.address && <div>{profile.address}</div>}
              {profile.email && <div>{profile.email}</div>}
              {profile.website && <div>{profile.website}</div>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/60 text-xs uppercase tracking-widest font-medium mb-1">Invoice</div>
            <div className="text-white text-3xl font-bold">{invoice.invoiceNumber}</div>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-end gap-3">
                <span className="text-white/60">Issued</span>
                <span className="text-white font-medium">{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex justify-end gap-3">
                <span className="text-white/60">Due</span>
                <span className="text-white font-medium">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium uppercase tracking-wider">
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="p-10">
        {/* From / To */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent }}>From</div>
            <div className="text-sm leading-relaxed">
              <div className="font-semibold text-gray-900">{profile.fullName || 'Your Name'}</div>
              {profile.businessName && <div className="text-gray-600">{profile.businessName}</div>}
              {profile.phone && <div className="text-gray-500">{profile.phone}</div>}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent }}>Bill To</div>
            {client.name ? (
              <div className="text-sm leading-relaxed">
                <div className="font-semibold text-gray-900">{client.name}</div>
                {client.company && <div className="text-gray-600">{client.company}</div>}
                {clientLocation && <div className="text-gray-500">{clientLocation}</div>}
                {client.email && <div className="text-gray-500">{client.email}</div>}
                {client.phone && <div className="text-gray-500">{client.phone}</div>}
              </div>
            ) : (
              <div className="text-gray-400 italic text-sm">No client selected</div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: accent + '10' }}>
                <th className="text-left py-4 px-5 text-xs uppercase tracking-widest font-semibold" style={{ color: accent }}>Service</th>
                <th className="text-left py-4 px-3 text-xs uppercase tracking-widest font-semibold" style={{ color: accent }}>Description</th>
                <th className="text-right py-4 px-3 text-xs uppercase tracking-widest font-semibold" style={{ color: accent }}>Qty</th>
                <th className="text-right py-4 px-3 text-xs uppercase tracking-widest font-semibold" style={{ color: accent }}>Rate</th>
                <th className="text-right py-4 px-5 text-xs uppercase tracking-widest font-semibold" style={{ color: accent }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-300 italic">No items added</td></tr>
              ) : (
                invoice.items.map((item, idx) => (
                  <tr key={item.id} className={`border-t border-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-4 px-5 font-medium text-gray-800">{item.service || '—'}</td>
                    <td className="py-4 px-3 text-gray-500 text-xs">{item.description || '—'}</td>
                    <td className="py-4 px-3 text-right text-gray-700">{item.quantity}</td>
                    <td className="py-4 px-3 text-right text-gray-700">{sym}{item.rate.toLocaleString()}</td>
                    <td className="py-4 px-5 text-right font-bold" style={{ color: accent }}>{formatCurrency(item.amount, invoice.currency)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-72">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-700">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.discount && invoice.discount.value > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Discount{invoice.discount.type === 'percentage' ? ` (${invoice.discount.value}%)` : ''}</span>
                  <span className="text-red-500 font-medium">−{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                </div>
              )}
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="font-medium text-gray-700">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold" style={{ color: accent }}>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(invoice.paymentInstructions || invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-2 gap-6">
            {invoice.paymentInstructions && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent }}>Payment Details</div>
                <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{invoice.paymentInstructions}</div>
              </div>
            )}
            {(invoice.notes || invoice.terms) && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                {invoice.notes && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>Notes</div>
                    <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{invoice.notes}</div>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>Terms</div>
                    <div className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{invoice.terms}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Signature */}
        {profile.signature && (
          <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-gray-100 inline-block">
            <img src={profile.signature} alt="Signature" className="h-10 w-auto object-contain" />
            <div className="text-xs text-gray-400 mt-1">{profile.fullName}</div>
          </div>
        )}
      </div>
    </div>
  );
}
