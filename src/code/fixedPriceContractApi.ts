import { AssetIdentifier, getTokenAddress, getTokenId } from "./assetIdentifier";
import BN from 'bn.js';
import { BaseContractApi } from "./BaseContractApi";

const zillTokenAddress = "0x0000000000000000000000000000000000000000";
const sellerOrderSide = "0" 

export class FixedPriceContractApi extends BaseContractApi {
  public getAssetsOnSale() {

  }

  public async putAssetsOnSale(
    assets: Array<AssetIdentifier>,
    salePriceInQa: BN,
    saleExpiryBlock: BN
  ) {
    return await this.callTransitionThroughZillpay(
      "SetBatchOrder",
      [
        {
            vname: "order_list",
            type: `List (${this.contractAddress}.OrderParam)`,
            value: assets.map((asset) => ({
              constructor: `${this.contractAddress}.OrderParam`,
              argtypes: [],
              arguments: [
                  getTokenAddress(asset),
                  getTokenId(asset),
                  zillTokenAddress,
                  `${salePriceInQa}`,
                  `${sellerOrderSide}`,
                  `${saleExpiryBlock}`,
              ]
            })) as any,
        },
      ],
    )
  }
}