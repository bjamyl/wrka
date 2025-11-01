import { create, useStore } from "zustand";


export const StartJobState = create<{
  showSheet:boolean;
  isStarting:boolean;

  setShowSheet: (val:boolean) => void;
  setIsStarting: (val:boolean) => void;
}>((set) => ({
  showSheet:false,
  isStarting: false,
  setIsStarting: (val) => {
    set({isStarting: val})
  },
  setShowSheet: (val) => {
    return set({showSheet: val})
  }
}))

export const useStartJobStore = () => {
  const showStartJob = useStore(StartJobState, (state) => state.showSheet)
  const setShowStartJob = useStore(StartJobState, (state) => state.setShowSheet)
  const isStarting = useStore(StartJobState, (state) => state.isStarting)
  const setIsStarting = useStore(StartJobState, (state) => state.setIsStarting)

  return {
    showStartJob,
    setShowStartJob,
    isStarting,
    setIsStarting
  }
}
