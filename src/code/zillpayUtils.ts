import { logError, logInfo, logSuccess } from "./logger"


export async function connectZilPay(zilPay: any) {
  if (!zilPay) {
    logError('Connecting to the wallet', 'Trying to connect to wallet but ZilPay extenson not detected')
    return false
  }

  logInfo('Connecting to the wallet', 'connecting to the ZilPay wallet')

  if (zilPay.wallet.isConnect) {
    logInfo('Connecting to the wallet', 'ZilPay is already connected')
    return true
  }

  if (await zilPay.wallet.connect()) {
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

    if (zilPay.wallet.http !== "https://dev-api.zilliqa.com") {
        logInfo(
            "Wallet connection check",
            "Set ZilPay network to https://dev-api.zilliqa.com"
        );
        return false
    }

    logSuccess("Wallet connection check", "ZilPay is connected");
    return true
}

export function getCurrentlyConnectedHexAddress(zilPay: any) {
    return zilPay.wallet?.defaultAccount?.base16.toLowerCase() || "";
}
