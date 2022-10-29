import { getAssertedValue } from "./envUtils"
import { logError, logInfo, logSuccess } from "./logger"

export const ExpectedZilliqaNetwork = getAssertedValue(process.env.NEXT_PUBLIC_ZILLIQA_NET_URL, 'NEXT_PUBLIC_ZILLIQA_NET_URL')

export async function connectZilPay(zilPay: any) {
  if (!zilPay) {
    logError('Connecting to the wallet', 'Trying to connect to wallet but ZilPay extenson not detected')
    return false
  }

  logInfo('Connecting to the wallet', 'connecting to the ZilPay wallet')

  if (zilPay.wallet.isConnect) {
    if (zilPay.wallet.http !== ExpectedZilliqaNetwork) {
      logInfo(
          "Connecting to the wallet",
          `Set ZilPay network to ${ExpectedZilliqaNetwork}`
      );
      return false
    }

    logInfo('Connecting to the wallet', 'ZilPay is already connected')
    return true
  }

  if (await zilPay.wallet.connect()) {
    if (zilPay.wallet.http !== ExpectedZilliqaNetwork) {
      logInfo(
          "Connecting to the wallet",
          `Set ZilPay network to ${ExpectedZilliqaNetwork}`
      );
      return false
    }

    logSuccess('Connecting to the wallet', 'Successfully connected to the to the ZilPay wallet')
    return true
  }

  logError('Connecting to the wallet', 'Connecting to the to the ZilPay wallet failed')
  return false
}

export function isZilPayEnable(zilPay: any): boolean {
    if (!zilPay) {
        logInfo("Wallet connection check", "ZilPay extenson not detected");
        return false
    }

    if (!zilPay.wallet.isConnect) {
        logInfo("Wallet connection check", "ZilPay is not connected");
    }

    if (!zilPay.wallet.isEnable) {
        logInfo("Wallet connection check", "ZilPay is not enabled");
        return false
    }

    if (zilPay.wallet.http !== ExpectedZilliqaNetwork) {
        logInfo(
            "Wallet connection check",
            `Set ZilPay network to ${ExpectedZilliqaNetwork}`
        );
        return false
    }

    logSuccess("Wallet connection check", "ZilPay is connected");
    return true
}

export function getCurrentlyConnectedHexAddress(zilPay: any) {
    return zilPay.wallet?.defaultAccount?.base16.toLowerCase() || "";
}

export function updateTransactionStatus(
  zilPay: any,
  tx: string,
  onSuccess: ((Tx?: any) => Promise<void>) | ((Tx?: any) => void),
  onError: ((err: any) => Promise<void>) | ((err: any) => void)
): void {
  const subscription = zilPay.wallet
      .observableTransaction(tx)
      .subscribe(async (hash: any) => {
          subscription.unsubscribe();
          try {
              const tx = await zilPay.blockchain.getTransaction(hash);
              const success = tx.receipt.success;

              if (success) {
                  await onSuccess(tx);
              } else {
                  await onError(`unsuccessful transaction ${JSON.stringify(tx)}`);
              }
          } catch (error) {
              logError(
                  'updateTransactionStatus',
                  'error while observing transaction',
                  {  tx, error}
              )
              await onError(error);
          }
      });
};