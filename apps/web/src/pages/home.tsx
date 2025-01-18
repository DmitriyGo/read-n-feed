import { Button } from '@/components/ui';
import { useModalStore } from '@/store/modal-store';

export const HomePage = () => {
  const { setMode } = useModalStore();

  return (
    <div className="dark">
      <p>HomePage</p>
      <Button
        variant="destructive"
        onClick={() => {
          setMode('SignIn');
        }}
      >
        SignIn
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          setMode('SignUp');
        }}
      >
        SignUp
      </Button>
    </div>
  );
};
