
import { create } from 'zustand';
import { AdSetState, initialAdSetState } from './types/adSetStoreTypes';
import { createAdSetActions } from './actions/adSet';

export const useAdSetStore = create<AdSetState>((set, get) => ({
  ...initialAdSetState,
  ...createAdSetActions(set, get)
}));
