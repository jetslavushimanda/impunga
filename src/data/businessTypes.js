export const BUSINESS_TYPES = [
  {
    id: 'sole_trader',
    name: 'Sole Trader / Business Name',
    description: 'The simplest and most common structure for a one-person business in Zambia. You register a business name under your personal identity.',
    bestFor: ['One-person businesses', 'Small vendors and traders', 'Home-based businesses', 'Freelancers and consultants'],
    pros: ['Cheapest to register (around K220)', 'Fastest to complete (2-5 days)', 'Simple record keeping', 'Full control of your business', 'Easy to operate'],
    cons: ['You are personally liable for debts', 'Harder to get large bank loans', 'Business dies if you die', 'Limited ability to bring in partners'],
    pacraFee: 220,
    timeToRegister: '2-5 business days',
    documentsNeeded: ['National Registration Card (NRC)', 'Completed PACRA Business Name form', 'K220 registration fee', 'Proof of address (optional)'],
  },
  {
    id: 'partnership',
    name: 'Partnership',
    description: 'A business owned and operated by two or more people who share profits, losses and responsibilities under a formal partnership agreement.',
    bestFor: ['Two to five business partners', 'Shared skill businesses', 'Professional practices', 'Family businesses with multiple owners'],
    pros: ['More capital from multiple partners', 'Shared responsibilities and workload', 'Combined skills and knowledge', 'Simple to establish'],
    cons: ['All partners liable for debts', 'Disagreements can destroy business', 'Profits must be shared', 'Difficult to transfer ownership'],
    pacraFee: 350,
    timeToRegister: '5-7 business days',
    documentsNeeded: ['NRC copies of all partners', 'Partnership agreement (signed by all)', 'Completed PACRA Partnership form', 'K350 registration fee', 'Proof of business address'],
  },
  {
    id: 'private_limited',
    name: 'Private Limited Company (Ltd)',
    description: 'A separate legal entity from its owners. The company can own property, enter contracts and be sued independently from the shareholders.',
    bestFor: ['Businesses seeking investment', 'Businesses needing bank loans', 'Businesses with growth ambitions', 'Businesses handling large contracts', 'Multiple shareholders'],
    pros: ['Limited personal liability', 'Easier to get bank loans and investment', 'Professional credibility', 'Can have multiple shareholders', 'Business continues if owner dies'],
    cons: ['Most expensive to register (K1,500+)', 'More complex record keeping', 'Must file annual returns with PACRA', 'Requires company secretary', 'More regulatory requirements'],
    pacraFee: 1500,
    timeToRegister: '10-14 business days',
    documentsNeeded: ['NRC of all directors and shareholders', 'Memorandum and Articles of Association', 'Form 1 (Application to register company)', 'Form 6 (Notice of registered office)', 'K1,500+ registration fees', 'Proof of registered office address'],
  },
  {
    id: 'cbo',
    name: 'Community Based Organisation (CBO)',
    description: 'A non-profit community organization focused on social or development goals rather than personal profit. Popular for community projects and NGO funding.',
    bestFor: ['Community development projects', 'Social enterprises', 'Organizations seeking NGO funding', 'Youth or women groups', 'Agricultural cooperatives'],
    pros: ['Eligible for NGO and donor funding', 'Tax exemptions in many cases', 'Community trust and credibility', 'Suitable for social missions', 'Often eligible for government grants'],
    cons: ['Cannot distribute profits to members', 'More complex governance requirements', 'Must have a constitution', 'Requires a committee structure', 'Reporting requirements to funders'],
    pacraFee: 150,
    timeToRegister: '7-10 business days',
    documentsNeeded: ['Constitution (organization rules)', 'Meeting minutes of founding meeting', 'List of committee members with NRCs', 'K150 registration fee', 'Proof of physical address', 'Bank account details (after registration)'],
  },
];

export function getBusinessTypeById(id) {
  return BUSINESS_TYPES.find(t => t.id === id);
}
