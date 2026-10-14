import { AppState, Member, FeeObligation, EmergencyEvent, PaymentRecord, ExpenseRecord, IncomeRecord, Announcement, OfficeBearer } from '../types';

export const initialSettings = {
  orgName: 'Anjuman Falah-o-Bahbood Chamhatti Wa Khalabat Butt Karachi',
  orgNameUrdu: 'انجمن فلاح و بہبود چھمھٹی و خالصہ بٹ کراچی',
  tagline: 'Serving Chamhatti & Khalabat Community in Karachi & Native Village through Welfare, Relief & Support',
  address: 'Central Office Karachi / Native Village Haripur, KPK',
  phone: '+92 300 5551234',
  financialYear: '2026-2027',
  monthlyFee: 100, // Monthly Membership Fee: Rs. 100
  emergencyFee: 100, // Emergency Fee: Rs. 100
  registrationFee: 200, // New Member Registration Fee: Rs. 200
  newMemberFirstMonthFee: 100,
  currency: 'PKR',
  currencySymbol: 'Rs.',
  officeBearers: [
    {
      id: 'OB-1',
      name: 'Haji Muhammad Ashraf',
      role: 'صدر (President)',
      category: 'executive' as const,
      phone: '0300-5551234',
      address: 'Karachi Central / Chamhatti',
      appointmentDate: '2026-01-01',
      status: 'active' as const,
      notes: 'President / صدر'
    },
    {
      id: 'OB-2',
      name: 'Raja Safeer Ahmed',
      role: 'نائب صدر (Vice President)',
      category: 'executive' as const,
      phone: '0312-5559876',
      address: 'Khala Butt Sector 1 / Karachi',
      appointmentDate: '2026-01-01',
      status: 'active' as const,
      notes: 'Vice President / نائب صدر'
    },
    {
      id: 'OB-3',
      name: 'Muhammad Tariq Khan',
      role: 'جنرل سیکرٹری (General Secretary)',
      category: 'executive' as const,
      phone: '0333-5554321',
      address: 'Mohallah Bilal, Chamhatti / Karachi',
      appointmentDate: '2026-01-01',
      status: 'active' as const,
      notes: 'General Secretary / جنرل سیکرٹری'
    },
    {
      id: 'OB-4',
      name: 'Malik Zulfiqar Ali',
      role: 'جوائنٹ سیکرٹری (Joint Secretary)',
      category: 'executive' as const,
      phone: '0321-5554444',
      address: 'Chamhatti Kalan / Karachi East',
      appointmentDate: '2026-01-01',
      status: 'active' as const,
      notes: 'Joint Secretary / جوائنٹ سیکرٹری'
    },
    {
      id: 'OB-5',
      name: 'Sardar Aurangzeb',
      role: 'فنانس سیکرٹری (Finance Secretary)',
      category: 'finance' as const,
      phone: '0302-5553333',
      address: 'Khala Butt Sector 2 / Karachi',
      appointmentDate: '2026-01-01',
      status: 'active' as const,
      notes: 'Finance Secretary / فنانس سیکرٹری'
    },
    {
      id: 'OB-6',
      name: 'Abdul Rasheed',
      role: 'خزانچی (Treasurer)',
      category: 'finance' as const,
      phone: '0345-5557890',
      address: 'Near Post Office, Chamhatti / Karachi',
      appointmentDate: '2026-01-01',
      status: 'active' as const,
      notes: 'Treasurer / خزانچی'
    },
    {
      id: 'OB-7',
      name: 'Haji Ghulam Murtaza',
      role: 'علاقائی عہدیدار (Regional Incharge Karachi)',
      category: 'area' as const,
      phone: '0340-5559999',
      address: 'Karachi Baldia Town / Chamhatti Gharbi',
      appointmentDate: '2026-01-01',
      status: 'active' as const,
      notes: 'Karachi Area Incharge'
    },
    {
      id: 'OB-8',
      name: 'Muhammad Nadeem',
      role: 'کمیٹی ممبر (Welfare Committee Member)',
      category: 'committee' as const,
      phone: '0315-5558888',
      address: 'Khala Butt Sector 3 / Karachi',
      appointmentDate: '2026-01-01',
      status: 'active' as const,
      notes: 'Welfare & Funeral Assistance Committee'
    },
  ],
  receiptPrefix: 'AFB-REC',
  lastBackupDate: null,
  openingCashBalance: 0, // Reset to zero!
  adminPin: '', // Empty until owner sets their custom password
  adminPasswordConfigured: false, // Initial setup flow enabled
  securityQuestion: 'What is the registered city of the Anjuman?',
  securityAnswer: 'Karachi',
  recoverySecretKey: 'AFB-RECOVER-2026',
};

