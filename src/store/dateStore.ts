import { create } from 'zustand';

interface DateState {
  step: number;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedService: string | null;
  setStep: (step: number) => void;
  setData: (data: Partial<{selectedDate: string, selectedTime: string, selectedService: string}>) => void;
}

export const useBookingStore = create<DateState>((set) => ({
  step: 1,
  selectedDate: null,
  selectedTime: null,
  selectedService: null,
  setStep: (step) => set({ step }),
  setData: (data) => set((state) => ({ ...state, ...data })),
}));