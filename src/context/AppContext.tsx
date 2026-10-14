import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppState,
  Member,
  FeeObligation,
  EmergencyEvent,
  PaymentRecord,
  ExpenseRecord,
  IncomeRecord,
  OrganizationSettings,
  Language,
  UserRole,
  PaymentAllocation,
  PaymentMethod,
} from '../types';
import { initialAppState } from '../store/initialData';
import {
  generateNextMemberId,
  generateReceiptNumber,
} from '../utils/formatters';
import { computeAccountingSummary, computeMemberSummary } from '../utils/accounting';

const STORAGE_KEY = 'AFB_CHAMHATTI_DB_V1';
const LANG_STORAGE_KEY = 'AFB_CHAMHATTI_LANG_V1';
const ROLE_STORAGE_KEY = 'AFB_CHAMHATTI_ROLE_V1';
const PRE_RESTORE_BACKUP_KEY = 'AFB_CHAMHATTI_PRE_RESTORE_SNAPSHOT';

interface AppContextType {
  state: AppState;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Summary
  accountingSummary: ReturnType<typeof computeAccountingSummary>;
  getMemberSummary: (memberId: string) => ReturnType<typeof computeMemberSummary> | null;
  // Members
  addMember: (memberData: {
    fullName: string;
    fatherName: string;
    mobile: string;
    address: string;
    joiningDate: string;
    notes?: string;
    initialPaymentReceived?: number;
    paymentMethod?: PaymentMethod;
  }) => { member: Member; receiptNumber?: string };
  updateMember: (id: string, updates: Partial<Member>) => void;
  archiveMember: (id: string, reason: string) => void;
  // Monthly Fees
  generateMonthlyFees: (month: string) => { createdCount: number; skippedCount: number };
  recordBulkMonthlyPayment: (
    memberIds: string[],
    month: string,
    amountPerMember: number,
    paymentMethod: PaymentMethod
  ) => { paymentCount: number };
  // Emergency Fees
  createEmergencyEvent: (eventData: {
    deceasedName: string;
    deceasedRelation?: string;
    dateOfDeath: string;
    description: string;
    feePerMember?: number;
    notes?: string;
    funeralExpenseAmount?: number;
    funeralExpensePaidTo?: string;
  }) => EmergencyEvent;
  // Payments & Receipts
  recordPayment: (paymentData: {
    memberId: string;
    amountReceived: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    allocations: PaymentAllocation[];
  }) => PaymentRecord;
  reversePayment: (paymentId: string, reason: string) => void;
  latestReceipt: PaymentRecord | null;
  setLatestReceipt: (p: PaymentRecord | null) => void;
  // Income
  addIncome: (incomeData: Omit<IncomeRecord, 'id' | 'createdAt' | 'status' | 'recordedBy'>) => IncomeRecord;
  reverseIncome: (incomeId: string, reason: string) => void;
  // Expenses
  addExpense: (expenseData: Omit<ExpenseRecord, 'id' | 'createdAt' | 'lastModified' | 'status' | 'createdBy'>) => ExpenseRecord;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => void;
  reverseExpense: (expenseId: string, reason: string) => void;
  // Settings & Backup
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
  exportBackupJson: () => string;
  restoreBackupJson: (jsonString: string) => { success: boolean; message: string };
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved as Language) || 'ur';
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    return (saved as UserRole) || 'super_admin';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [latestReceipt, setLatestReceipt] = useState<PaymentRecord | null>(null);

  // Initialize state with persistence check
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings && Array.isArray(parsed.members) && Array.isArray(parsed.obligations)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved state from localStorage:', e);
    }
    return initialAppState;
  });

  // Save state on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist state to localStorage:', err);
    }
  }, [state]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  };

  // Recompute summaries authoritatively
  const accountingSummary = useMemo(() => {
    return computeAccountingSummary(state);
  }, [state]);

  const getMemberSummary = useCallback((memberId: string) => {
    const member = state.members.find(m => m.id === memberId);
    if (!member) return null;
    return computeMemberSummary(member, state.obligations, state.payments);
  }, [state.members, state.obligations, state.payments]);

  // Audit logging helper
  const addAuditLog = (action: string, details: string, entityType: string, entityId: string) => {
    const newLog = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentRole === 'super_admin' ? 'Admin' : currentRole,
      action,
      details,
      entityType,
      entityId,
    };
    return newLog;
  };

  // 1. Add Member
  const addMember = useCallback((data: {
    fullName: string;
    fatherName: string;
    mobile: string;
    address: string;
    joiningDate: string;
    notes?: string;
    initialPaymentReceived?: number;
    paymentMethod?: PaymentMethod;
  }) => {
    const joiningMonth = data.joiningDate.substring(0, 7); // YYYY-MM
    const existingIds = state.members.map(m => m.id);
    const memberId = generateNextMemberId(existingIds);

    const now = new Date().toISOString();
    const newMember: Member = {
      id: memberId,
      fullName: data.fullName.trim(),
      fatherName: data.fatherName.trim(),
      mobile: data.mobile.trim(),
      address: data.address.trim(),
      joiningDate: data.joiningDate,
      joiningMonth,
      status: 'active',
      notes: data.notes || '',
      registrationDate: data.joiningDate,
      createdAt: now,
      updatedAt: now,
    };

    // Obligation 1: Registration Fee
    const regFeeAmount = state.settings.registrationFee || 100;
    const regObl: FeeObligation = {
      id: `OBL-REG-${memberId}`,
      memberId,
      type: 'registration',
      title: 'Registration Fee (داخلہ فیس)',
      amountDue: regFeeAmount,
      amountPaid: 0,
      status: 'unpaid',
      createdAt: now,
      dueDate: data.joiningDate,
    };

    // Obligation 2: First Month Fee
    const firstMonthFeeAmount = state.settings.newMemberFirstMonthFee || 100;
    const firstMonthObl: FeeObligation = {
      id: `OBL-MTH-${joiningMonth}-${memberId}`,
      memberId,
      type: 'monthly',
      periodMonth: joiningMonth,
      title: `Monthly Fee ${joiningMonth} (ماہانہ فیس)`,
      amountDue: firstMonthFeeAmount,
      amountPaid: 0,
      status: 'unpaid',
      createdAt: now,
      dueDate: `${joiningMonth}-15`,
    };

    let newPayment: PaymentRecord | null = null;
    const initialPaid = Math.max(0, Math.round(data.initialPaymentReceived || 0));

    if (initialPaid > 0) {
      // Allocate payment: up to regFeeAmount to registration, remainder to first month
      let regAlloc = Math.min(initialPaid, regFeeAmount);
      let monthAlloc = Math.min(initialPaid - regAlloc, firstMonthFeeAmount);

      regObl.amountPaid = regAlloc;
      regObl.status = regAlloc >= regFeeAmount ? 'paid' : (regAlloc > 0 ? 'partial' : 'unpaid');

      firstMonthObl.amountPaid = monthAlloc;
      firstMonthObl.status = monthAlloc >= firstMonthFeeAmount ? 'paid' : (monthAlloc > 0 ? 'partial' : 'unpaid');

      const year = new Date().getFullYear();
      const receiptNo = generateReceiptNumber(year, state.payments.length, state.settings.receiptPrefix);
      
      const allocations: PaymentAllocation[] = [];
      if (regAlloc > 0) {
        allocations.push({
          obligationId: regObl.id,
          type: 'registration',
          title: 'Registration Fee',
          amount: regAlloc,
        });
      }
      if (monthAlloc > 0) {
        allocations.push({
          obligationId: firstMonthObl.id,
          type: 'monthly',
          periodMonth: joiningMonth,
          title: `Monthly Fee ${joiningMonth}`,
          amount: monthAlloc,
        });
      }

      newPayment = {
        id: `PAY-${Date.now()}`,
        receiptNumber: receiptNo,
        memberId,
        memberName: newMember.fullName,
        date: data.joiningDate,
        amountReceived: initialPaid,
        paymentMethod: data.paymentMethod || 'cash',
        notes: `Initial registration & joining fee payment for ${newMember.fullName}`,
        recordedBy: currentRole,
        allocations,
        status: 'valid',
        createdAt: now,
      };
    }

    const audit = addAuditLog(
      'REGISTER_MEMBER',
      `Registered member ${newMember.fullName} (${memberId}). Obligations: PKR ${regFeeAmount} (Reg) + PKR ${firstMonthFeeAmount} (First Month). Initial Paid: PKR ${initialPaid}.`,
      'Member',
      memberId
    );

    setState(prev => ({
      ...prev,
      members: [...prev.members, newMember],
      obligations: [...prev.obligations, regObl, firstMonthObl],
      payments: newPayment ? [newPayment, ...prev.payments] : prev.payments,
      auditLogs: [audit, ...prev.auditLogs],
    }));

    if (newPayment) {
      setLatestReceipt(newPayment);
    }

    return { member: newMember, receiptNumber: newPayment?.receiptNumber };
  }, [state.members, state.settings, state.payments.length, currentRole]);

  // 2. Update Member
  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    setState(prev => {
      const updatedMembers = prev.members.map(m => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
      const audit = addAuditLog('UPDATE_MEMBER', `Updated details for member ${id}`, 'Member', id);
      return {
        ...prev,
        members: updatedMembers,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [currentRole]);

  // 3. Archive Member
  const archiveMember = useCallback((id: string, reason: string) => {
    setState(prev => {
      const updatedMembers = prev.members.map(m => (m.id === id ? { ...m, status: 'inactive' as const, notes: `${m.notes ? m.notes + ' | ' : ''}Archived: ${reason}` } : m));
      const audit = addAuditLog('ARCHIVE_MEMBER', `Archived member ${id}. Reason: ${reason}. Historical fees strictly retained.`, 'Member', id);
      return {
        ...prev,
        members: updatedMembers,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [currentRole]);

  // 4. Generate Monthly Fees (Idempotent!)
  const generateMonthlyFees = useCallback((month: string) => {
    const feeAmount = state.settings.monthlyFee || 100;
    const now = new Date().toISOString();
    let createdCount = 0;
    let skippedCount = 0;

    const newObligations: FeeObligation[] = [];

    // Filter eligible active members whose joiningMonth <= target month
    for (const member of state.members) {
      if (member.status !== 'active') {
        skippedCount++;
        continue;
      }
      if (member.joiningMonth > month) {
        // Enforce Test J: Never automatically charge for months prior to joining month!
        skippedCount++;
        continue;
      }

      // Check if monthly obligation already exists (Enforce Test F: Duplicate Prevention)
      const exists = state.obligations.some(
        o => o.memberId === member.id && o.type === 'monthly' && o.periodMonth === month
      );

      if (exists) {
        skippedCount++;
        continue;
      }

      newObligations.push({
        id: `OBL-MTH-${month}-${member.id}`,
        memberId: member.id,
        type: 'monthly',
        periodMonth: month,
        title: `Monthly Fee ${month} (ماہانہ فیس)`,
        amountDue: feeAmount,
        amountPaid: 0,
        status: 'unpaid',
        createdAt: now,
        dueDate: `${month}-15`,
      });
      createdCount++;
    }

    if (createdCount > 0) {
      const audit = addAuditLog(
        'GENERATE_MONTHLY_FEES',
        `Generated monthly fees of PKR ${feeAmount} for ${createdCount} active members for month ${month}. ${skippedCount} skipped (already generated or joined later).`,
        'MonthlyFee',
        month
      );

      setState(prev => ({
        ...prev,
        obligations: [...prev.obligations, ...newObligations],
        auditLogs: [audit, ...prev.auditLogs],
      }));
    }

    return { createdCount, skippedCount };
  }, [state.members, state.obligations, state.settings.monthlyFee, currentRole]);

  // 5. Bulk Monthly Fee Payment
  const recordBulkMonthlyPayment = useCallback((
    memberIds: string[],
    month: string,
    amountPerMember: number,
    paymentMethod: PaymentMethod
  ) => {
    const now = new Date().toISOString();
    const today = now.substring(0, 10);
    const newPayments: PaymentRecord[] = [];
    const updatedObligations = [...state.obligations];
    let count = 0;

    for (const mId of memberIds) {
      const member = state.members.find(m => m.id === mId);
      if (!member) continue;

      // Find monthly obligation for this month
      let oblIndex = updatedObligations.findIndex(
        o => o.memberId === mId && o.type === 'monthly' && o.periodMonth === month
      );

      if (oblIndex === -1) {
        // Create if missing
        const newObl: FeeObligation = {
          id: `OBL-MTH-${month}-${mId}`,
          memberId: mId,
          type: 'monthly',
          periodMonth: month,
          title: `Monthly Fee ${month} (ماہانہ فیس)`,
          amountDue: amountPerMember,
          amountPaid: 0,
          status: 'unpaid',
          createdAt: now,
        };
        updatedObligations.push(newObl);
        oblIndex = updatedObligations.length - 1;
      }

      const targetObl = updatedObligations[oblIndex];
      const remainingDue = Math.max(0, targetObl.amountDue - targetObl.amountPaid);
      const payAmount = Math.min(amountPerMember, remainingDue > 0 ? remainingDue : amountPerMember);

      targetObl.amountPaid += payAmount;
      targetObl.status = targetObl.amountPaid >= targetObl.amountDue ? 'paid' : 'partial';

      const year = new Date().getFullYear();
      const receiptNo = generateReceiptNumber(year, state.payments.length + count, state.settings.receiptPrefix);

      newPayments.push({
        id: `PAY-BULK-${Date.now()}-${mId}`,
        receiptNumber: receiptNo,
        memberId: mId,
        memberName: member.fullName,
        date: today,
        amountReceived: payAmount,
        paymentMethod,
        notes: `Bulk collection for ${month}`,
        recordedBy: currentRole,
        allocations: [{
          obligationId: targetObl.id,
          type: 'monthly',
          periodMonth: month,
          title: `Monthly Fee ${month}`,
          amount: payAmount,
        }],
        status: 'valid',
        createdAt: now,
      });
      count++;
    }

    const audit = addAuditLog(
      'BULK_MONTHLY_PAYMENT',
      `Recorded bulk monthly payment of PKR ${amountPerMember} each for ${count} members for month ${month}.`,
      'Payment',
      month
    );

    setState(prev => ({
      ...prev,
      obligations: updatedObligations,
      payments: [...newPayments, ...prev.payments],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return { paymentCount: count };
  }, [state.members, state.obligations, state.payments.length, state.settings.receiptPrefix, currentRole]);

  // 6. Create Emergency Event & Obligations
  const createEmergencyEvent = useCallback((eventData: {
    deceasedName: string;
    deceasedRelation?: string;
    dateOfDeath: string;
    description: string;
    feePerMember?: number;
    notes?: string;
    funeralExpenseAmount?: number;
    funeralExpensePaidTo?: string;
  }) => {
    const feeRate = eventData.feePerMember || state.settings.emergencyFee || 100;
    const year = new Date().getFullYear();
    const eventId = `EMG-${year}-${String(state.emergencyEvents.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    // Eligible active members (exclude deceased)
    const eligibleMembers = state.members.filter(m => m.status === 'active');
    const eligibleCount = eligibleMembers.length;
    const totalDue = feeRate * eligibleCount;

    const newObligations: FeeObligation[] = eligibleMembers.map(m => ({
      id: `OBL-EMG-${eventId}-${m.id}`,
      memberId: m.id,
      type: 'emergency',
      emergencyEventId: eventId,
      title: `Emergency Death Fund: ${eventData.deceasedName} (کفن دفن فنڈ)`,
      amountDue: feeRate,
      amountPaid: 0,
      status: 'unpaid',
      createdAt: now,
    }));

    const newExpenses: ExpenseRecord[] = [];
    if (eventData.funeralExpenseAmount && eventData.funeralExpenseAmount > 0) {
      newExpenses.push({
        id: `EXP-${year}-${String(state.expenses.length + 1).padStart(3, '0')}`,
        date: eventData.dateOfDeath,
        category: 'Funeral transport / ambulance',
        description: `Funeral and Kafan-Dafan relief assistance for ${eventData.deceasedName}`,
        amount: Math.round(eventData.funeralExpenseAmount),
        paymentMethod: 'cash',
        paidTo: eventData.funeralExpensePaidTo || `Family of ${eventData.deceasedName}`,
        voucherNumber: `EMG-VOUCH-${eventId}`,
        notes: `Sanctioned death welfare relief linked to event ${eventId}`,
        emergencyEventId: eventId,
        createdBy: currentRole,
        createdAt: now,
        lastModified: now,
        status: 'valid',
      });
    }

    const newEvent: EmergencyEvent = {
      id: eventId,
      deceasedName: eventData.deceasedName.trim(),
      deceasedRelation: eventData.deceasedRelation?.trim() || '',
      dateOfDeath: eventData.dateOfDeath,
      description: eventData.description.trim(),
      feePerMember: feeRate,
      eligibleMemberCount: eligibleCount,
      totalDue,
      totalCollected: 0,
      relatedExpenseIds: newExpenses.map(e => e.id),
      notes: eventData.notes || '',
      createdAt: now,
    };

    const audit = addAuditLog(
      'CREATE_EMERGENCY_EVENT',
      `Recorded death event for ${newEvent.deceasedName} (${eventId}). Created obligations of PKR ${feeRate} each for ${eligibleCount} members (Total PKR ${totalDue}).`,
      'EmergencyEvent',
      eventId
    );

    setState(prev => ({
      ...prev,
      emergencyEvents: [newEvent, ...prev.emergencyEvents],
      obligations: [...prev.obligations, ...newObligations],
      expenses: newExpenses.length > 0 ? [...newExpenses, ...prev.expenses] : prev.expenses,
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newEvent;
  }, [state.emergencyEvents.length, state.members, state.expenses.length, state.settings.emergencyFee, currentRole]);

  // 7. Record Payment & Smart Allocation
  const recordPayment = useCallback((data: {
    memberId: string;
    amountReceived: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    allocations: PaymentAllocation[];
  }) => {
    const member = state.members.find(m => m.id === data.memberId);
    if (!member) throw new Error('Member not found');

    const year = new Date().getFullYear();
    const receiptNo = generateReceiptNumber(year, state.payments.length, state.settings.receiptPrefix);
    const now = new Date().toISOString();

    // Verify allocations sum matches amountReceived exactly (Enforce Test E & anti-tamper)
    const allocSum = data.allocations.reduce((sum, a) => sum + Math.round(a.amount), 0);
    if (allocSum !== Math.round(data.amountReceived)) {
      throw new Error(`Allocations sum (PKR ${allocSum}) does not match amount received (PKR ${data.amountReceived})`);
    }

    // Apply allocations to obligations
    const updatedObligations = [...state.obligations];
    for (const alloc of data.allocations) {
      const idx = updatedObligations.findIndex(o => o.id === alloc.obligationId);
      if (idx !== -1) {
        const obl = updatedObligations[idx];
        obl.amountPaid = Math.round(obl.amountPaid + alloc.amount);
        obl.status = obl.amountPaid >= obl.amountDue ? 'paid' : (obl.amountPaid > 0 ? 'partial' : 'unpaid');
      }
    }

    // Also update emergencyEvent totalCollected if emergency allocations occurred
    const updatedEmergencyEvents = [...state.emergencyEvents];
    for (const alloc of data.allocations) {
      if (alloc.type === 'emergency' && alloc.emergencyEventId) {
        const evIdx = updatedEmergencyEvents.findIndex(e => e.id === alloc.emergencyEventId);
        if (evIdx !== -1) {
          updatedEmergencyEvents[evIdx].totalCollected += Math.round(alloc.amount);
        }
      }
    }

    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      receiptNumber: receiptNo,
      memberId: member.id,
      memberName: member.fullName,
      date: data.paymentDate,
      amountReceived: Math.round(data.amountReceived),
      paymentMethod: data.paymentMethod,
      notes: data.notes || '',
      recordedBy: currentRole,
      allocations: data.allocations,
      status: 'valid',
      createdAt: now,
    };

    const audit = addAuditLog(
      'RECORD_PAYMENT',
      `Collected PKR ${newPayment.amountReceived} from ${member.fullName} (${member.id}) under Receipt #${receiptNo}.`,
      'Payment',
      newPayment.id
    );

    setState(prev => ({
      ...prev,
      obligations: updatedObligations,
      emergencyEvents: updatedEmergencyEvents,
      payments: [newPayment, ...prev.payments],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    setLatestReceipt(newPayment);
    return newPayment;
  }, [state.members, state.payments.length, state.settings.receiptPrefix, state.obligations, state.emergencyEvents, currentRole]);

  // 8. Reverse Payment (Auditable process)
  const reversePayment = useCallback((paymentId: string, reason: string) => {
    setState(prev => {
      const payment = prev.payments.find(p => p.id === paymentId);
      if (!payment || payment.status === 'reversed') return prev;

      // Roll back allocations from obligations
      const updatedObligations = prev.obligations.map(obl => {
        const alloc = payment.allocations.find(a => a.obligationId === obl.id);
        if (alloc) {
          const newPaid = Math.max(0, obl.amountPaid - alloc.amount);
          return {
            ...obl,
            amountPaid: newPaid,
            status: (newPaid >= obl.amountDue ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid')) as FeeObligation['status'],
          };
        }
        return obl;
      });

      const updatedPayments = prev.payments.map(p => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'reversed' as const,
            reversedAt: new Date().toISOString(),
            reversalReason: reason,
          };
        }
        return p;
      });

      const audit = addAuditLog(
        'REVERSE_PAYMENT',
        `Reversed payment #${payment.receiptNumber} (PKR ${payment.amountReceived}) for ${payment.memberName}. Reason: ${reason}`,
        'Payment',
        paymentId
      );

      return {
        ...prev,
        obligations: updatedObligations,
        payments: updatedPayments,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [currentRole]);

  // 9. Add General Income
  const addIncome = useCallback((incomeData: Omit<IncomeRecord, 'id' | 'createdAt' | 'status' | 'recordedBy'>) => {
    const year = new Date().getFullYear();
    const id = `INC-${year}-${String(state.incomes.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newIncome: IncomeRecord = {
      ...incomeData,
      id,
      amount: Math.round(incomeData.amount),
      recordedBy: currentRole,
      status: 'valid',
      createdAt: now,
    };

    const audit = addAuditLog(
      'RECORD_INCOME',
      `Recorded income PKR ${newIncome.amount} from ${newIncome.receivedFrom} (${newIncome.category}).`,
      'Income',
      id
    );

    setState(prev => ({
      ...prev,
      incomes: [newIncome, ...prev.incomes],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newIncome;
  }, [state.incomes.length, currentRole]);

  // 10. Reverse Income
  const reverseIncome = useCallback((incomeId: string, reason: string) => {
    setState(prev => {
      const updatedIncomes = prev.incomes.map(i => {
        if (i.id === incomeId) {
          return {
            ...i,
            status: 'reversed' as const,
            reversedAt: new Date().toISOString(),
            reversalReason: reason,
          };
        }
        return i;
      });

      const audit = addAuditLog('REVERSE_INCOME', `Reversed income ID ${incomeId}. Reason: ${reason}`, 'Income', incomeId);
      return {
        ...prev,
        incomes: updatedIncomes,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [currentRole]);

  // 11. Add Expense
  const addExpense = useCallback((expenseData: Omit<ExpenseRecord, 'id' | 'createdAt' | 'lastModified' | 'status' | 'createdBy'>) => {
    const year = new Date().getFullYear();
    const id = `EXP-${year}-${String(state.expenses.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newExpense: ExpenseRecord = {
      ...expenseData,
      id,
      amount: Math.round(expenseData.amount),
      createdBy: currentRole,
      createdAt: now,
      lastModified: now,
      status: 'valid',
    };

    const audit = addAuditLog(
      'RECORD_EXPENSE',
      `Recorded expense PKR ${newExpense.amount} to ${newExpense.paidTo} (${newExpense.category}).`,
      'Expense',
      id
    );

    setState(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newExpense;
  }, [state.expenses.length, currentRole]);

  // 12. Update Expense
  const updateExpense = useCallback((id: string, updates: Partial<ExpenseRecord>) => {
    setState(prev => {
      const now = new Date().toISOString();
      const updatedExpenses = prev.expenses.map(e => (e.id === id ? { ...e, ...updates, lastModified: now } : e));
      const audit = addAuditLog('UPDATE_EXPENSE', `Updated expense record ${id}`, 'Expense', id);
      return {
        ...prev,
        expenses: updatedExpenses,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [currentRole]);

  // 13. Reverse Expense (Enforces Test I)
  const reverseExpense = useCallback((expenseId: string, reason: string) => {
    setState(prev => {
      const updatedExpenses = prev.expenses.map(e => {
        if (e.id === expenseId) {
          return {
            ...e,
            status: 'reversed' as const,
            reversedAt: new Date().toISOString(),
            reversalReason: reason,
            lastModified: new Date().toISOString(),
          };
        }
        return e;
      });

      const audit = addAuditLog('REVERSE_EXPENSE', `Reversed expense ID ${expenseId}. Reason: ${reason}`, 'Expense', expenseId);
      return {
        ...prev,
        expenses: updatedExpenses,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [currentRole]);

  // 14. Update Settings
  const updateSettings = useCallback((updates: Partial<OrganizationSettings>) => {
    setState(prev => {
      const newSettings = { ...prev.settings, ...updates };
      const audit = addAuditLog('UPDATE_SETTINGS', 'Updated organization settings and fee structure.', 'Settings', 'ORG');
      return {
        ...prev,
        settings: newSettings,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [currentRole]);

  // 15. Export Backup JSON
  const exportBackupJson = useCallback(() => {
    const backupData = {
      app: 'Anjuman Falah-o-Behbood Chamhatti Khala Butt',
      exportedAt: new Date().toISOString(),
      version: '1.0',
      database: state,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);

    // Update lastBackupDate in settings
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        lastBackupDate: nowFormatted,
      },
    }));

    return jsonStr;
  }, [state]);

  // 16. Restore Backup JSON (with pre-restore snapshot and verification)
  const restoreBackupJson = useCallback((jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const incomingState: AppState = parsed.database || parsed;

      // Schema verification (Enforces Test H)
      if (
        !incomingState.settings ||
        !Array.isArray(incomingState.members) ||
        !Array.isArray(incomingState.obligations) ||
        !Array.isArray(incomingState.payments) ||
        !Array.isArray(incomingState.expenses)
      ) {
        return { success: false, message: 'Invalid backup format. Required database collections are missing.' };
      }

      // Pre-restore safety snapshot
      try {
        localStorage.setItem(PRE_RESTORE_BACKUP_KEY, JSON.stringify(state));
      } catch (snapshotErr) {
        console.warn('Failed to save pre-restore snapshot:', snapshotErr);
      }

      // Safe restore
      setState(incomingState);
      return {
        success: true,
        message: `Successfully restored backup! Restored ${incomingState.members.length} members, ${incomingState.payments.length} payments, and ${incomingState.expenses.length} expenses.`,
      };
    } catch (err: any) {
      return { success: false, message: `Failed to parse backup JSON: ${err.message}` };
    }
  }, [state]);

  // 17. Reset to Initial Data (Explicit action with pre-snapshot)
  const resetToInitialData = useCallback(() => {
    try {
      localStorage.setItem(PRE_RESTORE_BACKUP_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn(err);
    }
    setState(initialAppState);
  }, [state]);

  const value: AppContextType = {
    state,
    language,
    setLanguage,
    currentRole,
    setCurrentRole,
    activeTab,
    setActiveTab,
    accountingSummary,
    getMemberSummary,
    addMember,
    updateMember,
    archiveMember,
    generateMonthlyFees,
    recordBulkMonthlyPayment,
    createEmergencyEvent,
    recordPayment,
    reversePayment,
    latestReceipt,
    setLatestReceipt,
    addIncome,
    reverseIncome,
    addExpense,
    updateExpense,
    reverseExpense,
    updateSettings,
    exportBackupJson,
    restoreBackupJson,
    resetToInitialData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
