import { notification } from "@/components/notification";
import { TransactionReceipt } from "viem";

export function notifyTransaction(receipt: TransactionReceipt, explorer: { url: string }) {
  const { href } = new URL(`/tx/${receipt.transactionHash}`, explorer.url);

  if (receipt.status === "success") {
    notification.success({
      title: "The transaction was successful",
      description: (
        <a target="_blank" rel="noopener" className="break-all text-primary hover:underline" href={href}>
          {receipt.transactionHash}
        </a>
      ),
    });
  } else {
    notification.error({
      title: "The transaction failed",
      description: (
        <a target="_blank" rel="noopener" className="break-all text-primary hover:underline" href={href}>
          {receipt.transactionHash}
        </a>
      ),
    });
  }
}
