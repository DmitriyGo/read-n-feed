import { Dispatch, ReactElement } from 'react';
import { create } from 'zustand';

export type ModalModeInfo = {
  component: ReactElement;
  width?: number;
  height?: number;
};

const ModalInfos = {
  SignIn: {
    component: <p>SignIn</p>,
  },
  SignUp: {
    component: <p>SingUp</p>,
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
