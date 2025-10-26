/* Why: Quick deep-links to new pages (UX). */
export const managerLinks = (engagementId?: string) => [
  { href: '/manager/dashboard', label: 'Dashboard' },
  { href: '/manager/engagements', label: 'Engagements' },
  ...(engagementId
    ? [
        { href: `/manager/engagements/${engagementId}/working-papers`, label: 'Working Papers' },
        { href: `/manager/engagements/${engagementId}/sampling`, label: 'Sampling' },
      ]
    : []),
];
