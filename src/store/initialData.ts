import { AppState, Member, FeeObligation, EmergencyEvent, PaymentRecord, ExpenseRecord, IncomeRecord } from '../types';

export const initialSettings = {
  orgName: 'Anjuman Falah-o-Behbood Chamhatti Khala Butt',
  orgNameUrdu: 'انجمن فلاح و بہبود چھمھٹی خالصہ / کھالہ بٹ',
  tagline: 'Serving Chamhatti Khala Butt through Community Welfare, Cemetery Care & Funeral Relief',
  address: 'Main Bazar, Chamhatti Khala Butt, Haripur / KPK',
  phone: '+92 300 5551234',
  financialYear: '2026-2027',
  monthlyFee: 100,
  emergencyFee: 100,
  registrationFee: 100,
  newMemberFirstMonthFee: 100,
  currency: 'PKR',
  currencySymbol: 'Rs.',
  officeBearers: [
    { id: 'OB-1', name: 'Haji Muhammad Ashraf', role: 'President (صدر)', phone: '0300-5551234' },
    { id: 'OB-2', name: 'Muhammad Tariq Khan', role: 'General Secretary (جنرل سیکرٹری)', phone: '0333-5554321' },
    { id: 'OB-3', name: 'Abdul Rasheed', role: 'Treasurer (خزانچی)', phone: '0345-5557890' },
    { id: 'OB-4', name: 'Raja Safeer Ahmed', role: 'Vice President (نائب صدر)', phone: '0312-5559876' },
  ],
  receiptPrefix: 'AFB-REC',
  lastBackupDate: '2026-10-12 18:30:00',
  openingCashBalance: 150000,
};

