import { useState } from 'react';
import { ShoppingCart, TrendingUp, MapPin, Wheat, Leaf, Package, Zap, Smartphone, HardHat } from 'lucide-react';
import { MARKET_PRICES, PROVINCES } from '../data/marketPrices';

const CATEGORY_ICONS = {
  'Grains & Staples': Wheat,
  'Vegetables & Fruits': Leaf,
  'Meat & Protein': Package,
  'Fuel & Transport': Zap,
  'Mobile & Airtime': Smartphone,
  'Building Materials': HardHat,
};

export default function MarketPrices() {
  const [province, setProvince] = useState('Lusaka');
  const [category, setCategory] = useState('All');

  const categories = ['All', ...MARKET_PRICES.map(c => c.category)];
  const filtered = category === 'All' ? MARKET_PRICES : MARKET_PRICES.filter(c => c.category === category);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-accent-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Zambia Market Prices</h1>
          <p className="text-gray-500 text-sm">Typical market prices by province — reference guide for 2026</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Your Province
            </label>
            <select value={province} onChange={e => setProvince(e.target.value)} className="select-field">
              {PROVINCES.sort().map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="select-field">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-start gap-2">
        <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />
        <span><b>Note:</b> These are typical market price ranges for <b>{province} Province</b>. Prices vary by vendor, season and location. Use as a guide for your business pricing decisions.</span>
      </div>

      <div className="space-y-4">
        {filtered.map(cat => {
          const Icon = CATEGORY_ICONS[cat.category] || Package;
          return (
            <div key={cat.category} className="card">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" /> {cat.category}
              </h2>
              <div className="divide-y divide-gray-50">
                {cat.items.map(item => {
                  const [min, max] = item.prices[province] || [0, 0];
                  const mid = Math.round((min + max) / 2);
                  return (
                    <div key={item.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">per {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">K{min} – K{max}</p>
                        <p className="text-xs text-gray-400">avg K{mid}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-4 bg-surface-blue border border-primary/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-primary text-sm">Use This for Your Business</p>
            <p className="text-gray-600 text-sm mt-1">Know your input costs then go to the <b>Pricing Calculator</b> to set the right selling price and make real profit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
