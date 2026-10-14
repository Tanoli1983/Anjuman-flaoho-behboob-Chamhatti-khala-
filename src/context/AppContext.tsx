import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppState,
  Member,
  FeeObligation,
  EmergencyEvent,
  PaymentRecord,
  ExpenseRecord,
  IncomeRecord,
  Announcement,
  OfficeBearer,
  OrganizationSettings,
  Language,
  UserRole,
  PaymentAllocation,
  PaymentMethod,
  PaymentCategory,
} from '../types';
import { initialAppState } from '../store/initialData';
import {
  generateNextMemberId,
  generateReceiptNumber,
} from '../utils/formatters';
import { computeAccountingSummary, computeMemberSummary } from '../utils/accounting';

const STORAGE_KEY = 'AFB_KARACHI_CLEAN_V3';
const LANG_STORAGE_KEY = 'AFB_KARACHI_LANG_V3';
const AUTH_STORAGE_KEY = 'AFB_KARACHI_ADMIN_AUTH_V3';

// Clear out any older storage keys that might have sample/test transactions
try {
  ['AFB_KARACHI_DB_V2', 'AFB_KARACHI_DB_V1', 'AFB_MANAGEMENT_DB_v1'].forEach((oldKey) => {
    localStorage.removeItem(oldKey);
  });
} catch (_) {}

interface AppContextType {
  state: AppState;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Admin Security
  isAdmin: boolean;
  isPasswordConfigured: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  setupInitialAdminPassword: (password: string, question?: string, answer?: string) => { success: boolean; message: string };
  updateAdminPin: (oldPin: string, newPin: string, question?: string, answer?: string) => { success: boolean; message: string };
  recoverAdminPassword: (answerOrKey: string, newPassword: string) => { success: boolean; message: string };
  resetAdminToSetupMode: () => void;
  // Summary
  accountingSummary: ReturnType<typeof computeAccountingSummary>;
  getMemberSummary: (memberId: string) => ReturnType<typeof computeMemberSummary> | null;
  // Clean financial records
  cleanAllFinancialRecords: () => void;
  // Members CRUD
  addMember: (memberData: {
    fullName: string;
    fatherName: string;
    mobile: string;
    address: string;
    joiningDate: string;
    notes?: string;
  }) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  // Office Bearers CRUD
  addOfficeBearer: (data: Omit<OfficeBearer, 'id'>) => OfficeBearer;
  updateOfficeBearer: (id: string, updates: Partial<OfficeBearer>) => void;
  deleteOfficeBearer: (id: string) => void;
  // Payments CRUD
  addPayment: (data: {
    memberId: string;
    amountReceived: number;
    paymentCategory: PaymentCategory;
    paymentMethod: PaymentMethod;
    date: string;
    relevantPeriod?: string;
    notes?: string;
  }) => PaymentRecord;
  updatePayment: (id: string, updates: Partial<PaymentRecord>) => void;
  deletePayment: (id: string) => void;
  latestReceipt: PaymentRecord | null;
  setLatestReceipt: (p: PaymentRecord | null) => void;
  // Monthly Fees Operations
  generateMonthlyFees: (targetMonth: string) => { createdCount: number; skippedCount: number };
  recordBulkMonthlyPayment: (
    arg1: string[] | { memberIds: string[]; month: string; amountPerMember: number; paymentMethod: PaymentMethod; notes?: string },
    month?: string,
    amountPerMember?: number,
    paymentMethod?: PaymentMethod,
    notes?: string
  ) => { paymentCount: number; receiptsCount: number };
  // Expenses CRUD
  addExpense: (data: Omit<ExpenseRecord, 'id' | 'createdAt' | 'lastModified' | 'status' | 'createdBy'>) => ExpenseRecord;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;
  // Incomes CRUD
  addIncome: (data: Omit<IncomeRecord, 'id' | 'createdAt' | 'status' | 'recordedBy'>) => IncomeRecord;
  updateIncome: (id: string, updates: Partial<IncomeRecord>) => void;
  deleteIncome: (id: string) => void;
  // Emergency Events CRUD
  createEmergencyEvent: (data: {
    deceasedName: string;
    deceasedRelation?: string;
    dateOfDeath: string;
    description: string;
    feePerMember?: number;
    funeralExpenseAmount?: number;
    funeralExpensePaidTo?: string;
    notes?: string;
  }) => EmergencyEvent;
  addEmergencyEvent: (data: {
    deceasedName: string;
    deceasedRelation?: string;
    dateOfDeath: string;
    description: string;
    feePerMember?: number;
    funeralExpenseAmount?: number;
    funeralExpensePaidTo?: string;
    notes?: string;
  }) => EmergencyEvent;
  updateEmergencyEvent: (id: string, updates: Partial<EmergencyEvent>) => void;
  deleteEmergencyEvent: (id: string) => void;
  // Announcements CRUD
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => Announcement;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
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

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const auth = localStorage.getItem(AUTH_STORAGE_KEY);
    return auth === 'true';
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>('super_admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [latestReceipt, setLatestReceipt] = useState<PaymentRecord | null>(null);

  // Initialize state with persistence & enforce clean financial slate
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings && Array.isArray(parsed.members)) {
          return {
            ...parsed,
            settings: {
              ...initialAppState.settings,
              ...parsed.settings,
              orgName: 'Anjuman Falah-o-Bahbood Chamhatti Wa Khalabat Butt Karachi',
              orgNameUrdu: 'انجمن فلاح و بہبود چھمھٹی و خالصہ بٹ کراچی',
              registrationFee: parsed.settings.registrationFee || 200,
              monthlyFee: parsed.settings.monthlyFee || 100,
              emergencyFee: parsed.settings.emergencyFee || 100,
              currencySymbol: 'Rs.',
            },
            // Keep member registration records intact!
            members: parsed.members.length > 0 ? parsed.members : initialAppState.members,
            // Keep office bearers intact
            officeBearers: parsed.settings?.officeBearers || initialAppState.settings.officeBearers,
            // Clean financial transactions to fresh state
            payments: parsed.payments || [],
            expenses: parsed.expenses || [],
            incomes: parsed.incomes || [],
            obligations: parsed.obligations || [],
            emergencyEvents: parsed.emergencyEvents || [],
            announcements: parsed.announcements || initialAppState.announcements,
            auditLogs: parsed.auditLogs || initialAppState.auditLogs,
          };
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
  };