// Preserved Registered Members
const rawMembers = [
  { id: 'AFB-001', fullName: 'Muhammad Tariq Khan', fatherName: 'Ghulam Qadir', mobile: '0333-5554321', address: 'Mohallah Bilal, Chamhatti / Karachi', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'General Secretary' },
  { id: 'AFB-002', fullName: 'Haji Muhammad Ashraf', fatherName: 'Muhammad Akram', mobile: '0300-5551234', address: 'Main Road, Chamhatti / Karachi', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'President' },
  { id: 'AFB-003', fullName: 'Abdul Rasheed', fatherName: 'Noor Muhammad', mobile: '0345-5557890', address: 'Near Post Office, Chamhatti / Karachi', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'Treasurer' },
  { id: 'AFB-004', fullName: 'Raja Safeer Ahmed', fatherName: 'Raja Muhammad Zaman', mobile: '0312-5559876', address: 'Khala Butt Sector 1 / Karachi', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'Vice President' },
  { id: 'AFB-005', fullName: 'Muhammad Bashir (Late)', fatherName: 'Ghulam Muhammad', mobile: '0301-5552222', address: 'Mohallah Eidgah, Chamhatti', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'deceased', notes: 'Passed away' },
  { id: 'AFB-006', fullName: 'Sardar Aurangzeb', fatherName: 'Sardar Bostan', mobile: '0302-5553333', address: 'Khala Butt Sector 2 / Karachi', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'Finance Secretary' },
  { id: 'AFB-007', fullName: 'Malik Zulfiqar Ali', fatherName: 'Malik Karam Dad', mobile: '0321-5554444', address: 'Chamhatti Kalan / Karachi East', joiningDate: '2026-01-01', joiningMonth: '2026-01', status: 'active', notes: 'Joint Secretary' },
  { id: 'AFB-008', fullName: 'Muhammad Irfan', fatherName: 'Abdul Rehman', mobile: '0346-5555555', address: 'Mohallah Qabrastan, Chamhatti', joiningDate: '2026-02-01', joiningMonth: '2026-02', status: 'active', notes: '' },
  { id: 'AFB-009', fullName: 'Chaudhry Javed Akhtar', fatherName: 'Chaudhry Ghulam Sarwar', mobile: '0334-5556666', address: 'Chamhatti Khurram / Karachi', joiningDate: '2026-02-01', joiningMonth: '2026-02', status: 'active', notes: '' },
  { id: 'AFB-010', fullName: 'Syed Shahid Hussain', fatherName: 'Syed Altaf Hussain', mobile: '0300-5557777', address: 'Mohallah Sadat, Chamhatti', joiningDate: '2026-03-01', joiningMonth: '2026-03', status: 'active', notes: '' },
  { id: 'AFB-011', fullName: 'Muhammad Nadeem', fatherName: 'Fazal Dad', mobile: '0315-5558888', address: 'Khala Butt Sector 3 / Karachi', joiningDate: '2026-03-01', joiningMonth: '2026-03', status: 'active', notes: 'Committee Member' },
  { id: 'AFB-012', fullName: 'Haji Ghulam Murtaza', fatherName: 'Muhammad Sadiq', mobile: '0340-5559999', address: 'Chamhatti Gharbi / Karachi', joiningDate: '2026-04-01', joiningMonth: '2026-04', status: 'active', notes: 'Regional Incharge' },
  { id: 'AFB-013', fullName: 'Waqas Ahmed', fatherName: 'Muhammad Riaz', mobile: '0303-5550001', address: 'Mohallah Darbar, Chamhatti', joiningDate: '2026-04-01', joiningMonth: '2026-04', status: 'active', notes: '' },
  { id: 'AFB-014', fullName: 'Sohail Tanveer', fatherName: 'Tanveer Ahmed', mobile: '0331-5550002', address: 'Chamhatti Sharqi', joiningDate: '2026-05-01', joiningMonth: '2026-05', status: 'active', notes: '' },
  { id: 'AFB-015', fullName: 'Hafiz Muhammad Bilal', fatherName: 'Qari Abdul Ghafoor', mobile: '0342-5550003', address: 'Madrasa Road, Chamhatti', joiningDate: '2026-05-01', joiningMonth: '2026-05', status: 'active', notes: '' },
  { id: 'AFB-016', fullName: 'Zahid Mehmood', fatherName: 'Mehmood Khan', mobile: '0305-5550004', address: 'Main Bazar, Chamhatti', joiningDate: '2026-06-01', joiningMonth: '2026-06', status: 'active', notes: '' },
  { id: 'AFB-017', fullName: 'Arshad Ali', fatherName: 'Barkat Ali', mobile: '0313-5550005', address: 'Mohallah Gulshan, Chamhatti', joiningDate: '2026-06-01', joiningMonth: '2026-06', status: 'active', notes: '' },
  { id: 'AFB-018', fullName: 'Muhammad Kamran', fatherName: 'Muhammad Rafiq', mobile: '0322-5550006', address: 'Khala Butt Sector 4 / Karachi', joiningDate: '2026-07-01', joiningMonth: '2026-07', status: 'active', notes: '' },
  { id: 'AFB-019', fullName: 'Naveed Akhtar', fatherName: 'Akhtar Hussain', mobile: '0336-5550007', address: 'Chamhatti Kalan', joiningDate: '2026-07-01', joiningMonth: '2026-07', status: 'active', notes: '' },
  { id: 'AFB-020', fullName: 'Shahbaz Khan', fatherName: 'Fateh Khan', mobile: '0344-5550008', address: 'Mohallah Rajputan, Chamhatti', joiningDate: '2026-08-01', joiningMonth: '2026-08', status: 'active', notes: '' },
  { id: 'AFB-021', fullName: 'Muhammad Rizwan', fatherName: 'Muhammad Aslam', mobile: '0308-5550009', address: 'Khala Butt Sector 1', joiningDate: '2026-09-01', joiningMonth: '2026-09', status: 'active', notes: '' },
  { id: 'AFB-022', fullName: 'Qaiser Mehmood', fatherName: 'Sultan Mehmood', mobile: '0317-5550010', address: 'Near Jamia Masjid, Chamhatti', joiningDate: '2026-10-01', joiningMonth: '2026-10', status: 'active', notes: '' },
];

