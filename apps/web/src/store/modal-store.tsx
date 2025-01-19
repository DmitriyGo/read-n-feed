import { Dispatch, ReactElement } from 'react';
import { create } from 'zustand';

import { SignInModal, SignUpModal } from '@/components/common/modals';

export type ModalModeInfo = {
  component: ReactElement;
  width?: number;
  height?: number;
};

const ModalInfos = {
  SignIn: {
    component: <SignInModal />,
  },
  SignUp: {
    component: <SignUpModal />,
  },
} satisfies Record<string, ModalModeInfo>;

export type ModalMode = keyof typeof ModalInfos;

type ModalStore = {
  mode: ModalModeInfo | null;
  setMode: Dispatch<ModalMode | null>;
};

export const useModalStore = create<ModalStore>((set) => ({
  mode: null,
  setMode: (value) =>
    set({
      mode: value ? ModalInfos[value] : null,
    }),
}));
