import Image from "next/image";

interface Props {
  title?: string;
  message?: string;
  actionText?: string;
  action?: () => void;
}

export default function ErrorCatcher({
  title = "Oops!",
  message = "Sorry, an unexpected error has occurred.",
  actionText,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 lg:flex-row lg:gap-10">
      <Image width={144} height={144} alt="Not found" src="/images/not-found.png" className="shrink-0 lg:hidden" />
      <Image
        width={256}
        height={256}
        alt="Not found"
        src="/images/not-found.png"
        className="hidden shrink-0 lg:block"
      />
      <div className="flex flex-col items-center justify-start gap-middle text-center lg:items-start lg:gap-5">
        <h5 className="text-lg font-bold text-white">{title}</h5>
        <span className="text-sm font-bold text-white">{message}</span>
        {actionText && action && (
          <button
            onClick={action}
            className="border border-primary px-large py-1 text-sm font-bold text-white transition-opacity hover:opacity-80 active:opacity-60"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