// Seed members representing village families in Chamhatti Khala Butt
const rawMembers = [
  { id: 'AFB-001', fullName: 'Muhammad Tariq Khan', fatherName: 'Ghulam Qadir', mobile: '0333-5554321', address: 'Mohallah Masjid Bilal, Chamhatti', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'General Secretary' },
  { id: 'AFB-002', fullName: 'Haji Muhammad Ashraf', fatherName: 'Muhammad Akram', mobile: '0300-5551234', address: 'Main Road, Chamhatti', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'President' },
  { id: 'AFB-003', fullName: 'Abdul Rasheed', fatherName: 'Noor Muhammad', mobile: '0345-5557890', address: 'Near Post Office, Chamhatti', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'Treasurer' },
  { id: 'AFB-004', fullName: 'Raja Safeer Ahmed', fatherName: 'Raja Muhammad Zaman', mobile: '0312-5559876', address: 'Khala Butt Sector 1', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'Vice President' },
  { id: 'AFB-005', fullName: 'Muhammad Bashir (Late)', fatherName: 'Ghulam Muhammad', mobile: '0301-5552222', address: 'Mohallah Eidgah, Chamhatti', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'deceased', notes: 'Passed away on 10 Aug 2026' },
  { id: 'AFB-006', fullName: 'Sardar Aurangzeb', fatherName: 'Sardar Bostan', mobile: '0302-5553333', address: 'Khala Butt Sector 2', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'Senior Member' },
  { id: 'AFB-007', fullName: 'Malik Zulfiqar Ali', fatherName: 'Malik Karam Dad', mobile: '0321-5554444', address: 'Chamhatti Kalan', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: '' },
  { id: 'AFB-008', fullName: 'Muhammad Irfan', fatherName: 'Abdul Rehman', mobile: '0346-5555555', address: 'Mohallah Qabrastan, Chamhatti', joiningDate: '2026-02-01', joiningMonth: '2026-02', status: 'active', notes: '' },
  { id: 'AFB-009', fullName: 'Chaudhry Javed Akhtar', fatherName: 'Chaudhry Ghulam Sarwar', mobile: '0334-5556666', address: 'Chamhatti Khurram', joiningDate: '2026-02-01', joiningMonth: '2026-02', status: 'active', notes: '' },
  { id: 'AFB-010', fullName: 'Syed Shahid Hussain', fatherName: 'Syed Altaf Hussain', mobile: '0300-5557777', address: 'Mohallah Sadat, Chamhatti', joiningDate: '2026-03-01', joiningMonth: '2026-03', status: 'active', notes: '' },
  { id: 'AFB-011', fullName: 'Muhammad Nadeem', fatherName: 'Fazal Dad', mobile: '0315-5558888', address: 'Khala Butt Sector 3', joiningDate: '2026-03-01', joiningMonth: '2026-03', status: 'active', notes: '' },
  { id: 'AFB-012', fullName: 'Haji Ghulam Murtaza', fatherName: 'Muhammad Sadiq', mobile: '0340-5559999', address: 'Chamhatti Gharbi', joiningDate: '2026-04-01', joiningMonth: '2026-04', status: 'active', notes: '' },
  { id: 'AFB-013', fullName: 'Waqas Ahmed', fatherName: 'Muhammad Riaz', mobile: '0303-5550001', address: 'Mohallah Darbar, Chamhatti', joiningDate: '2026-04-01', joiningMonth: '2026-04', status: 'active', notes: '' },
  { id: 'AFB-014', fullName: 'Sohail Tanveer', fatherName: 'Tanveer Ahmed', mobile: '0331-5550002', address: 'Chamhatti Sharqi', joiningDate: '2026-05-01', joiningMonth: '2026-05', status: 'active', notes: '' },
  { id: 'AFB-015', fullName: 'Hafiz Muhammad Bilal', fatherName: 'Qari Abdul Ghafoor', mobile: '0342-5550003', address: 'Madrasa Road, Chamhatti', joiningDate: '2026-05-01', joiningMonth: '2026-05', status: 'active', notes: '' },
  { id: 'AFB-016', fullName: 'Zahid Mehmood', fatherName: 'Mehmood Khan', mobile: '0305-5550004', address: 'Main Bazar, Chamhatti', joiningDate: '2026-06-01', joiningMonth: '2026-06', status: 'active', notes: '' },
  { id: 'AFB-017', fullName: 'Arshad Ali', fatherName: 'Barkat Ali', mobile: '0313-5550005', address: 'Mohallah Gulshan, Chamhatti', joiningDate: '2026-06-01', joiningMonth: '2026-06', status: 'active', notes: '' },
  { id: 'AFB-018', fullName: 'Muhammad Kamran', fatherName: 'Muhammad Rafiq', mobile: '0322-5550006', address: 'Khala Butt Sector 4', joiningDate: '2026-07-01', joiningMonth: '2026-07', status: 'active', notes: '' },
  { id: 'AFB-019', fullName: 'Naveed Akhtar', fatherName: 'Akhtar Hussain', mobile: '0336-5550007', address: 'Chamhatti Kalan', joiningDate: '2026-07-01', joiningMonth: '2026-07', status: 'active', notes: '' },
  { id: 'AFB-020', fullName: 'Shahbaz Khan', fatherName: 'Fateh Khan', mobile: '0344-5550008', address: 'Mohallah Rajputan, Chamhatti', joiningDate: '2026-08-01', joiningMonth: '2026-08', status: 'active', notes: '' },
  { id: 'AFB-021', fullName: 'Muhammad Rizwan', fatherName: 'Muhammad Aslam', mobile: '0308-5550009', address: 'Khala Butt Sector 1', joiningDate: '2026-09-01', joiningMonth: '2026-09', status: 'active', notes: '' },
  { id: 'AFB-022', fullName: 'Qaiser Mehmood', fatherName: 'Sultan Mehmood', mobile: '0317-5550010', address: 'Near Jamia Masjid, Chamhatti', joiningDate: '2026-10-01', joiningMonth: '2026-10', status: 'active', notes: 'New member October 2026' },
];

export const initialMembers: Member[] = rawMembers.map(m => ({
  ...m,
  status: m.status as Member['status'],
  registrationDate: m.joiningDate,
  createdAt: `${m.joiningDate}T08:00:00Z`,
  updatedAt: `${m.joiningDate}T08:00:00Z`,
}));

// Emergency event for Marhoom Muhammad Bashir
export const initialEmergencyEvents: EmergencyEvent[] = [
  {
    id: 'EMG-2026-001',
    deceasedName: 'Muhammad Bashir s/o Ghulam Muhammad',
    deceasedRelation: 'Member (AFB-005)',
    dateOfDeath: '2026-08-10',
    description: 'Sad Demise of Senior Village Member. Funeral held at Dar-ul-Baqa 2 cemetery Chamhatti.',
    feePerMember: 100,
    eligibleMemberCount: 20, // 20 members were active in August
    totalDue: 2000,
    totalCollected: 2000,
    relatedExpenseIds: ['EXP-2026-003'],
    notes: 'Kafan dafan assistance provided to bereaved family.',
    createdAt: '2026-08-10T12:00:00Z',
  }
];