export const initialMembers: Member[] = rawMembers.map(m => ({
  ...m,
  status: m.status as Member['status'],
  registrationDate: m.joiningDate,
  createdAt: `${m.joiningDate}T08:00:00Z`,
  updatedAt: `${m.joiningDate}T08:00:00Z`,
}));

// STRICTLY ZEROED OUT AS REQUESTED:
// Remove ALL existing payment, fee, donation, expense, and financial transaction entries!
export const initialObligations: FeeObligation[] = [];
export const initialPayments: PaymentRecord[] = [];
export const initialExpenses: ExpenseRecord[] = [];
export const initialIncomes: IncomeRecord[] = [];
export const initialEmergencyEvents: EmergencyEvent[] = [];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ANN-1',
    title: 'General Body Meeting Karachi',
    titleUrdu: 'جنرل باڈی کا اہم اجلاس کراچی',
    content: 'All community members and office-bearers are cordially invited to the upcoming general meeting regarding community welfare and Dar-ul-Baqa cemetery matters.',
    date: '2026-10-15',
    type: 'meeting',
    author: 'General Secretary',
    pinned: true,
    createdAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'ANN-2',
    title: 'New Member Registration Open (Fee: Rs. 200)',
    titleUrdu: 'نئے ممبران کا اندراج جاری ہے (داخلہ فیس 200 روپے)',
    content: 'Registration is open for all expatriates and residents of Chamhatti & Khalabat Butt in Karachi. Monthly fee is Rs. 100.',
    date: '2026-10-01',
    type: 'general',
    author: 'President',
    pinned: false,
    createdAt: '2026-10-01T08:00:00Z',
  }
];

export const initialAuditLogs = [
  {
    id: 'AUDIT-001',
    timestamp: '2026-10-14 00:00:00',
    user: 'Administrator',
    action: 'FINANCIAL_CLEAN_SLATE',
    details: 'All old test payments, expenses, and sample financial transactions have been completely cleared. Fresh and accurate accounting initialized with zero totals.',
    entityType: 'System',
    entityId: 'SYS',
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
  announcements: initialAnnouncements,
  auditLogs: initialAuditLogs,
};
