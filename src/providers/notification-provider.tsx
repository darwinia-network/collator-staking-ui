"use client";

import Image from "next/image";
import {
  PropsWithChildren,
  ReactElement,
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { timer, Subscription } from "rxjs";

type Closer = () => void;
type Status = "success" | "info" | "warn" | "error";

interface Config {
  title?: ReactElement | string;
  description?: ReactElement | string;
  duration?: number; // millisecond
  hideCloseBtn?: boolean;
  className?: string;
  onClose?: () => void;
}

interface NotificationCtx {
  notification: {
    error: (config: Config) => Closer;
    warn: (config: Config) => Closer;
    info: (config: Config) => Closer;
    success: (config: Config) => Closer;
  };
}

const defaultValue: NotificationCtx = {
  notification: {
    error: () => () => undefined,
    warn: () => () => undefined,
    info: () => () => undefined,
    success: () => () => undefined,
  },
};
const DEFAULT_DURATION = 4500; // 4.5s

export const NotificationContext = createContext(defaultValue);

export function NotificationProvider({ children }: PropsWithChildren<unknown>) {
  const idCountRef = useRef(0);
  const wrapperRef = useRef<Record<number, HTMLDivElement | undefined>>({});
  const notificationRef = useRef<Record<number, HTMLDivElement | undefined>>({});
  const [notifications, setNotifications] = useState<(Config & { status: Status; id: number })[]>([]);

  const handleNotification = useCallback((config: Config, status: Status) => {
    const id = idCountRef.current++;
    setNotifications((prev) => [...prev, { ...config, status, id }]);
    return () => notificationRef.current[id]?.classList.add("animate-notification-leave");
  }, []);

  const error = useCallback((config: Config) => handleNotification(config, "error"), [handleNotification]);
  const warn = useCallback((config: Config) => handleNotification(config, "warn"), [handleNotification]);
  const info = useCallback((config: Config) => handleNotification(config, "info"), [handleNotification]);
  const success = useCallback((config: Config) => handleNotification(config, "success"), [handleNotification]);

  return (
    <NotificationContext.Provider value={{ notification: { error, warn, info, success } }}>
      {children}
      {!!notifications.length &&
        createPortal(
          <div className="fixed right-middle top-middle z-40 flex flex-col overflow-hidden lg:right-5 lg:top-5">
            {notifications.map(({ id, status, onClose, ...rest }) => (
              <div
                key={id}
                ref={(node) => {
                  if (node) {
                    wrapperRef.current[id] = node;
                  }
                }}
                onAnimationEnd={(e) => {
                  e.stopPropagation();
                  setNotifications((prev) => {
                    const idx = prev.findIndex((item) => item.id === id);
                    if (idx >= 0) {
                      prev.splice(idx, 1);
                      return [...prev];
                    }
                    return prev;
                  });
                  onClose && onClose();
                }}
              >
                <Notification
                  status={status}
                  config={rest}
                  onClose={() => {
                    if (wrapperRef.current[id]?.style) {
                      (
                        wrapperRef.current[id] as HTMLDivElement
                      ).style.height = `${notificationRef.current[id]?.offsetHeight}px`;
                    }
                    wrapperRef.current[id]?.classList.add("animate-notification-fadeout");
                  }}
                  ref={(node) => {
                    if (node) {
                      notificationRef.current[id] = node;
                    }
                  }}
                />
              </div>
            ))}
          </div>,
          document.body
        )}
    </NotificationContext.Provider>
  );
}

const Notification = forwardRef<HTMLDivElement, { config: Config; status: Status; onClose: () => void }>(
  function Notification({ config, status, onClose }, ref) {
    const thisRef = useRef<HTMLDivElement | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);

    useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => thisRef.current, []);

    useEffect(() => {
      let sub$$: Subscription | undefined;

      if (config.duration !== 0) {
        timer(config.duration && config.duration > 1000 ? config.duration : DEFAULT_DURATION).subscribe(() => {
          setIsTimeout(true);
          if (!isHovering) {
            thisRef.current?.classList.add("animate-notification-leave");
          }
        });
      }

      return () => sub$$?.unsubscribe();
    }, [config.duration, isHovering]);

    return (
      <div
        className={`relative mb-middle flex animate-notification-enter items-center gap-middle border border-primary bg-component p-middle lg:p-5 ${config.className}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          if (isTimeout) {
            setTimeout(() => thisRef.current?.classList.add("animate-notification-leave"), 400);
          }
        }}
        onAnimationEnd={(e) => {
          e.stopPropagation();
          if (thisRef.current?.classList.contains("animate-notification-enter")) {
            thisRef.current.classList.remove("animate-notification-enter");
          } else if (thisRef.current?.classList.contains("animate-notification-leave")) {
            onClose();
          }
        }}
        ref={thisRef}
      >
        <Image alt={status} width={20} height={20} src={`/images/status/${status}.svg`} className="self-start" />
        <div className="flex flex-col gap-small">
          {config.title && <div className="text-xs font-bold text-white">{config.title}</div>}
          {config.description && <div className="text-xs font-light text-white">{config.description}</div>}
        </div>
        {!config.hideCloseBtn && (
          <Image
            alt="Close"
            width={16}
            height={16}
            src="/images/close-white.svg"
            className="absolute right-1 top-1 transition-transform hover:scale-105 hover:cursor-pointer active:scale-95 lg:right-2 lg:top-2"
            onClick={() => {
              thisRef.current?.classList.add("animate-notification-leave");
            }}
          />
        )}
      </div>
    );
  }
);
