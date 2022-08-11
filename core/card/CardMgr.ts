export default class CardMgr {
    static shared=new CardMgr();

    // cardid cardrank addpoint addcoef  level group
    //       排行 加成分 加成系统  机器人用等级卡组
    cardInfos:any;
    robots:any[] = [];

    roleCards = new Map();
    // let m = new Map();
    
    // m.set('name1', [10]);
    // m.set('name2', [20]);
    // m.set('name3', [20,21,22]);

    // console.log(m)
    // console.log(m.get('name3'))
    // console.log(m.has('name3'))
    // console.log(m.has('name6'))

    initCards(cardArr:any){
        this.cardInfos = new Array();
        this.robots = [];
        for (let index = 0; index < cardArr.length; index++) {
            let cardinfo = {
                cardid:parseInt(cardArr[index].ID),
                cardrank:parseInt(cardArr[index].RANK),
                addpoint:parseInt(cardArr[index].addpoint),
                addcoef:parseInt(cardArr[index].addcoef),
                colorlevel:parseInt(cardArr[index].level),
                level:cardArr[index].botstrength,
                botstrength:parseInt(cardArr[index].group),
            }
            if (cardinfo.level == "S") {
                cardinfo.level = 1
            }else if (cardinfo.level == "A") {
                cardinfo.level = 2
            }else if (cardinfo.level == "B") {
                cardinfo.level = 3
            }else if (cardinfo.level == "C") {
                cardinfo.level = 4
            }

            this.cardInfos[cardinfo.cardid] = cardinfo
            if (!this.robots[cardinfo.level]) {
                this.robots[cardinfo.level] = [];
            }
            if(!this.robots[cardinfo.level][cardinfo.botstrength]){
                this.robots[cardinfo.level][cardinfo.botstrength] = [];
            }
            this.robots[cardinfo.level][cardinfo.botstrength].push(cardinfo.cardid);
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

    GetAccCards(acc:string) {
        let has = this.roleCards.has(acc);
        if (!has) {
            return [];
        }else{
            return this.roleCards.get(acc);
        }
    }

    setCardsAffiliation (cardlist:any) {
        this.roleCards = new Map();
        for (let index = 0; index < cardlist.length; index++) {
            let cardid = parseInt(cardlist[index].cardId.substring(1));
            if (cardlist[index].wallet) {
                let cardacc = cardlist[index].wallet;
                let accCards = this.roleCards.get(cardacc);
                if (accCards) {
                    accCards.push(cardid);
                }else{
                    this.roleCards.set(cardacc,[cardid])
                }
            }
        }
    }
}