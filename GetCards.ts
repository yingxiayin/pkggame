import {ethers} from "ethers";
import {
    Multicall,
    ContractCallResults,
    ContractCallContext,
} from 'ethereum-multicall';
export const PKG_NFT_ADDRESS = '0x1D4994885808E72d3Dc83F5794eae1d9db34892e'

import PkgAbi from './abi/pkg_nft.json'

export default class Blockchain {
    static shared = new Blockchain();

    constructor() {}

    // 获取用户卡牌数据
    async getCardsInfo() {
        let bscProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/bsc', { name: 'binance', chainId: 56 })
        const multicall = new Multicall({ ethersProvider: bscProvider, tryAggregate: true });

        let setId = 0
        let tokenIdAndOwner = []
        let allCall = []

        let start = new Date().getTime()

        for (let i = 0; i < 3; i++) {
            for (let i = setId+1; i < setId+2223; i++) {
                allCall.push( { reference: "#" + i, methodName: 'ownerOf', methodParameters: [ i ] })
            }

            const contractCallContext: ContractCallContext[] = [{
                reference: 'officialContract',
                contractAddress: PKG_NFT_ADDRESS,
                abi: PkgAbi,
                calls: allCall
            }]

            const results: ContractCallResults = await multicall.call(contractCallContext);

            for (let j = 0; j < 2222; j++) {
                let wallet = results.results.officialContract.callsReturnContext[j].returnValues[0]
                let id = results.results.officialContract.callsReturnContext[j].reference
                tokenIdAndOwner.push({id, wallet})
            }

            setId+=2222
            allCall = []
        }

        let end = new Date().getTime()
        console.log('cost is', `${end - start}ms`)

        if (tokenIdAndOwner.length == 0) {
            return
        }

        console.log(tokenIdAndOwner)
    }
}