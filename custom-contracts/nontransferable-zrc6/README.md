# Description

This is a variation of the ZRC6 contract which allows tokens to be non-transferable.

By default, the mutable state `is_transferable` is set to `false`.
* If `false`, only the contract owner can transfer the tokens
* If `true`, the token owner/spender/operator can perform the transfer

The transition `SetTransferable` allows the contract owner to modify the `is_transferable` state

*This ZRC6 contract is based from the ZRC6 contract that the Rialto marketplace uses.*




