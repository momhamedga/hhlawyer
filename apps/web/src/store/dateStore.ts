import { create } from 'zustand';

interface DateState {
  step: number;
  setStep: (step: number) => void;
}

export const useBookingStore = create<DateState>((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
}));
