import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Text, Button, Heading, Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { FC } from "react"
import { AssetType } from "~/code/assetTypes";
import { CreateMessage, SignMessage } from "~/code/buyOrderUtils";
import { contextContainer } from "~/code/contextContainer";
import { getAssertedValue } from "~/code/envUtils";
import { ContractAssetSaleData, FixedPriceContractApi, sellerOrderSide } from "~/code/fixedPriceContractApi";
import { logError, logInfo, logSuccess } from "~/code/logger";
import { paymentTokenAddressName } from "~/code/tokens";
import { updateTransactionStatus } from "~/code/zillpayUtils";


const BuyNft: FC = () => {
  const {
    assetSaleData,
    setModalBody,
    setTransactionInProgress,
    setTransactionError,
    onOpen,
    zilPay,
    fixedPriceContractAddress,
    currentlyConnectedWalletAddress,
	} = contextContainer.useContainer();

  const handleNftBuySuccess = () => {
    logSuccess('handleNftBuy', 'fixed price contract buy successfull')
    setModalBody('asset bought')
    setTransactionInProgress(false)
  }

  const handleNftBuyFailure = (error: any) => {
    logError('handleNftBuy', 'error while setting spender', { error })

    if (error?.receipt?.exceptions?.length > 0) {
      setModalBody(error?.receipt?.exceptions[0])
    } else {
      setModalBody(error)
    }

    setTransactionError(true)
    setTransactionInProgress(false)
  }

  const handleNftBuy = async (nft: ContractAssetSaleData & AssetType) => {
    setTransactionInProgress(true)
    setTransactionError(false)
    onOpen()

    try {
      const fixedPriceApi = new FixedPriceContractApi(
        zilPay,
        fixedPriceContractAddress
      )

      /**
       * <Purchase voucher generation block>
       */
      setModalBody("Creating voucher")
      const voucherExpiryBlock = '99999999999'

      const message = CreateMessage(
        nft.contractAddress,
        nft.tokenId,
        currentlyConnectedWalletAddress!.base16,
        sellerOrderSide,
        nft.price,
        nft.paymentTokenContract,
        voucherExpiryBlock
      )

      setModalBody("Signing voucher")

      const signature = await SignMessage(
        getAssertedValue(process.env.NEXT_PUBLIC_VOUCHER_SIGNER, 'NEXT_PUBLIC_VOUCHER_SIGNER'),
        message
      )

      /**
       * <Purchase voucher generation block />
       */

      logInfo('handleNftBuy', 'transition prepared', {
        nft, fixedPriceContractAddress, message, signature
      })
     
      setModalBody("Sign transaction in ZilPay")

      const tx = await fixedPriceApi.purchaseAsset(
        nft.contractAddress,
        nft.tokenId,
        nft.paymentTokenContract,
        nft.price,
        sellerOrderSide,
        currentlyConnectedWalletAddress!.base16,
        message,
        signature
      )

      logInfo('handleNftBuy', 'transaction submitted', { tx })
      setModalBody(`Transaction id ${tx.ID}`)

      updateTransactionStatus(
        zilPay,
        tx.ID,
        handleNftBuySuccess,
        handleNftBuyFailure
      )
    } catch (error) {
      handleNftBuyFailure(error)
    }
  }

  return (
    <>
      <Box mb={5} bg="lightgray" borderRadius='lg' w='100%' p={4} color='black'>
        <Heading as='h6' size='m'>
          FulfillOrder step
        </Heading>
        <Text>
          In this code example the purchase voucher is generated on the fly locally, see |Purchase voucher generation block| in the componentBuyNft.tsx
          This voucher logic can be leveraged to limit the number of purchases available to a given user by generating in on the backend and sending limited number of them to a given user.
        </Text>

        <Text>
          If you are buying with ZRC2 tokens (like XSGD) make sure that you set the spending allowance first. Otherwise, you will get insufficient funds error
        </Text>
        <Text mt={3}>
          Fixed price contract address (base16): { fixedPriceContractAddress }
        </Text>
      </Box>


      {
        assetSaleData
          .filter(
            (as) => as.ownerAddress === currentlyConnectedWalletAddress?.base16
          ).length > 0 &&
          <>
            <Heading as='h6' size='m'>
              Your sales
            </Heading>

            <TableContainer>
              <Table variant='striped'>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Identifier</Th>
                    <Th>Price</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  { assetSaleData
                    .filter(
                      (as) => as.ownerAddress === currentlyConnectedWalletAddress?.base16
                    )
                    .map((nft, idx) => (
                    <Tr key={idx}>
                      <Td>{ nft.name }</Td>
                      <Td>{ nft.contractAddress }:{ nft.tokenId }</Td>
                      <Td>{  nft.price } ({ paymentTokenAddressName(nft.paymentTokenContract) })</Td>
                      <Td>
                      <Button
                        variant='outline'
                        colorScheme='green'
                        aria-label='Buy'
                        disabled={true}
                      >
                        Buy <ArrowForwardIcon ml={2} />
                      </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Identifier</Th>
                    <Th>Price</Th>
                    <Th></Th>
                  </Tr>
                </Tfoot>
              </Table>
            </TableContainer>
          </>
        }

      <Heading as='h6' size='m'>
        Others offers
      </Heading>

      <TableContainer>
        <Table variant='striped'>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Identifier</Th>
              <Th>Price</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            { assetSaleData
              .filter(
                (as) => as.ownerAddress !== currentlyConnectedWalletAddress?.base16
              )
              .map((nft, idx) => (
              <Tr key={idx}>
                <Td>{ nft.name }</Td>
                <Td>{ nft.contractAddress }:{ nft.tokenId }</Td>
                <Td>{  nft.price } ({ paymentTokenAddressName(nft.paymentTokenContract) })</Td>
                <Td>
                <Button
                  variant='outline'
                  colorScheme='green'
                  aria-label='Buy'
                  onClick={() => handleNftBuy(nft)}
                >
                  Buy <ArrowForwardIcon ml={2} />
                </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Name</Th>
              <Th>Identifier</Th>
              <Th>Price</Th>
              <Th></Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </>
  )
}

export default BuyNft
