import CardMgr from "../card/CardMgr";
import Player from "../player/Player";
import RankMgr from "../rank/RankMgr";
import FightMgr from "./FightMgr";
let config = require("../../etc/gameconfig");

export default class Fight {

    private playerA:any ;
    private playerB:any ;

    // 1 战斗准备状态
    private fightState:number = 0;
    private fightTime:number = 0;

    public fightID:number = 0;
    AddFightPlayer(pl1:any,pl2:any){
        this.fightState = 1; 
        this.playerA = pl1;
        this.playerB = pl2;
        this.fightTime = 0;
        this.playerA.clearFightCards();
        this.playerB.clearFightCards();
    }

    uniform2NormalDistribution() {
        var sum = 0.0;
        for (var i = 0; i < 12; i++) {
          sum = sum + Math.random();
        }
        return sum - 6;
      }
    
    getNumberInNormalDistribution(mean:any, std_dev:any) {
        return mean + (this.uniform2NormalDistribution() * std_dev);
    }
    

    startFight(){
        this.playerA.updateCardUse();
        let player1Cards = this.playerA.getFightCards();
        let player2Cards = this.playerB.getFightCards();
        this.playerA.addCardsUse(player1Cards);
        this.playerB.addCardsUse(player2Cards);
        let player1CardV = 0;
        let player2CardV = 0;

        let ids1:any = [];
        let ids2:any = [];
        let t1 = 1;
        let t2 = 1;
        
        for (let index = 0; index < 3; index++) {
            ids1.push(CardMgr.shared.GetCardInfo(player1Cards[index]).cardid)
            ids2.push(CardMgr.shared.GetCardInfo(player2Cards[index]).cardid)
        }
        ids1.sort(function(a:any,b:any){
            return a - b ;
        })
        ids2.sort(function(a:any,b:any){
            return a - b ;
        })
        if (ids1[0]%10 == ids1[1]%10 && ids1[1]%10 == ids1[2]%10) {
            t1 = 2
        }
        if (ids1[1]%10 - ids1[0]%10 == 1 && ids1[2]%10 - ids1[1]%10 == 1) {
            t1 = 2
        }
        if (ids1[0]%10 == 0 && ids1[1]%10 == 1 && ids1[2]%10 == 9) {
            t1 = 2
        }
        if (ids1[0]%10 == 0 && ids1[1]%10 == 8 && ids1[2]%10 == 9) {
            t1 = 2
        }

        if (ids2[0]%10 == ids2[1]%10 && ids2[1]%10 == ids2[2]%10) {
            t2 = 2
        }
        if (ids2[1]%10 - ids2[0]%10 == 1 && ids2[2]%10 - ids2[1]%10 == 1) {
            t2 = 2
        }
        if (ids2[0]%10 == 0 && ids2[1]%10 == 1 && ids2[2]%10 == 9) {
            t2 = 2
        }
        if (ids2[0]%10 == 0 && ids2[1]%10 == 8 && ids2[2]%10 == 9) {
            t2 = 2
        }

        for (let index = 0; index < 3; index++) {
            let card = CardMgr.shared.GetCardInfo(player1Cards[index]);
            player1CardV += t1*Math.pow(10000 - card.cardrank,1.02)*this.getCardVitality(this.playerA.getCardsUse(card.cardid))  
                + card.addpoint;
            card = CardMgr.shared.GetCardInfo(player2Cards[index]);
            player2CardV += t2*Math.pow(10000 - card.cardrank,1.02)*this.getCardVitality(this.playerA.getCardsUse(card.cardid))  
                + card.addpoint;
        }

        let g1 = 10000
        if (this.playerA.getKitty() >= 10000 && this.playerA.getKitty() < 30000) {
            g1 = 30000
        }else if (this.playerA.getKitty() >= 30000 && this.playerA.getKitty() < 60000) {
            g1 = 60000
        }else if (this.playerA.getKitty() >= 60000 && this.playerA.getKitty() < 100000) {
            g1 = 100000
        }

        let g2 = 10000
        if (this.playerB.getKitty() >= 10000 && this.playerB.getKitty() < 30000) {
            g2 = 30000
        }else if (this.playerB.getKitty() >= 30000 && this.playerB.getKitty() < 60000) {
            g2 = 60000
        }else if (this.playerB.getKitty() >= 60000 && this.playerB.getKitty() < 100000) {
            g2 = 100000
        }

        let player1K = Math.max(-1*Math.pow(this.playerA.getKitty()/g1,2)+1.7,0.1) 
        let player2K = Math.max(-1*Math.pow(this.playerB.getKitty()/g2,2)+1.7,0.1) 
        // let player2K = -0.5 * (this.playerB.getKitty() / config.WITHDRAWAL) + 1.0

        let player1Point = player1K * player1CardV;
        let player2Point = player2K * player2CardV;
        let winIndex = this.find_winner(player1Point,player2Point);

        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python',["./script.py"]);
        let self = this;

        let data = this.getNumberInNormalDistribution(0.22,0.6);
        // pythonProcess.stdout.on('data', function(res:any){
        //     let data = JSON.parse(res.toString())
            let ratio = self.playerA.fightRatio;
            if (self.playerB.fightRatio < ratio) {
                ratio = self.playerB.fightRatio;
            }
            
            if (winIndex == 1) {
                let p = Math.max(-0.8 * (self.playerA.getKitty()/g1) + 1.0,0.1)
                let add = p * data * 50
                
                self.playerA.addKitty(add + ratio)
                console.log("fightOver1");
                let reInfo = {
                    type:"fightEnd",
                    isWin:1,
                    addKitty:add + ratio,
                    ratio:ratio,
                    cards:player2Cards,
                }
                if (!self.playerA.isRobot()) {
                    self.playerA.getAgent().send(reInfo);
                }
                
                self.playerB.reduceKitty(ratio)
                // self.playerA.addKitty(add)
                reInfo.isWin = 0;
                reInfo.addKitty = -ratio;
                reInfo.cards = player1Cards;
                if (!self.playerB.isRobot()) {
                    self.playerB.getAgent().send(reInfo);
                }

                RankMgr.shared.updateRank(self.playerA,add + ratio);
                RankMgr.shared.updateRank(self.playerB,-ratio);
                // self.playerA.sendFightResult(true,add)
                // self.playerB.sendFightResult(false,0)
            }else{
                let p = Math.max(-0.8 * (self.playerB.getKitty()/g2) + 1.0,0.1)
                let add = p * data * 50
                self.playerB.addKitty(add + ratio)
                let reInfo = {
                    type:"fightEnd",
                    isWin:1,
                    addKitty:add + ratio,
                    ratio:ratio,
                    cards:player1Cards,
                }
                if (!self.playerB.isRobot()) {
                    self.playerB.getAgent().send(reInfo);
                }
                
                self.playerA.reduceKitty(ratio)
                reInfo.isWin = 0;
                reInfo.addKitty = -ratio;
                reInfo.cards = player2Cards;
                if (!self.playerA.isRobot()) {
                    self.playerA.getAgent().send(reInfo);
                }
                RankMgr.shared.updateRank(self.playerB,add + ratio);
                RankMgr.shared.updateRank(self.playerA,-ratio);
            }
            FightMgr.shared.clearFight(self.fightID);
        // })
    }

    find_winner(point1:number,point2:number){
        let deviation = point1 - point2
        let play1_win = 1 / (Math.pow(10.0, -(deviation / 30000)) + 1)
        if (Math.random() <= play1_win) {
            return 1;
        }
        return 2;
    }

    getCardVitality(useTimes:number){
        if (useTimes <= 5) {
            return 1;
        }else if (useTimes <= 10) {
            return 0.96;
        }else if (useTimes <= 15) {
            return 0.9;
        }else{
            return 0.82;
        }
    }

    update(dt:number){
        this.fightTime += dt;
        if (this.fightState == 1 ) {
            if (this.fightTime > 18000) {
                this.startFight();
                this.fightState = 2;
            }
        }
    }
}