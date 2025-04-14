import { Dispatch, ReactElement } from 'react';
import { create } from 'zustand';

import { SignInModal, SignUpModal } from '@/components/common/modals';
import { CreateRequestBookModal } from '@/components/common/modals/request-for-create-book';
import { UpdateRequestBookModal } from '@/components/common/modals/update-book-request';

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
  CreateBookRequest: {
    component: <CreateRequestBookModal />,
  },
  UpdateBookRequest: {
    component: <UpdateRequestBookModal />,
  },
} satisfies Record<string, ModalModeInfo>;

export type ModalMode = keyof typeof ModalInfos;

type ModalStore = {
  mode: ModalModeInfo | null;
  params: Record<string, unknown>;
  setParam: (key: string, value: unknown) => void;
  clearParams: Dispatch<void>;
  setMode: Dispatch<ModalMode | null>;
};

export const useModalStore = create<ModalStore>((set) => ({
  mode: null,
  params: {},
  setMode: (value) =>
    set({
      mode: value ? ModalInfos[value] : null,
    }),
  setParam: (key, value) =>
    set((state) => ({
      params: {
        ...state.params,
        [key]: value,
      },
    })),
  clearParams: () =>
    set({
      params: {},
    }),
}));
