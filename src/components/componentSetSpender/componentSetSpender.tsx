import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Heading, Spacer, Table, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { FC } from "react";
import { contextContainer } from "~/code/contextContainer";
import { logError, logInfo, logSuccess } from "~/code/logger";
import { updateTransactionStatus } from "~/code/zillpayUtils";
import { ZRC6Api } from "~/code/zrc6Api";

const SetSpender: FC = () => {

  const {
    ownedNFTs,
    zilPay,
    setTransactionInProgress,
    onOpen,
    setModalBody,
    fixedPriceContractAddress,
    setTransactionError
	} = contextContainer.useContainer();

  const nftContracts = Array.from(new Set(ownedNFTs.map((nft) => nft.contractAddress)))

  const setSpenderOnZRC6OnSuccess = () => {
    logSuccess('setSpender', 'fixed price contract set as a spender successfuly')
    setModalBody('fixed price contract set as a spender successfuly')
    setTransactionInProgress(false)
  }

  const setSpenderOnZRC6OnFailure = (error: any) => {
    logError('setSpender', 'error while setting spender', { error })

    if (error?.receipt?.exceptions?.length > 0) {
      setModalBody(error?.receipt?.exceptions[0])
    } else {
      setModalBody(error)
    }

    setTransactionError(true)
    setTransactionInProgress(false)
  }

  const setSpenderOnZRC6 = async (nftContract: string) => {
    setTransactionInProgress(true)
    setTransactionError(false)
    onOpen()

    try {
      const zrc6Api = new ZRC6Api(
        zilPay,
        nftContract
      )

      const tokenIds = ownedNFTs.filter(
        (nft) => nft.contractAddress === nftContract
      ).map(
        (nft) => nft.tokenId
      )

      logInfo('setSpender', 'transition prepared', {
        tokenIds, fixedPriceContractAddress, nftContract
      })
      setModalBody("Sign transaction in ZilPay")

      const tx = await zrc6Api.setSpender(
        tokenIds,
        fixedPriceContractAddress
      )

      logInfo('setSpender', 'transaction submitted', { tx })
      setModalBody(`Transaction id ${tx.ID}`)

      updateTransactionStatus(
        zilPay,
        tx.ID,
        setSpenderOnZRC6OnSuccess,
        setSpenderOnZRC6OnFailure
      )
    } catch (error) {
      setSpenderOnZRC6OnFailure(error)
    }
  }

  return (<>
    <Box mb={5} bg="lightgray" borderRadius='lg' w='100%' p={4} color='black'>
      <Heading as='h6' size='m'>
        SetSpender step
      </Heading>
      <Text>
        To be able to list assets for sale on a given fixed price contract
        you first need to set this contract as a spender on the zrc6 asset contract through SetSpender transition.
        You need to make one transaction per ZRC6 contract. Meaning, if you
        have 300 NFTs in 3 ZRC6 cotracts (e.g., 100 each) then you need to invoke
        setSpender on three contracts thus three transactions are required
      </Text>
      <Text mt={3}>
        Fixed price contract address (base16): { fixedPriceContractAddress }
      </Text>
    </Box>

    {
      nftContracts.map(
        (nftContract, idx) => {
          const ownedAssetsInGivenContract = ownedNFTs
            .filter((nft) => nft.contractAddress === nftContract)

          return (
            <div key={idx}>
              <Heading as='h6' size='xs'>
                NFTs in {nftContract} ZRC6 contract
              </Heading>
              <TableContainer>
                <Table variant='striped'>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Identifier</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    { 
                      ownedAssetsInGivenContract.map((nft, idx) => (
                        <Tr key={idx}>
                          <Td>{ nft.name }</Td>
                          <Td>{ nft.contractAddress }:{ nft.tokenId }</Td>
                        </Tr>
                      ))
                    }
                  </Tbody>
                  <Tfoot>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Identifier</Th>
                    </Tr>
                  </Tfoot>
                </Table>
              </TableContainer>
              <Flex>
                <Spacer />
                <Button
                  variant='outline'
                  colorScheme='green'
                  aria-label='Set Spender on assets'
                  onClick={() => setSpenderOnZRC6(nftContract)}
                >
                  Set Spender on {ownedAssetsInGivenContract.length} NFTs<ArrowForwardIcon ml={2} />
                </Button>
              </Flex>
            </div>
          )
        }
      )
    }

  </>)

}

export default SetSpender