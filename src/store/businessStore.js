import { create } from 'zustand';

const useBusinessStore = create((set) => ({
  currentPlan: null,
  currentCalculation: null,
  savedIdeas: [],
  savedPlans: [],
  savedCalculations: [],
  bookmarkedFunding: [],
  milestones: [],
  monthlyReports: [],
  goals: [],

  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  setCurrentCalculation: (calc) => set({ currentCalculation: calc }),
  setSavedIdeas: (ideas) => set({ savedIdeas: ideas }),
  setSavedPlans: (plans) => set({ savedPlans: plans }),
  setSavedCalculations: (calcs) => set({ savedCalculations: calcs }),
  setBookmarkedFunding: (funding) => set({ bookmarkedFunding: funding }),
  setMilestones: (milestones) => set({ milestones }),
  setMonthlyReports: (reports) => set({ monthlyReports: reports }),
  setGoals: (goals) => set({ goals }),
  clearBusiness: () => set({
    currentPlan: null,
    currentCalculation: null,
    savedIdeas: [],
    savedPlans: [],
    savedCalculations: [],
    bookmarkedFunding: [],
    milestones: [],
    monthlyReports: [],
    goals: [],
  }),
}));

export default useBusinessStore;