// Obligations: Registration fees + First month fees + Emergency fee + Monthly fees for Sep, Oct
export const initialObligations: FeeObligation[] = [];
export const initialPayments: PaymentRecord[] = [];

// Populate registration obligations and initial months
let receiptCounter = 1;

initialMembers.forEach((member) => {
  // 1. Registration obligation
  const regOblId = `OBL-REG-${member.id}`;
  const isNewInOct = member.id === 'AFB-022'; // Joined October 2026

  initialObligations.push({
    id: regOblId,
    memberId: member.id,
    type: 'registration',
    title: 'Registration Fee (داخلہ فیس)',
    amountDue: 100,
    amountPaid: isNewInOct ? 0 : 100,
    status: isNewInOct ? 'unpaid' : 'paid',
    createdAt: `${member.joiningDate}T08:00:00Z`,
    dueDate: member.joiningDate,
  });

  // 2. Monthly obligation for joining month
  const firstMonthOblId = `OBL-MTH-${member.joiningMonth}-${member.id}`;
  initialObligations.push({
    id: firstMonthOblId,
    memberId: member.id,
    type: 'monthly',
    periodMonth: member.joiningMonth,
    title: `Monthly Fee ${member.joiningMonth} (ماہانہ فیس)`,
    amountDue: 100,
    amountPaid: isNewInOct ? 0 : 100,
    status: isNewInOct ? 'unpaid' : 'paid',
    createdAt: `${member.joiningDate}T08:00:00Z`,
    dueDate: `${member.joiningMonth}-15`,
  });

  // 3. Emergency fee obligation for members active in August 2026
  if (member.joiningMonth <= '2026-08' && member.id !== 'AFB-005') {
    const emgOblId = `OBL-EMG-EMG-2026-001-${member.id}`;
    initialObligations.push({
      id: emgOblId,
      memberId: member.id,
      type: 'emergency',
      emergencyEventId: 'EMG-2026-001',
      title: 'Emergency Fee: Marhoom Bashir (کفن دفن فنڈ)',
      amountDue: 100,
      amountPaid: 100,
      status: 'paid',
      createdAt: '2026-08-10T12:00:00Z',
      dueDate: '2026-08-25',
    });
  }

  // Record payment for established members (exclude AFB-022 so user sees initial 200 PKR due in test)
  if (!isNewInOct && member.id !== 'AFB-005') {
    const payId = `PAY-2026-${String(receiptCounter).padStart(4, '0')}`;
    const recNo = `AFB-REC-2026-${String(receiptCounter).padStart(4, '0')}`;
    receiptCounter++;

    initialPayments.push({
      id: payId,
      receiptNumber: recNo,
      memberId: member.id,
      memberName: member.fullName,
      date: member.joiningDate,
      amountReceived: 200,
      paymentMethod: 'cash',
      notes: 'Initial Registration (100) + Joining Month Fee (100)',
      recordedBy: 'Treasurer Abdul Rasheed',
      allocations: [
        {
          obligationId: regOblId,
          type: 'registration',
          title: 'Registration Fee',
          amount: 100,
        },
        {
          obligationId: firstMonthOblId,
          type: 'monthly',
          periodMonth: member.joiningMonth,
          title: `Monthly Fee ${member.joiningMonth}`,
          amount: 100,
        }
      ],
      status: 'valid',
      createdAt: `${member.joiningDate}T09:00:00Z`,
    });
  }
});

