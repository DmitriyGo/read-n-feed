import { Dispatch, ReactElement } from 'react';
import { create } from 'zustand';

import { SignInModal, SignUpModal } from '@/components/common/modals';
import { RequestForCreateModal } from '@/components/common/modals/request-for-create';

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
  CreateRequestForUpload: {
    component: <RequestForCreateModal />,
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