  // Admin Auth Handlers
  const isPasswordConfigured = Boolean(state.settings.adminPasswordConfigured && state.settings.adminPin);

  const adminLogin = (password: string): boolean => {
    // If not yet configured, login directly is not permitted until owner sets password
    if (!isPasswordConfigured) {
      return false;
    }
    const cleanInput = (password || '').trim();
    const storedPassword = (state.settings.adminPin || '').trim();
    if (cleanInput && cleanInput === storedPassword) {
      setIsAdmin(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const setupInitialAdminPassword = (password: string, question?: string, answer?: string) => {
    const cleanPassword = (password || '').trim();
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        adminPin: cleanPassword,
        adminPasswordConfigured: true,
        securityQuestion: question || prev.settings.securityQuestion || 'What is the registered city of the Anjuman?',
        securityAnswer: (answer || prev.settings.securityAnswer || 'Karachi').trim(),
        recoverySecretKey: prev.settings.recoverySecretKey || 'AFB-RECOVER-2026',
      },
    }));

    setIsAdmin(true);
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');

    return {
      success: true,
      message: 'Administrator password configured successfully! Full editing privileges activated.',
    };
  };

  const updateAdminPin = (oldPin: string, newPin: string, question?: string, answer?: string) => {
    const currentPin = (state.settings.adminPin || '').trim();
    const cleanOld = (oldPin || '').trim();
    const cleanNew = (newPin || '').trim();

    // If password was already configured, require old password to match
    if (state.settings.adminPasswordConfigured && currentPin && cleanOld !== currentPin) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    if (!cleanNew || cleanNew.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        adminPin: cleanNew,
        adminPasswordConfigured: true,
        securityQuestion: question || prev.settings.securityQuestion,
        securityAnswer: answer !== undefined ? answer.trim() : prev.settings.securityAnswer,
      },
    }));

    return { success: true, message: 'Administrator password updated successfully.' };
  };

  const recoverAdminPassword = (answerOrKey: string, newPassword: string) => {
    const cleanInput = (answerOrKey || '').trim().toLowerCase();
    const cleanKeyInput = (answerOrKey || '').trim().toUpperCase();
    const cleanPhoneInput = (answerOrKey || '').replace(/[-\s]/g, '');

    const storedAnswer = (state.settings.securityAnswer || 'karachi').trim().toLowerCase();
    const storedSecretKey = (state.settings.recoverySecretKey || 'AFB-RECOVER-2026').trim().toUpperCase();
    const storedPhone = (state.settings.phone || '0300-5551234').replace(/[-\s]/g, '');

    const isMatch =
      cleanInput === storedAnswer ||
      cleanKeyInput === storedSecretKey ||
      (cleanPhoneInput.length >= 7 && cleanPhoneInput === storedPhone);

    if (!isMatch) {
      return {
        success: false,
        message: 'Recovery details do not match our records. Please verify the security answer, emergency recovery key, or registered phone number.',
      };
    }

    const cleanNewPassword = (newPassword || '').trim();
    if (!cleanNewPassword || cleanNewPassword.length < 4) {
      return {
        success: false,
        message: 'New password must be at least 4 characters long.',
      };
    }

    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        adminPin: cleanNewPassword,
        adminPasswordConfigured: true,
      },
    }));

    setIsAdmin(true);
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');

    return {
      success: true,
      message: 'Password successfully recovered and updated! Administrator session unlocked.',
    };
  };

  const resetAdminToSetupMode = () => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        adminPin: '',
        adminPasswordConfigured: false,
      },
    }));
    setIsAdmin(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Recompute summaries authoritatively from database records
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
      user: isAdmin ? 'Admin' : 'User',
      action,
      details,
      entityType,
      entityId,
    };
    return newLog;
  };

  // 1. CLEAN ALL FINANCIAL RECORDS (User Requirement Section 1)
  const cleanAllFinancialRecords = useCallback(() => {
    const audit = addAuditLog(
      'CLEAN_FINANCIAL_RECORDS',
      'All payments, expenses, incomes, obligations, and sample financial records were permanently removed. All financial totals reset to zero.',
      'System',
      'FINANCE'
    );

    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        openingCashBalance: 0,
      },
      payments: [],
      expenses: [],
      incomes: [],
      obligations: [],
      emergencyEvents: [],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  }, [isAdmin]);

  // 2. MEMBER CRUD
  const addMember = useCallback((data: {
    fullName: string;
    fatherName: string;
    mobile: string;
    address: string;
    joiningDate: string;
    notes?: string;
  }) => {
    const joiningMonth = data.joiningDate.substring(0, 7);
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

    const audit = addAuditLog(
      'ADD_MEMBER',
      `Registered member ${newMember.fullName} (${memberId})`,
      'Member',
      memberId
    );

    setState(prev => ({
      ...prev,
      members: [...prev.members, newMember],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newMember;
  }, [state.members, isAdmin]);

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    setState(prev => {
      const updatedMembers = prev.members.map(m => 
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      );
      const audit = addAuditLog('UPDATE_MEMBER', `Updated member details for ${id}`, 'Member', id);
      return {
        ...prev,
        members: updatedMembers,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  const deleteMember = useCallback((id: string) => {
    setState(prev => {
      const member = prev.members.find(m => m.id === id);
      const updatedMembers = prev.members.filter(m => m.id !== id);
      // Clean obligations associated with deleted member
      const updatedObligations = prev.obligations.filter(o => o.memberId !== id);
      const audit = addAuditLog('DELETE_MEMBER', `Deleted member ${member?.fullName || id} (${id})`, 'Member', id);
      return {
        ...prev,
        members: updatedMembers,
        obligations: updatedObligations,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  // 3. OFFICE BEARERS CRUD
  const addOfficeBearer = useCallback((data: Omit<OfficeBearer, 'id'>) => {
    const id = `OB-${Date.now()}`;
    const newBearer: OfficeBearer = {
      ...data,
      id,
    };

    setState(prev => {
      const existing = prev.settings.officeBearers || [];
      const updated = [...existing, newBearer];
      const audit = addAuditLog('ADD_OFFICE_BEARER', `Added office bearer ${newBearer.name} (${newBearer.role})`, 'OfficeBearer', id);
      return {
        ...prev,
        settings: {
          ...prev.settings,
          officeBearers: updated,
        },
        auditLogs: [audit, ...prev.auditLogs],
      };
    });

    return newBearer;
  }, [isAdmin]);

  const updateOfficeBearer = useCallback((id: string, updates: Partial<OfficeBearer>) => {
    setState(prev => {
      const existing = prev.settings.officeBearers || [];
      const updated = existing.map(b => b.id === id ? { ...b, ...updates } : b);
      const audit = addAuditLog('UPDATE_OFFICE_BEARER', `Updated office bearer ${id}`, 'OfficeBearer', id);
      return {
        ...prev,
        settings: {
          ...prev.settings,
          officeBearers: updated,
        },
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  const deleteOfficeBearer = useCallback((id: string) => {
    setState(prev => {
      const existing = prev.settings.officeBearers || [];
      const bearer = existing.find(b => b.id === id);
      const updated = existing.filter(b => b.id !== id);
      const audit = addAuditLog('DELETE_OFFICE_BEARER', `Removed office bearer ${bearer?.name || id}`, 'OfficeBearer', id);
      return {
        ...prev,
        settings: {
          ...prev.settings,
          officeBearers: updated,
        },
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  // 4. PAYMENTS CRUD
  const addPayment = useCallback((data: {
    memberId: string;
    amountReceived: number;
    paymentCategory: PaymentCategory;
    paymentMethod: PaymentMethod;
    date: string;
    relevantPeriod?: string;
    notes?: string;
  }) => {
    const member = state.members.find(m => m.id === data.memberId);
    if (!member) throw new Error('Member not found');

    const year = new Date().getFullYear();
    const receiptNo = generateReceiptNumber(year, state.payments.length, state.settings.receiptPrefix);
    const now = new Date().toISOString();

    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      receiptNumber: receiptNo,
      memberId: member.id,
      memberName: member.fullName,
      date: data.date,
      amountReceived: Math.round(data.amountReceived),
      paymentCategory: data.paymentCategory,
      paymentMethod: data.paymentMethod,
      relevantPeriod: data.relevantPeriod || data.date.substring(0, 7),
      notes: data.notes || '',
      recordedBy: isAdmin ? 'Admin' : 'Treasurer',
      allocations: [
        {
          type: (data.paymentCategory === 'monthly' ? 'monthly' : data.paymentCategory === 'emergency' ? 'emergency' : 'registration') as any,
          periodMonth: data.relevantPeriod,
          title: `${data.paymentCategory.toUpperCase()} Fee Payment`,
          amount: Math.round(data.amountReceived),
        }
      ],
      status: 'valid',
      createdAt: now,
      updatedAt: now,
    };

    const audit = addAuditLog(
      'RECORD_PAYMENT',
      `Recorded payment of Rs. ${newPayment.amountReceived} from ${member.fullName} (${member.id}) under Receipt #${receiptNo} [Category: ${data.paymentCategory}].`,
      'Payment',
      newPayment.id
    );

    setState(prev => ({
      ...prev,
      payments: [newPayment, ...prev.payments],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    setLatestReceipt(newPayment);
    return newPayment;
  }, [state.members, state.payments.length, state.settings.receiptPrefix, isAdmin]);

  const updatePayment = useCallback((id: string, updates: Partial<PaymentRecord>) => {
    setState(prev => {
      const now = new Date().toISOString();
      const updatedPayments = prev.payments.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: now } : p
      );
      const audit = addAuditLog('UPDATE_PAYMENT', `Edited payment record ${id}`, 'Payment', id);
      return {
        ...prev,
        payments: updatedPayments,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  const deletePayment = useCallback((id: string) => {
    setState(prev => {
      const pay = prev.payments.find(p => p.id === id);
      const updatedPayments = prev.payments.filter(p => p.id !== id);
      const audit = addAuditLog('DELETE_PAYMENT', `Deleted payment #${pay?.receiptNumber || id} (Rs. ${pay?.amountReceived})`, 'Payment', id);
      return {
        ...prev,
        payments: updatedPayments,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  // 4b. MONTHLY FEES GENERATION & BULK PAYMENT
  const generateMonthlyFees = useCallback((targetMonth: string) => {
    const feeRate = state.settings.monthlyFee || 100;
    const eligibleMembers = state.members.filter(
      m => m.status === 'active' && m.joiningMonth <= targetMonth
    );

    let createdCount = 0;
    let skippedCount = 0;
    const newObligations: FeeObligation[] = [];

    for (const mem of eligibleMembers) {
      const alreadyExists = state.obligations.some(
        o => o.memberId === mem.id && o.type === 'monthly' && o.periodMonth === targetMonth
      );
      if (alreadyExists) {
        skippedCount++;
      } else {
        const oblId = `OBL-M-${mem.id}-${targetMonth}`;
        newObligations.push({
          id: oblId,
          memberId: mem.id,
          type: 'monthly',
          periodMonth: targetMonth,
          title: `Monthly Fee - ${targetMonth}`,
          amountDue: feeRate,
          amountPaid: 0,
          status: 'unpaid',
          createdAt: new Date().toISOString(),
          dueDate: `${targetMonth}-28`,
        });
        createdCount++;
      }
    }

    if (newObligations.length > 0) {
      setState(prev => ({
        ...prev,
        obligations: [...prev.obligations, ...newObligations],
        auditLogs: [
          addAuditLog('GENERATE_MONTHLY_FEES', `Generated monthly fees for ${createdCount} active members for period ${targetMonth}`, 'FeeObligation', targetMonth),
          ...prev.auditLogs,
        ],
      }));
    }

    return { createdCount, skippedCount };
  }, [state.members, state.obligations, state.settings.monthlyFee, isAdmin]);

  const recordBulkMonthlyPayment = useCallback((
    arg1: string[] | { memberIds: string[]; month: string; amountPerMember: number; paymentMethod: PaymentMethod; notes?: string },
    argMonth?: string,
    argAmount?: number,
    argMethod?: PaymentMethod,
    argNotes?: string
  ) => {
    let memberIds: string[];
    let month: string;
    let amountPerMember: number;
    let paymentMethod: PaymentMethod;
    let notes: string | undefined;

    if (Array.isArray(arg1)) {
      memberIds = arg1;
      month = argMonth || new Date().toISOString().substring(0, 7);
      amountPerMember = argAmount || state.settings.monthlyFee || 100;
      paymentMethod = argMethod || 'cash';
      notes = argNotes;
    } else {
      memberIds = arg1.memberIds;
      month = arg1.month;
      amountPerMember = arg1.amountPerMember;
      paymentMethod = arg1.paymentMethod;
      notes = arg1.notes;
    }

    const year = new Date().getFullYear();
    const now = new Date().toISOString();
    const newPayments: PaymentRecord[] = [];
    const updatedObligations = [...state.obligations];

    memberIds.forEach((memId, idx) => {
      const member = state.members.find(m => m.id === memId);
      if (!member) return;

      const receiptNo = generateReceiptNumber(year, state.payments.length + idx, state.settings.receiptPrefix);
      const paymentId = `PAY-${Date.now()}-${idx}`;

      let obl = updatedObligations.find(
        o => o.memberId === memId && o.type === 'monthly' && o.periodMonth === month
      );

      if (!obl) {
        obl = {
          id: `OBL-M-${memId}-${month}`,
          memberId: memId,
          type: 'monthly',
          periodMonth: month,
          title: `Monthly Fee - ${month}`,
          amountDue: amountPerMember,
          amountPaid: amountPerMember,
          status: 'paid',
          createdAt: now,
        };
        updatedObligations.push(obl);
      } else {
        obl.amountPaid += amountPerMember;
        obl.status = obl.amountPaid >= obl.amountDue ? 'paid' : 'partial';
      }

      const payment: PaymentRecord = {
        id: paymentId,
        receiptNumber: receiptNo,
        memberId: memId,
        memberName: member.fullName,
        date: new Date().toISOString().substring(0, 10),
        amountReceived: amountPerMember,
        paymentCategory: 'monthly',
        paymentMethod: paymentMethod,
        relevantPeriod: month,
        notes: notes || `Bulk monthly fee collection for ${month}`,
        recordedBy: isAdmin ? 'Admin' : 'Treasurer',
        allocations: [
          {
            obligationId: obl.id,
            type: 'monthly',
            periodMonth: month,
            title: `Monthly Fee ${month}`,
            amount: amountPerMember,
          }
        ],
        status: 'valid',
        createdAt: now,
        updatedAt: now,
      };

      newPayments.push(payment);
    });

    if (newPayments.length > 0) {
      const audit = addAuditLog(
        'RECORD_BULK_PAYMENT',
        `Bulk collected monthly fees for ${newPayments.length} members for month ${month}. Total: Rs. ${memberIds.length * amountPerMember}`,
        'Payment',
        month
      );

      setState(prev => ({
        ...prev,
        payments: [...newPayments, ...prev.payments],
        obligations: updatedObligations,
        auditLogs: [audit, ...prev.auditLogs],
      }));

      setLatestReceipt(newPayments[newPayments.length - 1]);
    }

    return { paymentCount: newPayments.length, receiptsCount: newPayments.length };
  }, [state.members, state.obligations, state.payments.length, state.settings.monthlyFee, state.settings.receiptPrefix, isAdmin]);

  // 5. EXPENSES CRUD
  const addExpense = useCallback((data: Omit<ExpenseRecord, 'id' | 'createdAt' | 'lastModified' | 'status' | 'createdBy'>) => {
    const year = new Date().getFullYear();
    const id = `EXP-${year}-${String(state.expenses.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newExpense: ExpenseRecord = {
      ...data,
      id,
      amount: Math.round(data.amount),
      createdBy: isAdmin ? 'Admin' : 'Treasurer',
      createdAt: now,
      lastModified: now,
      status: 'valid',
    };

    const audit = addAuditLog(
      'RECORD_EXPENSE',
      `Recorded expense Rs. ${newExpense.amount} to ${newExpense.paidTo} (${newExpense.category}).`,
      'Expense',
      id
    );

    setState(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newExpense;
  }, [state.expenses.length, isAdmin]);

  const updateExpense = useCallback((id: string, updates: Partial<ExpenseRecord>) => {
    setState(prev => {
      const now = new Date().toISOString();
      const updatedExpenses = prev.expenses.map(e => 
        e.id === id ? { ...e, ...updates, lastModified: now } : e
      );
      const audit = addAuditLog('UPDATE_EXPENSE', `Updated expense record ${id}`, 'Expense', id);
      return {
        ...prev,
        expenses: updatedExpenses,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  const deleteExpense = useCallback((id: string) => {
    setState(prev => {
      const exp = prev.expenses.find(e => e.id === id);
      const updatedExpenses = prev.expenses.filter(e => e.id !== id);
      const audit = addAuditLog('DELETE_EXPENSE', `Deleted expense record ${id} (Rs. ${exp?.amount})`, 'Expense', id);
      return {
        ...prev,
        expenses: updatedExpenses,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  // 6. INCOMES / DONATIONS CRUD
  const addIncome = useCallback((data: Omit<IncomeRecord, 'id' | 'createdAt' | 'status' | 'recordedBy'>) => {
    const year = new Date().getFullYear();
    const id = `INC-${year}-${String(state.incomes.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newIncome: IncomeRecord = {
      ...data,
      id,
      amount: Math.round(data.amount),
      recordedBy: isAdmin ? 'Admin' : 'Treasurer',
      status: 'valid',
      createdAt: now,
      updatedAt: now,
    };

    const audit = addAuditLog(
      'RECORD_INCOME',
      `Recorded donation/income of Rs. ${newIncome.amount} from ${newIncome.receivedFrom} (${newIncome.category}).`,
      'Income',
      id
    );

    setState(prev => ({
      ...prev,
      incomes: [newIncome, ...prev.incomes],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newIncome;
  }, [state.incomes.length, isAdmin]);

  const updateIncome = useCallback((id: string, updates: Partial<IncomeRecord>) => {
    setState(prev => {
      const updatedIncomes = prev.incomes.map(i => 
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      );
      const audit = addAuditLog('UPDATE_INCOME', `Updated income record ${id}`, 'Income', id);
      return {
        ...prev,
        incomes: updatedIncomes,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  const deleteIncome = useCallback((id: string) => {
    setState(prev => {
      const inc = prev.incomes.find(i => i.id === id);
      const updatedIncomes = prev.incomes.filter(i => i.id !== id);
      const audit = addAuditLog('DELETE_INCOME', `Deleted income record ${id} (Rs. ${inc?.amount})`, 'Income', id);
      return {
        ...prev,
        incomes: updatedIncomes,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  // 7. EMERGENCY EVENTS CRUD
  const createEmergencyEvent = useCallback((data: {
    deceasedName: string;
    deceasedRelation?: string;
    dateOfDeath: string;
    description: string;
    feePerMember?: number;
    funeralExpenseAmount?: number;
    funeralExpensePaidTo?: string;
    notes?: string;
  }) => {
    const feeRate = data.feePerMember || state.settings.emergencyFee || 100;
    const year = new Date().getFullYear();
    const eventId = `EMG-${year}-${String(state.emergencyEvents.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const eligibleMembers = state.members.filter(m => m.status === 'active');
    const eligibleCount = eligibleMembers.length;

    const newEvent: EmergencyEvent = {
      id: eventId,
      deceasedName: data.deceasedName.trim(),
      deceasedRelation: data.deceasedRelation?.trim() || '',
      dateOfDeath: data.dateOfDeath,
      description: data.description.trim(),
      feePerMember: feeRate,
      eligibleMemberCount: eligibleCount,
      totalDue: feeRate * eligibleCount,
      totalCollected: 0,
      relatedExpenseIds: [],
      notes: data.notes || '',
      createdAt: now,
    };

    // Generate emergency fee obligations for all active members
    const newObligations: FeeObligation[] = eligibleMembers.map(m => ({
      id: `OBL-E-${m.id}-${eventId}`,
      memberId: m.id,
      type: 'emergency',
      emergencyEventId: eventId,
      title: `Emergency Death Fund: ${data.deceasedName}`,
      amountDue: feeRate,
      amountPaid: 0,
      status: 'unpaid',
      createdAt: now,
    }));

    // Optional funeral assistance expense record
    const newExpenses: ExpenseRecord[] = [];
    if (data.funeralExpenseAmount && data.funeralExpenseAmount > 0) {
      const expId = `EXP-${year}-${String(state.expenses.length + 1).padStart(3, '0')}`;
      newExpenses.push({
        id: expId,
        title: `Funeral Aid / Kafan Dafan: ${data.deceasedName}`,
        date: data.dateOfDeath,
        category: 'Funeral transport / ambulance',
        description: `Emergency financial assistance & funeral arrangements for late ${data.deceasedName} (${data.deceasedRelation || 'Community Member'})`,
        amount: Math.round(data.funeralExpenseAmount),
        paymentMethod: 'cash',
        paidTo: data.funeralExpensePaidTo || 'Bereaved Family / Kafan Committee',
        voucherNumber: `EMG-VCH-${eventId}`,
        receiptAttachment: '',
        notes: `Linked to death event ${eventId}`,
        createdBy: isAdmin ? 'Admin' : 'Treasurer',
        createdAt: now,
        lastModified: now,
        status: 'valid',
      });
      newEvent.relatedExpenseIds.push(expId);
    }

    const audit = addAuditLog(
      'CREATE_EMERGENCY_EVENT',
      `Recorded death/emergency case for ${newEvent.deceasedName} (${eventId}). Fee: Rs. ${feeRate} for ${eligibleCount} members.`,
      'EmergencyEvent',
      eventId
    );

    setState(prev => ({
      ...prev,
      emergencyEvents: [newEvent, ...prev.emergencyEvents],
      obligations: [...prev.obligations, ...newObligations],
      expenses: [...newExpenses, ...prev.expenses],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newEvent;
  }, [state.emergencyEvents.length, state.members, state.expenses.length, state.settings.emergencyFee, isAdmin]);

  const addEmergencyEvent = createEmergencyEvent;

  const updateEmergencyEvent = useCallback((id: string, updates: Partial<EmergencyEvent>) => {
    setState(prev => {
      const updatedEvents = prev.emergencyEvents.map(e => 
        e.id === id ? { ...e, ...updates } : e
      );
      const audit = addAuditLog('UPDATE_EMERGENCY_EVENT', `Updated emergency event ${id}`, 'EmergencyEvent', id);
      return {
        ...prev,
        emergencyEvents: updatedEvents,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  const deleteEmergencyEvent = useCallback((id: string) => {
    setState(prev => {
      const ev = prev.emergencyEvents.find(e => e.id === id);
      const updatedEvents = prev.emergencyEvents.filter(e => e.id !== id);
      const audit = addAuditLog('DELETE_EMERGENCY_EVENT', `Deleted emergency event ${ev?.deceasedName || id}`, 'EmergencyEvent', id);
      return {
        ...prev,
        emergencyEvents: updatedEvents,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, [isAdmin]);

  // 8. ANNOUNCEMENTS CRUD
  const addAnnouncement = useCallback((data: Omit<Announcement, 'id' | 'createdAt'>) => {
    const id = `ANN-${Date.now()}`;
    const now = new Date().toISOString();
    const newAnn: Announcement = {
      ...data,
      id,
      createdAt: now,
    };

    setState(prev => ({
      ...prev,
      announcements: [newAnn, ...(prev.announcements || [])],
      auditLogs: [addAuditLog('ADD_ANNOUNCEMENT', `Added notice: ${newAnn.title}`, 'Announcement', id), ...prev.auditLogs],
    }));

    return newAnn;
  }, [isAdmin]);

  const updateAnnouncement = useCallback((id: string, updates: Partial<Announcement>) => {
    setState(prev => {
      const updated = (prev.announcements || []).map(a => a.id === id ? { ...a, ...updates } : a);
      return {
        ...prev,
        announcements: updated,
      };
    });
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      announcements: (prev.announcements || []).filter(a => a.id !== id),
    }));
  }, []);

  // 9. UPDATE SETTINGS
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
  }, [isAdmin]);

  // 10. BACKUP & RESTORE
  const exportBackupJson = useCallback(() => {
    const backupData = {
      app: 'Anjuman Falah-o-Bahbood Chamhatti Wa Khalabat Butt Karachi',
      exportedAt: new Date().toISOString(),
      version: '2.0',
      database: state,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);

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

  const restoreBackupJson = useCallback((jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const incomingState: AppState = parsed.database || parsed;

      if (!incomingState.settings || !Array.isArray(incomingState.members)) {
        return { success: false, message: 'Invalid backup format. Missing required database tables.' };
      }

      setState(incomingState);
      return {
        success: true,
        message: `Successfully restored backup with ${incomingState.members.length} members!`,
      };
    } catch (err: any) {
      return { success: false, message: `Failed to parse backup JSON: ${err.message}` };
    }
  }, []);

  const resetToInitialData = useCallback(() => {
    setState(initialAppState);
  }, []);

  const value: AppContextType = {
    state,
    language,
    setLanguage,
    currentRole,
    setCurrentRole,
    activeTab,
    setActiveTab,
    isAdmin,
    isPasswordConfigured,
    adminLogin,
    adminLogout,
    setupInitialAdminPassword,
    updateAdminPin,
    recoverAdminPassword,
    resetAdminToSetupMode,
    accountingSummary,
    getMemberSummary,
    cleanAllFinancialRecords,
    addMember,
    updateMember,
    deleteMember,
    addOfficeBearer,
    updateOfficeBearer,
    deleteOfficeBearer,
    addPayment,
    updatePayment,
    deletePayment,
    latestReceipt,
    setLatestReceipt,
    generateMonthlyFees,
    recordBulkMonthlyPayment,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    createEmergencyEvent,
    addEmergencyEvent,
    updateEmergencyEvent,
    deleteEmergencyEvent,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
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
