// ---------------------------------------------------------------------------
// SENTINELX — evidence vault and AI link predictions (fictional demo data)
// ---------------------------------------------------------------------------

import type { EvidenceItem, LinkPrediction } from '../types';

export const EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev01',
    ref: 'EV-0184',
    kind: 'TRANSACTION',
    title: 'RTGS transfer record — Rs 18,40,000',
    collected: '2026-06-22',
    entityIds: ['e18', 'e19', 'e31', 'e01'],
    caseId: 'c01',
    integrity: 'VERIFIED',
    summary:
      'Bank-issued transfer record covering the flagged movement from the subject savings account into the Apex Holdings current account, plus the onward leg nine days later.',
    fields: {
      'Originating account': 'HDFC ---2291',
      'Beneficiary account': 'Apex Current ---7744',
      Amount: 'Rs 18,40,000',
      Channel: 'RTGS',
      'Value date': '21 Jun 2026, 14:22 IST',
      'Onward leg': 'Rs 6,10,000 to Konkan Traders ---3390 (30 Jun 2026)',
      'Reporting flag': 'Above automatic threshold',
    },
  },
  {
    id: 'ev02',
    ref: 'EV-0191',
    kind: 'CHAT_RECORD',
    title: 'Message metadata — burner line to associates',
    collected: '2026-07-02',
    entityIds: ['e14', 'e01', 'e02', 'e04'],
    caseId: 'c01',
    integrity: 'VERIFIED',
    summary:
      'Metadata summary (counterparties, timestamps and frequency only — no message content) for the unregistered prepaid line across the investigation window.',
    fields: {
      Line: '+91 98xxx-11234',
      'Distinct counterparties': '4',
      'Total exchanges': '318',
      'Peak window': '22:00 – 02:00 IST',
      'Counterparties inside network': '100%',
      'Content captured': 'None — metadata only',
    },
  },
  {
    id: 'ev03',
    ref: 'EV-0203',
    kind: 'IP_LOG',
    title: 'Registration origin log — shared static IP',
    collected: '2026-07-11',
    entityIds: ['e26', 'e24', 'e25', 'e09'],
    caseId: 'c02',
    integrity: 'VERIFIED',
    summary:
      'Service-provider registration log showing two supposedly unrelated organizations creating mailboxes from a single static business IP nine days apart.',
    fields: {
      'IP address': '103.87.xx.14',
      Allocation: 'Static / business',
      Geolocation: 'Andheri East, Mumbai',
      'Registration 1': 'r.mehta.exports@ (09 May 2026)',
      'Registration 2': 'accounts@apexholdings (18 May 2026)',
      'Concurrent sessions': '6 observed',
    },
  },
  {
    id: 'ev04',
    ref: 'EV-0212',
    kind: 'DEVICE_MATCH',
    title: 'Device fingerprint correlation — FP-8841-A',
    collected: '2026-07-30',
    entityIds: ['e28', 'e14', 'e20', 'e01'],
    caseId: 'c01',
    integrity: 'VERIFIED',
    summary:
      'Fingerprint correlation tying the unregistered prepaid line and the public business social account to a single handset — the strongest identity link in the case.',
    fields: {
      'Fingerprint ID': 'FP-8841-A',
      'Device class': 'Mobile handset',
      'Identity 1': '+91 98xxx-11234 (unregistered line)',
      'Identity 2': '@rohan.exports (public account)',
      'Match confidence': '96%',
      'Observation window': '14 May – 29 Jul 2026',
    },
  },
  {
    id: 'ev05',
    ref: 'EV-0225',
    kind: 'WALLET_ACTIVITY',
    title: 'Wallet hop trace — bc1q-xxxx-4d7f',
    collected: '2026-08-02',
    entityIds: ['e29', 'e30', 'e19'],
    caseId: 'c02',
    integrity: 'UNVERIFIED',
    summary:
      'Chain-analysis summary of value entering the primary wallet following the flagged bank transfer, then dispersing through intermediate hops to a second wallet.',
    fields: {
      'Primary wallet': 'bc1q-xxxx-4d7f',
      'Funding event': '28 Jun 2026, post fiat transfer',
      'Intermediate hops': '4',
      'Terminal wallet': 'bc1q-xxxx-9a02',
      'Attribution status': 'Unattributed',
      Note: 'Simulated chain data — not a live blockchain query',
    },
  },
  {
    id: 'ev06',
    ref: 'EV-0238',
    kind: 'LOCATION_DATA',
    title: 'Site activity log — Bhiwandi warehouse',
    collected: '2026-08-21',
    entityIds: ['e11', 'e16', 'e27'],
    caseId: 'c01',
    integrity: 'VERIFIED',
    summary:
      'Gate and telematics log for the registered warehouse showing repeated heavy-vehicle movement well outside declared operating hours.',
    fields: {
      Site: 'Bhiwandi warehouse',
      'Declared hours': '08:00 – 20:00',
      'Out-of-hours movements': '11',
      'Time band': '01:00 – 04:00 IST',
      Vehicle: 'MH-00-XX-0000',
      'Correlated IP sessions': '45.112.xx.203',
    },
  },
  {
    id: 'ev07',
    ref: 'EV-0244',
    kind: 'DOCUMENT',
    title: 'Incorporation filing — Apex Holdings',
    collected: '2026-08-24',
    entityIds: ['e09', 'e05', 'e24'],
    caseId: 'c02',
    integrity: 'VERIFIED',
    summary:
      'Registrar filing listing a sole director, with correspondence routed to a mailbox controlled by an individual holding no declared role in the company.',
    fields: {
      Company: 'Apex Holdings',
      'Incorporated on': '18 May 2026',
      'Sole director': 'Devika Nair',
      'Correspondence address': 'r.mehta.exports@mailbox.example',
      'Declared activity': 'None filed',
      'Days before flagged transfer': '34',
    },
  },
  {
    id: 'ev08',
    ref: 'EV-0251',
    kind: 'TRANSACTION',
    title: 'Account statement extract — Konkan Traders',
    collected: '2026-08-27',
    entityIds: ['e23', 'e10', 'e32'],
    caseId: 'c02',
    integrity: 'UNVERIFIED',
    summary:
      'Partial statement extract for the terminal account in the traced chain, showing limited activity outside the flagged inbound transfer.',
    fields: {
      Account: 'Konkan Traders Current ---3390',
      'Inbound (flagged)': 'Rs 6,10,000 (30 Jun 2026)',
      'Other activity (90d)': '7 transactions',
      'Median other value': 'Rs 24,500',
      'Statement completeness': 'Partial — pending full disclosure',
    },
  },
];

