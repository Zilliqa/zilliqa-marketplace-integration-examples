import { getAssertedValue } from "./envUtils";
import { logError } from "./logger";

const DEFAULT_BLOCK_TX_RATE = "0.01";

async function callZilliqa(method: string) {
  try {
      const response = await fetch(
        getAssertedValue(process.env.NEXT_PUBLIC_ZILLIQA_NET_URL, 'NEXT_PUBLIC_ZILLIQA_NET_URL'),
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
              "Content-Type": "application/json",
          },
          redirect: "follow",
          referrerPolicy: "no-referrer",
          body: JSON.stringify({
            id: "1",
            jsonrpc: "2.0",
            method,
            params: [""],
          }),
      });
      return await response.json();
  } catch (error: any) {
      logError('callZilliqa', 'error', error)
  }
}

async function getTxBlockRate() {
    const blockRateData = await callZilliqa('GetTxBlockRate');
    return blockRateData?.result ?? DEFAULT_BLOCK_TX_RATE;
};

async function getCurrentBlockNum() {
  const latestBlock: any = await callZilliqa('GetLatestTxBlock');
  return latestBlock?.result?.header?.BlockNum ?? "0";
};

export const convertHourToBlocknum = async (
  hour: number
) => {
  const [
    currentBlockNum, blockTxRate
  ] = await Promise.all([
    getCurrentBlockNum(),
    getTxBlockRate()
  ])

  const estimatedBlockNumber = Number.parseInt(currentBlockNum) +
      Math.round(3600 * hour * Number.parseFloat(blockTxRate));

  return estimatedBlockNumber;
};
