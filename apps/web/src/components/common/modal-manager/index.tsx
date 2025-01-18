import { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui';
import { ModalModeInfo, useModalStore } from '@/store/modal-store';

export const ModalManager = () => {
  const { mode, setMode } = useModalStore();

  const [modeComponent, setModeComponent] = useState<ModalModeInfo | null>(
    null,
  );

  useEffect(() => {
    if (mode) {
      setModeComponent(mode);
    }
  }, [mode]);

  return (
    <Dialog
      open={!!mode}
      onOpenChange={() => {
        setMode(null);
      }}
    >
      <DialogContent>
        <DialogTitle className="hidden" />

        <div
          style={{
            height: modeComponent?.height,
            width: modeComponent?.width,
          }}
        >
          {modeComponent?.component}
        </div>
      </DialogContent>
    </Dialog>
  );
};
