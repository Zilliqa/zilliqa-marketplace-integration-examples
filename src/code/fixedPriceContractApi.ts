import { AssetIdentifier, getTokenAddress, getTokenId } from "./assetIdentifier";
import BN from 'bn.js';
import { BaseContractApi } from "./baseContractApi";
import { zillTokenAddress } from "./tokens";

export const sellerOrderSide = "0" 

export type ContractAssetSaleData = {
  assetContract: string,
  assetId: string,
  paymentTokenContract: string,
  price: string,
  seller: string,
  expiryInBlock: string
}

export class FixedPriceContractApi extends BaseContractApi {
  public async getAssetsOnSale(): Promise<Array<ContractAssetSaleData>> {
    const sellMap: any = await this.zilPay.blockchain.getSmartContractSubState(
      this.contractAddress,
      "sell_orders",
      []
    );

    if (!sellMap || !sellMap.result || !sellMap.result.sell_orders) {
      return [];
    }

    return Object.keys(sellMap.result.sell_orders).map(
      (assetContract) => Object.keys(sellMap.result.sell_orders[assetContract]).map(
        (assetId) => Object.keys(sellMap.result.sell_orders[assetContract][assetId]).map(
          (paymentTokenContract) => Object.keys(sellMap.result.sell_orders[assetContract][assetId][paymentTokenContract]).map(
            (price) => ({
              assetContract,
              assetId,
              paymentTokenContract,
              price,
              seller: sellMap.result.sell_orders[assetContract][assetId][paymentTokenContract][price].arguments[0],
              expiryInBlock: sellMap.result.sell_orders[assetContract][assetId][paymentTokenContract][price].arguments[1]
            })
          )
        )
      )
    ).flat(4)
  }

  public async purchaseAsset(
    tokenAddr: string,
    tokenId: string,
    paymentTokenAddr: string,
    price: string,
    side: string,
    receiverAddress: string,
    message: string,
    signature: string
  ) {
    // we need to transfer zills only if paying by zills
    const zilsToTansfer = paymentTokenAddr === zillTokenAddress ? price : "0"

    return await this.callTransitionThroughZillpay(
      "FulfillOrder",
      [
        {
            "vname":"token_address",
            "type":"ByStr20",
            "value": tokenAddr
        },
        {
            "vname":"token_id",
            "type":"Uint256",
            "value": tokenId
        },
        {
            "vname":"payment_token_address",
            "type":"ByStr20",
            "value": paymentTokenAddr
        },
        {
            "vname":"sale_price",
            "type":"Uint128",
            "value": price
        },
        {
            "vname":"side",
            "type":"Uint32",
            "value": side
        },
        {
            "vname":"dest",
            "type":"ByStr20",
            "value": receiverAddress
        },
        {
            "vname":"message",
            "type":"ByStr",
            "value": message
        },        
        {
            "vname":"signature",
            "type":"ByStr64",
            "value": signature
        }        
      ],
      zilsToTansfer
    )
  }

  public async putAssetsOnSale(
    assets: Array<AssetIdentifier>,
    salePrice: BN,
    saleExpiryBlock: BN,
    paymentTokenAddress: string
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
                  paymentTokenAddress,
                  `${salePrice}`,
                  `${sellerOrderSide}`,
                  `${saleExpiryBlock}`,
              ]
            })) as any,
        },
      ],
    )
  }
}