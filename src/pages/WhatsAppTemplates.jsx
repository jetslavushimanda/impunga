import { useState } from 'react';
import { MessageCircle, Copy, Check, Search, DollarSign, Package, CreditCard, Star, Megaphone } from 'lucide-react';

const CATEGORY_ICONS = {
  'Quotations & Pricing': DollarSign,
  'Orders & Delivery': Package,
  'Payments & Invoices': CreditCard,
  'Customer Service': Star,
  'Marketing & Promotions': Megaphone,
};

const TEMPLATES = [
  {
    category: 'Quotations & Pricing',
    icon: DollarSign,
    templates: [
      { title: 'Send a Price Quote', message: `Good day [Client Name],\n\nThank you for your enquiry. Please find our quotation below:\n\nService/Product: [Description]\nQuantity: [Qty]\nUnit Price: K[Amount]\nTotal: K[Total]\n\nThis quote is valid for 7 days.\n\nTo confirm your order, please reply to this message or call us.\n\nThank you for choosing [Your Business Name].\n\nRegards,\n[Your Name]\n[Phone Number]` },
      { title: 'Follow Up on Quote', message: `Hello [Client Name],\n\nI hope you are doing well. I am following up on the quotation I sent you on [Date] for [Service/Product].\n\nHave you had a chance to review it? I would be happy to answer any questions or adjust the quote to suit your budget.\n\nPlease feel free to contact me at any time.\n\nThank you,\n[Your Name] - [Business Name]\n[Phone Number]` },
      { title: 'Price Increase Notice', message: `Dear valued customer,\n\nI hope this message finds you well.\n\nI would like to inform you that due to increased costs of [materials/fuel/supplies], our prices will be adjusted by [X]% from [Date].\n\nCurrent price: K[Old Price]\nNew price: K[New Price]\n\nWe value your continued support and have kept this increase as small as possible. Please place any orders before [Date] to benefit from current prices.\n\nThank you for understanding.\n\n[Your Name] - [Business Name]` },
    ]
  },
  {
    category: 'Orders & Delivery',
    icon: Package,
    templates: [
      { title: 'Order Confirmation', message: `Hello [Client Name],\n\nYour order has been confirmed. Here are the details:\n\nOrder: [Product/Service]\nQuantity: [Qty]\nAmount: K[Total]\nDelivery/Ready Date: [Date]\nDelivery Location: [Address or Collection Point]\n\nPayment: [Paid / Balance of K[Amount] due on delivery]\n\nWe will notify you when your order is ready. Thank you for your business!\n\n[Your Name] - [Business Name]` },
      { title: 'Order Ready for Collection', message: `Hello [Client Name],\n\nYour order is READY for collection! 🎉\n\nWhat to collect: [Product/Service]\nWhere: [Location]\nCollection time: [Time] today\n\nPlease bring: [Payment if balance due / Your order reference]\n\nIf you need delivery, please let us know. Delivery charge: K[Amount]\n\nSee you soon!\n\n[Your Name] - [Business Name]` },
      { title: 'Out of Stock Notice', message: `Hello [Client Name],\n\nI am sorry to inform you that [Product] is currently out of stock.\n\nExpected restock date: [Date]\n\nI can:\n✅ Reserve stock for you when it arrives\n✅ Suggest an alternative: [Alternative Product] at K[Price]\n✅ Refund your deposit if you prefer\n\nPlease let me know how you would like to proceed. I apologise for the inconvenience.\n\n[Your Name] - [Business Name]` },
    ]
  },
  {
    category: 'Payments & Invoices',
    icon: CreditCard,
    templates: [
      { title: 'Payment Reminder', message: `Hello [Client Name],\n\nI hope you are well. This is a friendly reminder that payment for [Service/Product] delivered on [Date] is still outstanding.\n\nAmount due: K[Amount]\nDue date: [Date]\n\nPayment options:\n📱 MTN Mobile Money: [Number]\n📱 Airtel Money: [Number]\n🏦 Bank: [Bank Name, Account Number]\n\nIf you have already made payment, please ignore this message and send proof of payment.\n\nThank you,\n[Your Name] - [Business Name]` },
      { title: 'Payment Received Thank You', message: `Hello [Client Name],\n\nPayment received! ✅ Thank you.\n\nAmount: K[Amount]\nDate received: [Date]\nFor: [Service/Product]\n\nYour balance is now: K[Balance] / FULLY PAID\n\nWe truly appreciate your business. Please do not hesitate to contact us for any future needs.\n\n[Your Name] - [Business Name]` },
      { title: 'Deposit Request', message: `Hello [Client Name],\n\nThank you for choosing [Business Name].\n\nTo confirm your booking/order for [Service/Product], we require a deposit of K[Amount] (50% of the total K[Total]).\n\nDeposit payment options:\n📱 MTN: [Number]\n📱 Airtel: [Number]\n\nPlease send proof of payment after paying. The remaining balance of K[Balance] will be due on [Date/Delivery].\n\nThank you!\n[Your Name]` },
    ]
  },
  {
    category: 'Customer Service',
    icon: Star,
    templates: [
      { title: 'Thank You After Purchase', message: `Hello [Client Name],\n\nThank you so much for your purchase from [Business Name]! 🙏\n\nWe hope you are happy with [Product/Service]. Your satisfaction means everything to us.\n\nIf you have any questions or need support, please do not hesitate to message us.\n\nWe would love to see you again. Tell a friend about us! 😊\n\n[Your Name] - [Business Name]\n[Phone Number]` },
      { title: 'Request for Review/Referral', message: `Hello [Client Name],\n\nI hope you are enjoying your [Product/Service] from us!\n\nIf you are happy with our service, we would really appreciate it if you could:\n\n⭐ Recommend us to a friend or family member\n📸 Share a photo of our work on Facebook/WhatsApp\n\nEvery referral helps our small business grow. As a thank you, you will receive K[Discount] off your next order!\n\nThank you for your support 🙏\n\n[Your Name] - [Business Name]` },
      { title: 'Apology for Delay', message: `Hello [Client Name],\n\nI sincerely apologise for the delay in delivering your [Order/Service]. I understand this is inconvenient and I am truly sorry.\n\nThe delay was caused by: [Reason]\n\nYour order will now be ready by: [New Date]\n\nAs an apology, I would like to offer you: [Discount / Extra item / Free delivery]\n\nThank you for your patience and continued support. I promise to do better.\n\n[Your Name] - [Business Name]` },
    ]
  },
  {
    category: 'Marketing & Promotions',
    icon: Megaphone,
    templates: [
      { title: 'New Product Announcement', message: `🆕 NEW ARRIVAL at [Business Name]!\n\n[Product Name] is now available!\n\n✅ [Feature 1]\n✅ [Feature 2]\n✅ [Feature 3]\n\nPrice: K[Amount]\n\nLimited stock available. Order now before it sells out!\n\nCall/WhatsApp: [Phone Number]\nLocation: [Address]\n\n#Zambia #[City] #[BusinessName]` },
      { title: 'Special Offer / Sale', message: `🔥 SPECIAL OFFER from [Business Name]!\n\n[Product/Service] now at K[Sale Price] (was K[Original Price])\n\nThat's [X]% OFF! 🎉\n\nOffer valid: [Start Date] to [End Date] only\nWhile stocks last!\n\nTo order:\n📱 WhatsApp/Call: [Phone Number]\n📍 Visit us at: [Location]\n\nDon't miss out! Share with friends 👇` },
    ]
  },
];

