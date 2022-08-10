
export default class Blockchain {
    static shared = new Blockchain();

    constructor() {

    }

    // 获取用户卡牌数据
    getCardsInfo(userID:number){
        console.log("getCardsInfo:",userID);
    }
}