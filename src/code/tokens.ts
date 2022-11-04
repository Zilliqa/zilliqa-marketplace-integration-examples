import { getAssertedValue } from "./envUtils"

export const zillTokenAddress = '0x0000000000000000000000000000000000000000'
export const sgdTokenAddress = getAssertedValue(process.env.NEXT_PUBLIC_XSGD_CONTRACT_ADDRESS, 'NEXT_PUBLIC_XSGD_CONTRACT_ADDRESS')
export const referenceZrc2TokenAddress = getAssertedValue(process.env.NEXT_PUBLIC_REFERENCE_ZRC2_CONTRACT_ADDRESS, 'NEXT_PUBLIC_REFERENCE_ZRC2_CONTRACT_ADDRESS')

export function paymentTokenAddressName(contractAddress: string) {
  switch(contractAddress) {
    case zillTokenAddress: return 'ZIL'
    case sgdTokenAddress: return 'XSGD'
    case referenceZrc2TokenAddress: return 'ZRC2'
    default: return 'Unknown'
  }
}