// Critical Accounting Requirement Test D Transactions:
// Expense 1 = PKR 28,500.
// Expense 2 = PKR 31,200.
// Expense 3 = PKR 20,000.
// Correct total expenses = PKR 79,700!
export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'EXP-2026-001',
    date: '2026-06-15',
    category: 'Dar-ul-Baqa 2 cemetery',
    description: 'Dar-ul-Baqa 2 cemetery main boundary wall & security iron gate repair',
    amount: 28500,
    paymentMethod: 'cash',
    paidTo: 'Mistri Ghulam Abbas Construction',
    voucherNumber: 'VOUCH-2026-01',
    notes: 'Approved by Executive Committee meeting June 2026',
    createdBy: 'Treasurer Abdul Rasheed',
    createdAt: '2026-06-15T11:00:00Z',
    lastModified: '2026-06-15T11:00:00Z',
    status: 'valid',
  },
  {
    id: 'EXP-2026-002',
    date: '2026-07-20',
    category: 'Cemetery maintenance',
    description: 'Cemetery maintenance, water supply tank repair, pipes and grass cutting tools',
    amount: 31200,
    paymentMethod: 'cash',
    paidTo: 'Haji Sanitary & Hardware Khala Butt',
    voucherNumber: 'VOUCH-2026-02',
    notes: 'Water supply line restored for graveyard ablution & tree plantation',
    createdBy: 'Treasurer Abdul Rasheed',
    createdAt: '2026-07-20T14:30:00Z',
    lastModified: '2026-07-20T14:30:00Z',
    status: 'valid',
  },
  {
    id: 'EXP-2026-003',
    date: '2026-08-10',
    category: 'Funeral transport / ambulance',
    description: 'Funeral transport, ambulance fuel and immediate relief assistance for Marhoom Bashir family',
    amount: 20000,
    paymentMethod: 'cash',
    paidTo: 'Family of Late Muhammad Bashir / Driver',
    voucherNumber: 'VOUCH-2026-03',
    notes: 'Emergency death assistance sanctioned under Kafan-Dafan rules',
    emergencyEventId: 'EMG-2026-001',
    createdBy: 'President Haji Ashraf',
    createdAt: '2026-08-10T16:00:00Z',
    lastModified: '2026-08-10T16:00:00Z',
    status: 'valid',
  },
];

// General donations from well-wishers
export const initialIncomes: IncomeRecord[] = [
  {
    id: 'INC-2026-001',
    date: '2026-05-10',
    category: 'Overseas Welfare Grant',
    description: 'Special welfare grant sent by Chamhatti overseas workers community in UK',
    amount: 50000,
    paymentMethod: 'bank_transfer',
    receivedFrom: 'Chamhatti Welfare Forum UK (Sardar Tariq)',
    receiptNumber: 'DON-2026-01',
    notes: 'Restricted for Dar-ul-Baqa cemetery improvements',
    recordedBy: 'General Secretary Tariq',
    status: 'valid',
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'INC-2026-002',
    date: '2026-07-05',
    category: 'General Donation',
    description: 'Voluntary contribution for community funeral fund',
    amount: 25000,
    paymentMethod: 'cash',
    receivedFrom: 'Malik Zulfiqar & Brothers',
    receiptNumber: 'DON-2026-02',
    notes: 'Donation for ongoing graveyard care',
    recordedBy: 'Treasurer Abdul Rasheed',
    status: 'valid',
    createdAt: '2026-07-05T12:00:00Z',
  }
];

export const initialAuditLogs = [
  {
    id: 'AUDIT-001',
    timestamp: '2026-01-01 09:00:00',
    user: 'System Admin',
    action: 'SYSTEM_INIT',
    details: 'Anjuman Falah-o-Behbood Chamhatti Khala Butt management system initialized.',
    entityType: 'System',
    entityId: 'SYS',
  },
  {
    id: 'AUDIT-002',
    timestamp: '2026-06-15 11:00:00',
    user: 'Treasurer Abdul Rasheed',
    action: 'CREATE_EXPENSE',
    details: 'Recorded expense PKR 28,500 for Dar-ul-Baqa 2 cemetery gate repair.',
    entityType: 'Expense',
    entityId: 'EXP-2026-001',
  },
  {
    id: 'AUDIT-003',
    timestamp: '2026-07-20 14:30:00',
    user: 'Treasurer Abdul Rasheed',
    action: 'CREATE_EXPENSE',
    details: 'Recorded expense PKR 31,200 for Cemetery maintenance.',
    entityType: 'Expense',
    entityId: 'EXP-2026-002',
  },
  {
    id: 'AUDIT-004',
    timestamp: '2026-08-10 16:00:00',
    user: 'President Haji Ashraf',
    action: 'CREATE_EXPENSE',
    details: 'Recorded expense PKR 20,000 for Funeral transport & emergency assistance.',
    entityType: 'Expense',
    entityId: 'EXP-2026-003',
  },
];

export const initialAppState: AppState = {
  settings: initialSettings,
  members: initialMembers,
  obligations: initialObligations,
  emergencyEvents: initialEmergencyEvents,
  payments: initialPayments,
  incomes: initialIncomes,
  expenses: initialExpenses,
  auditLogs: initialAuditLogs,
};
