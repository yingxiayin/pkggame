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

    startFight(){
        this.playerA.updateCardUse();
        let player1Cards = this.playerA.getFightCards();
        let player2Cards = this.playerB.getFightCards();
        this.playerA.addCardsUse(player1Cards);
        this.playerB.addCardsUse(player2Cards);
        let player1CardV = 0;
        let player2CardV = 0;
        for (let index = 0; index < 3; index++) {
            let card = CardMgr.shared.GetCardInfo(player1Cards[index]);
            player1CardV += card.addpoint*(10000 - card.cardrank)*this.getCardVitality(this.playerA.getCardsUse(card.cardid))  
                + card.addpoint;
            card = CardMgr.shared.GetCardInfo(player2Cards[index]);
            player2CardV += card.addpoint*(10000 - card.cardrank)*this.getCardVitality(this.playerA.getCardsUse(card.cardid))  
                + card.addpoint;
        }

        let player1K = -0.5 * (this.playerA.getKitty() / config.WITHDRAWAL) + 1.0
        let player2K = -0.5 * (this.playerB.getKitty() / config.WITHDRAWAL) + 1.0

        let player1Point = player1K * player1CardV;
        let player2Point = player2K * player2CardV;
        let winIndex = this.find_winner(player1Point,player2Point);

        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python',["./script.py"]);
        let self = this;
        pythonProcess.stdout.on('data', function(res:any){
            let data = JSON.parse(res.toString())
            let ratio = self.playerA.fightRatio;
            if (self.playerB.fightRatio < ratio) {
                ratio = self.playerB.fightRatio;
            }
            
            if (winIndex == 1) {
                let p = -0.8 * (self.playerA.getKitty()/config.WITHDRAWAL) + 1.0
                let add = p * data * 100
                
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
                let p = -0.8 * (self.playerB.getKitty()/config.WITHDRAWAL) + 1.0
                let add = p * data * 100
                self.playerB.addKitty(add + ratio)
                console.log("fightOver2");
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
        })
    }

    find_winner(point1:number,point2:number){
        let deviation = point1 - point2
        let play1_win = 1 / (Math.pow(10.0, -(deviation / 1000)) + 1)
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