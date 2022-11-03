import { getAssertedValue } from "./envUtils"

export const zillTokenAddress = '0x0000000000000000000000000000000000000000'
export const sgdTokenAddress = getAssertedValue(process.env.NEXT_PUBLIC_XSGD_CONTRACT_ADDRESS, 'NEXT_PUBLIC_XSGD_CONTRACT_ADDRESS')

export function paymentTokenAddressName(contractAddress: string) {
  if (contractAddress === zillTokenAddress) {
    return 'ZIL'
  }

  if (contractAddress === sgdTokenAddress) {
    return 'XSGD'
  }

  return 'unknown'
}