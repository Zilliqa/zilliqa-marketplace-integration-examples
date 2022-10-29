import { getCurrentBlockNum } from "./getCurrentBlockNum";

export const DEFAULT_BLOCK_TX_RATE = 0.01;

export const convertHourToBlocknum = async (
    hour: number,
    blockTxRate: number
) => {
    const currentBlockNum = await getCurrentBlockNum();

    const toReturn =
        parseInt(currentBlockNum) +
        Math.round(3600 * hour * (blockTxRate ?? DEFAULT_BLOCK_TX_RATE));
    return toReturn;
};
