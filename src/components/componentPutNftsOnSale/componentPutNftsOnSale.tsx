import { Box, Button, Center, Checkbox, Code, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, IconButton, Input, NumberInput, NumberInputField, Select, Spacer, Spinner, Tab, Table, TableContainer, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Text, Tfoot, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react";
import { FC, useEffect } from "react";
import { contextContainer } from "~/code/contextContainer";
import { FixedPriceContractApi } from "~/code/fixedPriceContractApi";
import { BN } from "bn.js";
import { logError, logInfo, logSuccess } from "~/code/logger";
import { updateTransactionStatus } from "~/code/zillpayUtils";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { referenceZrc2TokenAddress, sgdTokenAddress, zillTokenAddress } from "~/code/tokens";
import { convertHourToBlocknum } from "~/code/zilliqaApi";


const PutNftsOnSale: FC = () => {
  const {
    loadingNfts,
    ownedNFTs,
    switchNftSaleSelection,
    nftsSelectedForSale,
    zilPay,
    fixedPriceContractAddress,
    setTransactionInProgress,
    onOpen,
    setModalBody,
    setTransactionError,
    priceValue, setPriceValue,
    paymentToken, setPaymentToken,
    durationValue, setDurationValue,
    estimatedSaleEndBlock, setEstimatedSaleEndBlock,
	} = contextContainer.useContainer();

  const handlePriceInputChange = (e: any) => setPriceValue(e.target.value)
  const handleDurationInputChange = (e: any) => setDurationValue(e.target.value)
  const handlePaymentTokenChange = (e: any) => setPaymentToken(e.target.value)

  const priceValueError = priceValue.length === 0 || Number.isNaN(priceValue)
  const durationValueError = durationValue.length === 0 || Number.isNaN(durationValue)

  useEffect(() => {
      const durationNumberValue = Number.parseInt(durationValue)

      if (Number.isNaN(durationNumberValue)) {
        return
      }

      convertHourToBlocknum(durationNumberValue).then(
        (newEstimatedSaleEndBlock) => setEstimatedSaleEndBlock(newEstimatedSaleEndBlock)
      ).catch(
        (error) => logError('expected sale end block', 'error', error)
      )
  }, [durationValue])

  const putAssetsOnSaleOnSuccess = () => {
    logSuccess('putAssetsOnSale', 'assets put on sale')
    setModalBody('Selected assets are now on sale')
    setTransactionInProgress(false)
  }

  const putAssetsOnSaleOnFailure = (error: any) => {
    logError('putAssetsOnSale', 'error while putting assets on sale', { error })

    if (error?.receipt?.exceptions?.length > 0) {
      setModalBody(error?.receipt?.exceptions[0])
    } else {
      setModalBody(error)
    }

    setTransactionError(true)
    setTransactionInProgress(false)
  }

  const putAssetsOnSale = async () => {
    setTransactionInProgress(true)
    onOpen()
    setTransactionError(false)

    try {
      const fixedPriceContractApi = new FixedPriceContractApi(
        zilPay,
        fixedPriceContractAddress
      )

      setModalBody("Sign transaction in ZillPay")

      const tx = await fixedPriceContractApi.putAssetsOnSale(
        nftsSelectedForSale,
        new BN(priceValue),
        new BN(estimatedSaleEndBlock),
        paymentToken
      )

      logInfo('putAssetsOnSale', 'transaction submitted', { tx })
      setModalBody(`Transaction id ${tx.ID}`)

      updateTransactionStatus(
        zilPay,
        tx.ID,
        putAssetsOnSaleOnSuccess,
        putAssetsOnSaleOnFailure
      )
    } catch (error) {
      putAssetsOnSaleOnFailure(error)
    }
  }

  return (<>
    <Box mb={5} bg="lightgray" borderRadius='lg' w='100%' p={4} color='black'>
      <Heading as='h6' size='m'>
        SetBatchOrder step
      </Heading>
      <Text>
        After setting fixed price contract as a spender on zrc6 contracts
        you can use SetBatchOrder transition on a fixed price contract to list NFTs for sale.
        All the NFTs in the SetBatchOrder call will have the same sell params.
        You can only set one price for one token per transition call. Meaning, if you want to list using XIDR and XSGD
        then you nee to make two SetBatchOrder transition calls
      </Text>
      <Text mt={3}>
        Fixed price contract address (base16): <Code>{ fixedPriceContractAddress }</Code>
      </Text>
    </Box>

    <Tabs isFitted variant='enclosed'>
      <TabList>
        <Tab>A. Select NFTs to put on sale ({nftsSelectedForSale.length})</Tab>
        <Tab>B. Create sale</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <TableContainer>
            <Table variant='striped'>
              <Thead>
                <Tr>
                  <Th>Select for sale</Th>
                  <Th>Name</Th>
                  <Th>Identifier</Th>
                </Tr>
              </Thead>
              <Tbody>
                { ownedNFTs.map((nft, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Checkbox
                        onChange={() => switchNftSaleSelection(nft)}
                      ></Checkbox>
                    </Td>
                    <Td>{ nft.name }</Td>
                    <Td>{ nft.contractAddress }:{ nft.tokenId }</Td>
                  </Tr>
                ))}
                
                {
                  loadingNfts && <Tr>
                    <Td></Td>
                    <Td>
                      <Center>
                          <Spinner />
                        </Center>
                    </Td>
                    <Td></Td>
                  </Tr>
                }
              </Tbody>
              <Tfoot>
                <Tr>
                  <Th>Select for sale</Th>
                  <Th>Name</Th>
                  <Th>Identifier</Th>
                </Tr>
              </Tfoot>
            </Table>
          </TableContainer>
        </TabPanel>
        <TabPanel>
          <Heading as='h6' size='md' mb={2} color={nftsSelectedForSale.length ? 'black' : 'red'}>
            You selected {nftsSelectedForSale.length} NFT(s) for sale
          </Heading>
          
          <Flex>
            <FormControl isInvalid={priceValueError}>
              <FormLabel>Price</FormLabel>
              <NumberInput>
                <NumberInputField value={priceValue} onChange={handlePriceInputChange} />
              </NumberInput>
              <FormHelperText>
                NFTs sale price in ZILs
              </FormHelperText>
              { priceValueError && <FormErrorMessage>Price is required.</FormErrorMessage> }
            </FormControl>

            <FormControl ml={2}>
              <FormLabel>Payment token</FormLabel>
              <Select onChange={handlePaymentTokenChange} >
                <option value={zillTokenAddress}>ZIL</option>
                <option value={sgdTokenAddress}>XSGD</option>
                <option value={referenceZrc2TokenAddress}>ZRC2</option>
              </Select>
            </FormControl>
          </Flex>

          <Flex mt={3}>
            <FormControl isInvalid={durationValueError}>
              <FormLabel>Duration</FormLabel>
              <NumberInput>
                <NumberInputField value={durationValue} onChange={handleDurationInputChange} />
              </NumberInput>
              <FormHelperText>
                NFTs sale duration in hours
              </FormHelperText>
              { durationValueError && <FormErrorMessage>Duration is required.</FormErrorMessage>}
            </FormControl>

            <FormControl ml={2}>
              <FormLabel>Estimated sale end block</FormLabel>
              <NumberInput>
                <NumberInputField readOnly={true} placeholder={`${estimatedSaleEndBlock}`} />
              </NumberInput>
            </FormControl>      
          </Flex>

          <Flex>
            <Spacer />
            <Button
              variant='outline'
              colorScheme='green'
              aria-label='Put on sale'
              disabled={priceValueError || nftsSelectedForSale.length === 0}
              onClick={putAssetsOnSale}
            >
              Put on Sale <ArrowForwardIcon ml={2} />
            </Button>
          </Flex>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </>)

}

export default PutNftsOnSale