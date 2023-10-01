import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

function createUid() {
  return Math.floor(Number.MAX_SAFE_INTEGER * Math.random()).toString(36);
}

interface ModalProps {
  title: string;
  children: ReactNode;
}

interface KeyedModalProps extends ModalProps {
  uid: string;
}

function Modal({ title, children }: ModalProps) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      className="flex flex-col rounded-lg bg-primary-800 p-2 text-white backdrop:bg-gray-950 backdrop:opacity-75"
      aria-labelledby={id}
      ref={ref}
    >
      <h2 id={id} className="text-3xl font-bold">
        {title}
      </h2>
      <form method="dialog">{children}</form>
    </dialog>
  );
}

type ShowModalFn = (props: ModalProps) => void;

const ModalsContext = createContext<KeyedModalProps[]>([]);
const ShowModalContext = createContext<ShowModalFn>(() => {
  console.log('shit');
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<KeyedModalProps[]>([]);

  const showModal = useCallback((modalProps: ModalProps) => {
    console.log('hi im here', modals);
    setModals((curModals) => [...curModals, { ...modalProps, uid: createUid() }]);
  }, []);

  return (
    <ShowModalContext.Provider value={showModal}>
      <ModalsContext.Provider value={modals}>{children}</ModalsContext.Provider>
    </ShowModalContext.Provider>
  );
}

export function ModalOutlet() {
  const modals = useContext(ModalsContext);
  return (
    <div>
      {modals.map((modal) => {
        const { uid, ...modalProps } = modal;
        return <Modal key={uid} {...modalProps} />;
      })}
    </div>
  );
}

export function useShowModal() {
  return useContext(ShowModalContext);
}
