import { BaseContractApi } from "./baseContractApi";

export class ZRC6Api extends BaseContractApi {
  public async setSpender(
    tokenIds: Array<string>,
    spender: string
  ) {
    return await this.callTransitionThroughZillpay(
      "SetBatchSpender",
      [
        {
            vname: "spender_tokenid_list",
            type: "List (Pair (ByStr20) (Uint256))",
            value: tokenIds.map((tu) => ({
                constructor: "Pair",
                argtypes: ["ByStr20", "Uint256"],
                arguments: [`${spender}`, `${tu}`],
            })) as any,
        },
    ],
    )
  }
}