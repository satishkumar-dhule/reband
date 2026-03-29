import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  getCreditsState,
  getBalance,
  getTransactionHistory,
  formatCredits as formatCreditsFn,
  redeemCoupon as redeemCouponFn,
  trackQuestionSwipe,
  deductQuestionViewCredits,
  awardVoiceInterviewCredits,
  shouldShowVoiceReminder,
  markVoiceReminderShown,
  processQuizAnswer,
  processSRSReview,
  CREDIT_CONFIG,
  type CreditsState,
  type CreditTransaction,
} from '../lib/credits';

interface CreditsContextType {
  balance: number;
  state: CreditsState;
  history: CreditTransaction[];
  config: typeof CREDIT_CONFIG;
  formatCredits: (amount: number) => string;
  onQuestionSwipe: () => { shouldRemind: boolean; swipeCount: number };
  onQuestionView: () => { success: boolean; cost: number; balance: number };
  onVoiceInterview: (verdict: string) => { baseCredits: number; bonusCredits: number; totalCredits: number; newBalance: number };
  onSRSReview: (rating: 'again' | 'hard' | 'good' | 'easy') => { amount: number; newBalance: number };
  onQuizAnswer: (isCorrect: boolean) => { amount: number; newBalance: number };
  onRedeemCoupon: (code: string) => { success: boolean; message: string; credits?: number; newBalance?: number };
  refreshBalance: () => void;
  shouldShowVoiceReminder: boolean;
  dismissVoiceReminder: () => void;
}

const CreditsContext = createContext<CreditsContextType | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [state, setState] = useState<CreditsState>({
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    usedCoupons: [],
    initialized: false,
  });
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  const refreshBalance = useCallback(() => {
    const newBalance = getBalance();
    const newState = getCreditsState();
    const newHistory = getTransactionHistory();
    setBalance(newBalance);
    setState(newState);
    setHistory(newHistory);
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const onQuestionSwipe = useCallback(() => {
    return trackQuestionSwipe();
  }, []);

  const onQuestionView = useCallback(() => {
    const result = deductQuestionViewCredits();
    refreshBalance();
    return result;
  }, [refreshBalance]);

  const onVoiceInterview = useCallback((verdict: string) => {
    const result = awardVoiceInterviewCredits(verdict);
    refreshBalance();
    return result;
  }, [refreshBalance]);

  const onSRSReview = useCallback((rating: 'again' | 'hard' | 'good' | 'easy') => {
    const result = processSRSReview(rating);
    refreshBalance();
    return result;
  }, [refreshBalance]);

  const onQuizAnswer = useCallback((isCorrect: boolean) => {
    const result = processQuizAnswer(isCorrect);
    refreshBalance();
    return result;
  }, [refreshBalance]);

  const onRedeemCoupon = useCallback((code: string) => {
    const result = redeemCouponFn(code);
    refreshBalance();
    return result;
  }, [refreshBalance]);

  const dismissVoiceReminder = useCallback(() => {
    markVoiceReminderShown();
    setReminderDismissed(true);
  }, []);

  const shouldShowVoice = shouldShowVoiceReminder() && !reminderDismissed;

  const value: CreditsContextType = {
    balance,
    state,
    history,
    config: CREDIT_CONFIG,
    formatCredits: formatCreditsFn,
    onQuestionSwipe,
    onQuestionView,
    onVoiceInterview,
    onSRSReview,
    onQuizAnswer,
    onRedeemCoupon,
    refreshBalance,
    shouldShowVoiceReminder: shouldShowVoice,
    dismissVoiceReminder,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits(): CreditsContextType {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}
