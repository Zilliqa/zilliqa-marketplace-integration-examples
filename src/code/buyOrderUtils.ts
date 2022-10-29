import { bytes } from '@zilliqa-js/util';
import { ec } from 'elliptic';
import { SHA256, enc } from 'crypto-js';

function Trim(s: string) 
{
    return s.startsWith('0x') ? s.substring(2) : s;
}

function ToHexArray(num: string, size: number)
{
    return bytes.intToHexArray(parseInt(num), size);
}

export function CreateMessage(
  tokenAddr: string,
  tokenId: string,
  dest: string,
  side: string,
  price: string,
  payment_token_addr: string,
  bnum: string
) {
    const msg = [Trim(tokenAddr)]                      
            .concat(ToHexArray(tokenId, 64))    // 256 bits->32 bytes->64 chars as hex
            .concat([Trim(dest)])                
            .concat(ToHexArray(side, 8))        // 32 bits->4 bytes->8 chars as hex
            .concat(ToHexArray(price, 32))      // 128 bits->16 bytes->32 chars as hex
            .concat([Trim(payment_token_addr)])  
            .concat(ToHexArray(bnum, 32))       // 128 bits->16 bytes->32 chars as hex
            .join('');

    return `0x${msg}`
}

export async function SignMessage(privkey: string, msg: string)
{
    const ecInstance = new ec('secp256k1');
    const keyPair = ecInstance.keyFromPrivate(Trim(privkey));

    //create a digest from the message
    const digest = SHA256(enc.Hex.parse(Trim(msg)))

    //signature must be in canonical form
    const sigder = keyPair.sign(digest.toString(), 'hex', {canonical: true})

    // Verify signature
    // console.log(keyPair.verify(digest.toString(), signature));

    //flatten the signature
    const sigrs = Buffer.concat([
        sigder.r.toArrayLike(Buffer, 'be', 32),
        sigder.s.toArrayLike(Buffer, 'be', 32),
    ]);

    const signature = "0x" + sigrs.toString('hex')

    return signature
}