export function formatKwacha(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'K0';
  return `K${Number(amount).toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatKwachaSimple(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'K0';
  const num = Number(amount);
  if (num >= 1000000) return `K${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `K${(num / 1000).toFixed(1)}K`;
  return `K${num.toFixed(0)}`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getDaysSince(timestamp) {
  if (!timestamp) return 0;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-ZM', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-ZM', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

export function extractViabilityScore(text) {
  const patterns = [
    /viability.*?score.*?(\d+)(?:\s*\/\s*10|\s*out\s*of\s*10)/i,
    /score.*?(\d+)\s*\/\s*10/i,
    /(\d+)\s*\/\s*10/,
    /(\d+)\s*out\s*of\s*10/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= 0 && score <= 10) return score;
    }
  }
  return null;
}

export function getScoreColor(score) {
  if (score >= 8) return 'score-high';
  if (score >= 5) return 'score-medium';
  return 'score-low';
}

export function getScoreLabel(score) {
  if (score >= 8) return 'PROCEED';
  if (score >= 5) return 'REFINE';
  return 'RECONSIDER';
}

export function calculateProfit(revenue, costs) {
  return revenue - costs;
}

export function calculateProfitMargin(profit, revenue) {
  if (!revenue || revenue === 0) return 0;
  return (profit / revenue) * 100;
}

export function calculateRecommendedPrice(costPerUnit, desiredMarginPercent) {
  return costPerUnit / (1 - desiredMarginPercent / 100);
}

export function calculateBreakEven(fixedCosts, pricePerUnit, variableCostPerUnit) {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) return Infinity;
  return Math.ceil(fixedCosts / contributionMargin);
}

export function getFirstName(fullName) {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

export function getInitials(fullName) {
  if (!fullName) return '?';
  return fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.toLocaleString('en', { month: 'long' }), year: now.getFullYear() };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const OCCUPATION_LABELS = {
  student: 'Secondary School Student',
  outOfSchool: 'Out of School Youth',
  university: 'University Student',
  jobseeker: 'Job Seeker / Unemployed',
  vendor: 'Market Vendor',
  farmer: 'Farmer',
  artisan: 'Local Artisan / Tradesperson',
  employed: 'Employed Person',
  retired: 'Retired Person',
  other: 'Other',
};

export const EXPERIENCE_LABELS = {
  beginner: 'Complete beginner, never started',
  hasIdea: 'Have an idea, not started yet',
  started: 'Started but not registered',
  registered: 'Registered and operating',
};