export default function WhatsAppTemplates() {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...TEMPLATES.map(t => t.category)];
  const filtered = TEMPLATES
    .filter(cat => selectedCategory === 'All' || cat.category === selectedCategory)
    .map(cat => ({
      ...cat,
      templates: cat.templates.filter(t =>
        !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.message.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(cat => cat.templates.length > 0);

  async function copy(message, id) {
    await navigator.clipboard.writeText(message);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  }

  function openWhatsApp(message) {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
          <MessageCircle className="w-5 h-5" style={{ color: '#25D366' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Message Templates</h1>
          <p className="text-gray-500 text-sm">Professional templates for every business situation — copy and send</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search templates..." />
          </div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="select-field w-48">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
        Replace <b>[items in brackets]</b> with your own details before sending.
      </div>

      {filtered.map(cat => {
        const CatIcon = CATEGORY_ICONS[cat.category] || MessageCircle;
        return (
        <div key={cat.category} className="mb-6">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <CatIcon className="w-5 h-5 text-primary" /> {cat.category}
          </h2>
          <div className="space-y-3">
            {cat.templates.map((tmpl, i) => {
              const id = `${cat.category}-${i}`;
              return (
                <div key={id} className="card">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-gray-800 text-sm">{tmpl.title}</h3>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => copy(tmpl.message, id)} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors">
                        {copied === id ? <><Check className="w-3 h-3 text-green-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                      <button onClick={() => openWhatsApp(tmpl.message)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors" style={{ backgroundColor: '#25D366' }}>
                        <MessageCircle className="w-3 h-3" /> Send
                      </button>
                    </div>
                  </div>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-surface-light rounded-lg p-3 font-sans leading-relaxed max-h-40 overflow-y-auto">
                    {tmpl.message}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
        );
      })}
    </div>
  );
}
