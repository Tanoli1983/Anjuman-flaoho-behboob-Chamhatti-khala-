export type Language = 'en' | 'ur' | 'ur_roman';

export type UserRole = 
  | 'super_admin' 
  | 'treasurer' 
  | 'secretary' 
  | 'office_bearer' 
  | 'auditor';

export interface OfficeBearer {
  id: string;
  name: string;
  role: string;
  phone: string;
  cnic?: string;
}

export interface OrganizationSettings {
  orgName: string;
  orgNameUrdu: string;
  tagline: string;
  address: string;
  phone: string;
  financialYear: string;
  monthlyFee: number; // default PKR 100
  emergencyFee: number; // default PKR 100 per death
  registrationFee: number; // default PKR 100
  newMemberFirstMonthFee: number; // default PKR 100
  currency: string; // "PKR"
  currencySymbol: string; // "Rs."
  officeBearers: OfficeBearer[];
  receiptPrefix: string; // e.g. "AFB-REC"
  lastBackupDate: string | null;
  openingCashBalance: number;
}

export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'deceased';

export interface Member {
  id: string; // e.g. "AFB-001"
  fullName: string;
  fatherName: string;
  mobile: string;
  address: string;
  joiningDate: string; // YYYY-MM-DD
  joiningMonth: string; // YYYY-MM
  status: MemberStatus;
  notes: string;
  registrationDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type ObligationType = 'registration' | 'monthly' | 'emergency';
export type ObligationStatus = 'unpaid' | 'partial' | 'paid' | 'waived';

export interface FeeObligation {
  id: string; // e.g. "OBL-REG-AFB-001", "OBL-MTH-2026-10-AFB-001", "OBL-EMG-EMG1-AFB-001"
  memberId: string;
  type: ObligationType;
  periodMonth?: string; // YYYY-MM for monthly fees
  emergencyEventId?: string; // for emergency fees
  title: string;
  amountDue: number;
  amountPaid: number;
  status: ObligationStatus;
  createdAt: string;
  dueDate?: string;
}

export interface EmergencyEvent {
  id: string; // e.g. "EMG-2026-001"
  deceasedName: string;
  deceasedRelation?: string;
  dateOfDeath: string; // YYYY-MM-DD
  description: string;
  feePerMember: number; // PKR 100 or configured amount at time of event
  eligibleMemberCount: number;
  totalDue: number; // feePerMember * eligibleMemberCount
  totalCollected: number;
  relatedExpenseIds: string[];
  notes: string;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'other';

export interface PaymentAllocation {
  obligationId: string;
  type: ObligationType;
  periodMonth?: string;
  emergencyEventId?: string;
  title: string;
  amount: number;
}

export interface PaymentRecord {
  id: string; // e.g. "PAY-2026-0001"
  receiptNumber: string; // e.g. "AFB-REC-2026-0001"
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  amountReceived: number;
  paymentMethod: PaymentMethod;
  notes: string;
  recordedBy: string;
  allocations: PaymentAllocation[];
  status: 'valid' | 'reversed';
  reversedAt?: string;
  reversalReason?: string;
  createdAt: string;
}

export interface IncomeRecord {
  id: string; // e.g. "INC-2026-001"
  date: string;
  category: string; // e.g. "General Donation", "Zakat/Sadqah", "Welfare Grant", "Special Contribution"
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receivedFrom: string;
  receiptNumber: string;
  notes: string;
  recordedBy: string;
  status: 'valid' | 'reversed';
  reversedAt?: string;
  reversalReason?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string; // e.g. "EXP-2026-001"
  date: string;
  category: string; // e.g. "Dar-ul-Baqa 2 cemetery", "Cemetery maintenance", "Construction and repair", "Funeral transport / ambulance", "Administrative expenses", "Emergency family relief", "Other welfare"
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidTo: string;
  voucherNumber: string;
  notes: string;
  emergencyEventId?: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  status: 'valid' | 'reversed';
  reversedAt?: string;
  reversalReason?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  entityType: string;
  entityId: string;
}

export interface AppState {
  settings: OrganizationSettings;
  members: Member[];
  obligations: FeeObligation[];
  emergencyEvents: EmergencyEvent[];
  payments: PaymentRecord[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  auditLogs: AuditLog[];
}

export interface MemberFinancialSummary {
  member: Member;
  monthlyDue: number;
  monthlyPaid: number;
  monthlyBalance: number;
  emergencyDue: number;
  emergencyPaid: number;
  emergencyBalance: number;
  registrationDue: number;
  registrationPaid: number;
  registrationBalance: number;
  totalPaid: number;
  totalDue: number;
  totalBalance: number; // outstanding amount
}

export interface AccountingSummary {
  openingBalance: number;
  totalRegistrationFees: number;
  totalMonthlyFees: number;
  totalEmergencyFees: number;
  totalDonationsAndOtherIncome: number;
  totalIncomeCollected: number;
  totalExpenses: number;
  netCashBalance: number;
  totalMemberArrears: number;
  totalActiveMembers: number;
  totalInactiveMembers: number;
  totalDeceasedMembers: number;
}
