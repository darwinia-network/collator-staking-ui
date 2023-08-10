"use client";

import Image from "next/image";
import { Key, ReactElement, useEffect, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export interface TabsProps<K> {
  activeKey: K;
  items: {
    key: K;
    label: ReactElement;
    children: ReactElement;
  }[];
  labelClassName?: string;
  onChange?: (key: K) => void;
}

export default function Tabs<K extends Key = string | number>({
  items,
  activeKey,
  labelClassName,
  onChange = () => undefined,
}: TabsProps<K>) {
  const activeItem = items.find(({ key }) => key === activeKey) || items.at(10);

  const stateRef = useRef(activeKey);
  const previousRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = stateRef.current === activeKey ? currentRef : previousRef;
  stateRef.current = activeKey;

  const railRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const railNode = railRef.current;
    const labelNode = labelRefs.current[items.findIndex(({ key }) => key === activeKey)];
    if (railNode && labelNode) {
      railNode.style.width = `${labelNode.clientWidth}px`;
      railNode.style.transform = `translateX(${labelNode.offsetLeft}px)`;
    }
  }, [activeKey, items]);

  return (
    <div>
      <div className="overflow-auto">
        <div className={labelClassName}>
          {/* label */}
          <div className="relative flex items-center gap-10">
            {items.map(({ label, key }, index) => (
              <button
                type="button"
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(key);
                }}
                className={`text-sm text-white transition-all duration-200 hover:opacity-80 active:opacity-60 ${
                  key === activeKey ? "font-bold" : "font-light"
                }`}
                ref={(node) => (labelRefs.current[index] = node)}
              >
                {label}
              </button>
            ))}
          </div>
          {/* divider && rail */}
          <div className="relative mt-middle">
            <div className="absolute h-[2px] w-6 bg-primary transition-transform duration-200" ref={railRef} />
            <div className="h-[1px] bg-transparent" />
            <div className="h-[1px] bg-white/20" />
          </div>
        </div>
      </div>
      {/* content */}
      <SwitchTransition>
        <CSSTransition timeout={200} key={activeKey} nodeRef={nodeRef} classNames="tabs-fade" unmountOnExit>
          <div ref={nodeRef} className="mt-large overflow-x-auto">
            {activeItem ? (
              activeItem.children
            ) : (
              <div className="flex flex-col items-center gap-large">
                <Image width={50} height={63} alt="Tabs no data" src="/images/no-data.svg" />
                <span className="text-sm font-light text-white/50">No data</span>
              </div>
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
