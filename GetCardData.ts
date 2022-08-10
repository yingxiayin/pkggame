import {ethers} from "ethers";
import {
    Multicall,
    ContractCallResults,
    ContractCallContext,
} from 'ethereum-multicall';

const PKG_NFT_ADDRESS = '0x1D4994885808E72d3Dc83F5794eae1d9db34892e'

import PkgAbi from './abi/pkg_nft.json'

import Http from "./core/net/Http";


const getCardData = async () => {
    let bscProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/bsc', {name: 'binance', chainId: 56})
    const multicall = new Multicall({ethersProvider: bscProvider, tryAggregate: true});

    let setId = 0
    let tokenIdAndOwner = []
    let allCall = []

    for (let i = 0; i < 6; i++) {
        for (let i = setId + 1; i < setId + 1112; i++) {
            allCall.push({reference: "#" + i, methodName: 'ownerOf', methodParameters: [i]})
        }

        const contractCallContext: ContractCallContext[] = [{
            reference: 'officialContract',
            contractAddress: PKG_NFT_ADDRESS,
            abi: PkgAbi,
            calls: allCall
        }]

        const results: ContractCallResults = await multicall.call(contractCallContext);

        for (let j = 0; j < 1111; j++) {
            let wallet = results.results.officialContract.callsReturnContext[j].returnValues[0]
            let cardId = results.results.officialContract.callsReturnContext[j].reference
            tokenIdAndOwner.push({"cardId": cardId, "wallet": wallet})
        }

        setId += 1111
        allCall = []
    }

    if (tokenIdAndOwner.length == 0) {
        console.log("未取到数据")
    }

    console.log("取到数据成功, 第一项数据是:")
    console.log(tokenIdAndOwner[0])

    // Http.sendget("127.0.0.1","8561","/fight",
    // {
    //      cardlist: JSON.stringify(tokenIdAndOwner),
    // },
    // (ret:any, data:any) => {
    //     console.log('ReGet');
    // })

    Http.sendPost("127.0.0.1","8561","/fight",
    {
        cardlist: JSON.stringify(tokenIdAndOwner),
    },
    (ret:any, data:any) => {
        console.log('ReGet');
    });
};;

getCardData()