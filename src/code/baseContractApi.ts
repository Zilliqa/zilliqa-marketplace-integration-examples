import { units, Long } from "@zilliqa-js/util";
import { logInfo } from "./logger";

export const DEFAULT_GAS = {
  gasPrice: units.toQa("2000", units.Units.Li),
  gasLimit: Long.fromNumber(Number("5000")),
};

export class BaseContractApi {
  constructor(
    protected zilPay: any,
    protected contractAddress: string
  ) {

  }

  protected async callTransitionThroughZillpay(
    transition: string,
    params: any
  ) {
    logInfo('Contract API', 'call', {
      contractAddress: this.contractAddress,
      transition,
      params
    })

    const { contracts } = this.zilPay;
    const contract = contracts.at(this.contractAddress);

    return await contract.call(
      transition,
      params,
      {
        amount: "0",
        gasPrice: DEFAULT_GAS.gasPrice,
        gasLimit: DEFAULT_GAS.gasLimit,
      },
      true
    );
  }
}
