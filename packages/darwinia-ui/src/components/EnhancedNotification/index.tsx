import "./styles.scss";
import closeIcon from "../../assets/images/close-white.svg";
import { NotificationConfig, Placement } from "../Notification";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { CSSTransition } from "react-transition-group";

const createNotificationFixedWrapper = (placement: Placement) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("dw-notification-wrapper");
  wrapper.classList.add(`${placement}`);
  document.body.append(wrapper);
  return wrapper;
};

interface NotificationManager {
  id: string;
  item: JSX.Element;
}

const notificationsHTMLWrapperSlots: Partial<Record<Placement, HTMLDivElement>> = {};
const notificationsReactRootSlots: Partial<Record<Placement, ReactDOM.Root>> = {};
const notificationsList: Partial<Record<Placement, NotificationManager[]>> = {};

const generateId = () => {
  return `${new Date().getTime()}-${Math.random() * 100000000}`;
};

const createNotification = (
  message: JSX.Element,
  placement: Placement = "rightTop",
  duration: number,
  autoClose: boolean
) => {
  let notificationId = "";
  let timeout: NodeJS.Timeout | undefined = undefined;
  const onCloseNotification = (id: string, placement: Placement) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    notificationsList[placement] = notificationsList[placement]?.filter((notification) => notification.id !== id);
    reRender(placement);
    if (notificationsList[placement]?.length === 0) {
      //all notifications have been removed
      notificationsHTMLWrapperSlots[placement]?.remove();
      delete notificationsReactRootSlots[placement];
    }
  };

  const reRender = (placement: Placement) => {
    notificationsReactRootSlots[placement]?.render(
      <>
        {notificationsList[placement]?.map((notification) => {
          return <div key={notification.id}>{notification.item}</div>;
        })}
      </>
    );
  };

  if (notificationsReactRootSlots[placement]) {
    notificationId = generateId();
    notificationsList[placement]?.push({
      id: notificationId,
      item: (
        <Notification
          duration={duration}
          closeNotification={(id) => {
            onCloseNotification(id, placement);
          }}
          id={notificationId}
          message={message}
        />
      ),
    });
    reRender(placement);
  } else {
    const fixedParent = createNotificationFixedWrapper(placement);
    notificationsHTMLWrapperSlots[placement] = fixedParent;
    const root = ReactDOM.createRoot(fixedParent);
    notificationId = generateId();

    notificationsList[placement] = [];

    notificationsList[placement]?.push({
      id: notificationId,
      item: (
        <Notification
          duration={duration}
          closeNotification={(id) => {
            onCloseNotification(id, placement);
          }}
          id={notificationId}
          message={message}
        />
      ),
    });

    root.render(
      <>
        {notificationsList[placement]?.map((notification) => {
          return <div key={notification.id}>{notification.item}</div>;
        })}
      </>
    );
    notificationsReactRootSlots[placement] = root;
  }

  if (autoClose) {
    timeout = setTimeout(() => {
      onCloseNotification(notificationId, placement);
    }, duration);
  }

  return {
    notificationId,
    placement,
    onClose: onCloseNotification,
  };
};

interface NotificationProps {
  message: JSX.Element;
  id: string;
  closeNotification: (id: string) => void;
  duration: number;
}

const Notification = ({ message, id, closeNotification, duration }: NotificationProps) => {
  const [isVisible, setVisible] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    setVisible(true);
    //allows animation before
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, duration - 600);
  }, []);
  return (
    <CSSTransition
      in={isVisible}
      timeout={duration}
      classNames={{ enter: "dw-enter", exit: "dw-leave" }}
      className={"dw-notification"}
    >
      <div className={"dw-notification-spacer"}>
        <div className={"dw-notification-content"}>
          <div className={"dw-notification-message"}>{message}</div>
          <div className={"dw-close-btn"}>
            <img
              onClick={() => {
                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                }
                setVisible(false);
                // allows animation
                setTimeout(() => {
                  closeNotification(id);
                }, 500);
              }}
              src={closeIcon}
              alt="close"
            />
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

Notification.displayName = "Notification";

const EnhancedNotification = {
  success: ({ message, placement = "rightTop", duration = 4500, autoClose = true }: NotificationConfig) => {
    const {
      notificationId,
      onClose,
      placement: innerPlacement,
    } = createNotification(message, placement, duration, autoClose);
    return {
      close: () => {
        onClose(notificationId, innerPlacement);
      },
    };
  },
};

export default EnhancedNotification;
