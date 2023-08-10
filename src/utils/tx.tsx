import { notification } from "@/components/notification";
import { TransactionReceipt } from "viem";

export function notifyTransaction(receipt: TransactionReceipt, explorer: { url: string }) {
  if (receipt.status === "success") {
    notification.success({
      title: "The transaction was successful",
      description: (
        <a
          target="_blank"
          rel="noopener"
          className="break-all text-primary hover:underline"
          href={`${explorer.url}tx/${receipt.transactionHash}`}
        >
          {receipt.transactionHash}
        </a>
      ),
    });
  } else {
    notification.error({
      title: "The transaction failed",
      description: (
        <a
          target="_blank"
          rel="noopener"
          className="break-all text-primary hover:underline"
          href={`${explorer.url}tx/${receipt.transactionHash}`}
        >
          {receipt.transactionHash}
        </a>
      ),
    });
  }
}