/**
 * Candidate relationships surfaced by the (simulated) link-prediction pass.
 * The investigator triages each one: confirm, investigate, or dismiss.
 */
export const LINK_PREDICTIONS: LinkPrediction[] = [
  {
    id: 'lp01',
    source: 'e01',
    target: 'e09',
    confidence: 87,
    reasons: [
      'Correspondence mailbox shared with the company filing',
      'Both mailboxes registered from a single static IP',
      'Transfer originated 34 days after incorporation',
    ],
    verdict: 'PENDING',
  },
  {
    id: 'lp02',
    source: 'e05',
    target: 'e01',
    confidence: 74,
    reasons: [
      'Sole bridge between the operational and financial clusters',
      'Two-hop path through the accountant of record',
      'Directorship timing aligns with subject activity',
    ],
    verdict: 'PENDING',
  },
  {
    id: 'lp03',
    source: 'e28',
    target: 'e02',
    confidence: 63,
    reasons: [
      'Handset co-located with associate during 6 movement windows',
      'Session overlap on the Bhiwandi corridor carrier IP',
    ],
    verdict: 'PENDING',
  },
  {
    id: 'lp04',
    source: 'e30',
    target: 'e10',
    confidence: 58,
    reasons: [
      'Terminal wallet activity follows the onward fiat transfer',
      'Timing correlation across four intermediate hops',
    ],
    verdict: 'PENDING',
  },
];
