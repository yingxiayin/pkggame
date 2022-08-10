export default class CardMgr {
    static shared=new CardMgr();

    // cardid cardrank addpoint addcoef  level group
    //       排行 加成分 加成系统  机器人用等级卡组
    cardInfos:any;
    robots:any[] = [];

    initCards(cardArr:any){
        this.cardInfos = new Array();
        this.robots = [];
        for (let index = 0; index < cardArr.length; index++) {
            this.cardInfos[cardArr[index].cardid] = cardArr[index]
            if (!this.robots[cardArr[index].level]) {
                this.robots[cardArr[index].level] = [];
            }
            if(!this.robots[cardArr[index].level][cardArr[index].botstrength]){
                this.robots[cardArr[index].level][cardArr[index].botstrength] = [];
            }
            this.robots[cardArr[index].level][cardArr[index].botstrength].push(cardArr[index].cardid);
        }
    }

    // 获取随机卡组  s a b c 1 2 3 4
//     •玩家的钱包内$KITTY⾦额<4000，匹配C-BOT 
// •玩家的钱包内$KITTY⾦额>=4000，<7000，匹配B-BOT 
// •玩家的钱包内$KITTY⾦额>=7000，<9000，匹配A-BOT 
// •玩家的钱包内$KITTY⾦额>=9000，<10000，匹配S-BOT
// ◦ 以上均为概率匹配
// ▪ 有70%的概率匹配到对应BOT
// ▪ 有20%的概率匹配到其他BOT
// ▪ 有10%的概率匹配失败 
// •玩家的钱包内$KITTY⾦额>=10000时，匹配S-BOT •玩家使⽤claim过⾦额的卡牌时，匹配S-BOT •玩家持有卡牌数>9时，匹配S-BOT
// ◦ 以上均为概率匹配
// ▪ 有40%的概率匹配到对应BOT
// ▪ 有40%的概率匹配到其他BOT
// ▪ 有20%的概率匹配失败
    getRandomRobotCards(playerKitty:number){
        let r = Math.random();
        let rt = 0;
        if (r < 0.7) {
            rt = 1;
        }else if (r < 0.9) {
            rt = 2;
        }else{
            return null;
        }

        let sindex = Math.ceil(Math.random()*this.robots[1].length);
        if (sindex == 0) {
            sindex = 1
        }
        let sbot = this.robots[1][sindex];

        let aindex = Math.ceil(Math.random()*this.robots[2].length);
        if (aindex == 0) {
            aindex = 1
        }
        let abot = this.robots[2][aindex];

        let bindex = Math.ceil(Math.random()*this.robots[3].length);
        if (bindex == 0) {
            bindex = 1
        }
        let bbot = this.robots[3][bindex];

        let cindex = Math.ceil(Math.random()*this.robots[4].length);
        if (cindex == 0) {
            cindex = 1
        }
        let cbot = this.robots[4][cindex];

        if (playerKitty < 4000) {
            if (rt == 1) {
                return cbot;
            }
            r = Math.floor(Math.random()*3)
            if (r == 0) {
                return abot;
            }else if (r == 1) {
                return bbot;
            }else{
                return sbot;
            }
        }else if (playerKitty < 7000) {
            if (rt == 1) {
                return bbot;
            }
            r = Math.floor(Math.random()*3)
            if (r == 0) {
                return abot;
            }else if (r == 1) {
                return cbot;
            }else{
                return sbot;
            }
        }else if (playerKitty < 9000) {
            if (rt == 1) {
                return abot;
            }
            r = Math.floor(Math.random()*3)
            if (r == 0) {
                return bbot;
            }else if (r == 1) {
                return cbot;
            }else{
                return sbot;
            }
        }else{
            if (rt == 1) {
                return sbot;
            }
            r = Math.floor(Math.random()*3)
            if (r == 0) {
                return abot;
            }else if (r == 1) {
                return bbot;
            }else{
                return cbot;
            }
        }
    }


    GetCardInfo(cardid:number) {
        if (this.cardInfos.hasOwnProperty(cardid) == false)
            return null;
        return this.cardInfos[cardid];
    }

    GetAllCardInfo() {
        return this.cardInfos;
    }
}