import Http from "../../common/Http";
import CardMgr from "../card/CardMgr";
import Global from "../Global";
import Player from "../player/Player";
import RobotPlayer from "../player/RobotPlayer";
import RankMgr from "../rank/RankMgr";
import Fight from "./Fight";

export default class FightMgr {
    static shared=new FightMgr();

    queuePlayers:Player[] = [];
    fights:Fight[] = [];
    passTime:number = 0;
    fightTime:number = 2000; // 2秒
    fightID:number = 1;

    isRank:boolean = false;
    // 5秒匹配机器人

    // 每秒4帧
    update(dt:number){
        this.passTime += dt;
        if (this.passTime >= this.fightTime) {
            this.OrganizFight();
            this.passTime = 0;
        }
        for (let index = 0; index < this.fights.length; index++) {
            this.fights[index].update(dt);
        }
    }

    beginRank(){
        this.isRank = true;
    }

    endRank(){
        this.isRank = false;
        RankMgr.shared.endRank();
    }

    clearFight(fightID:number){
        for (let index = 0; index < this.fights.length; index++) {
            if (fightID == this.fights[index].fightID) {
                this.fights.splice(index,1);
                break;
            }
        }
    }

    AddQueuePlayer(pl:Player){
        pl.fightMatchNum = 0;
        this.queuePlayers.push(pl);
    }

    DelQueuePlayer(pl:Player){
        for (let index = 0; index < this.queuePlayers.length; index++) {
            if (this.queuePlayers[index].getUid() == pl.getUid()) {
                this.queuePlayers.splice(index,1);
                return true;
            }
        }
        return false;
    }

    QueueFight(res:any){
        if (this.queuePlayers.length >= 2) {
            let fight = new Fight();
            this.queuePlayers[0].setHttpRes(res);
            this.queuePlayers[1].setHttpRes(res);
            fight.AddFightPlayer(this.queuePlayers[0],this.queuePlayers[1]);
            fight.startFight();
            this.queuePlayers.splice(0,2);
            return true;
        }
        return false;
    }

    OrganizFight(){
        if (this.queuePlayers.length < 2) {
            this.queuePlayers[0].fightMatchNum += 1;
        }else{
            for (let index = 0; index + 1 < this.queuePlayers.length; index+=2) {
                let fight = new Fight();
                fight.AddFightPlayer(this.queuePlayers[index],this.queuePlayers[index+1]);
                this.fights.push(fight);
                fight.fightID = this.fightID++;
                let reInfo = {
                    type:"beginFight",
                }
                this.queuePlayers[index].getAgent().send(reInfo);
                this.queuePlayers[index+1].getAgent().send(reInfo);
            }
            
            if (this.queuePlayers.length %2 == 0) {
                this.queuePlayers = [];
            }else{
                let lastPlayer = this.queuePlayers[this.queuePlayers.length-1];
                this.queuePlayers = [];
                lastPlayer.fightMatchNum += 1;
                this.queuePlayers.push(lastPlayer);
            }
        }


        if (this.queuePlayers[0].fightMatchNum >= 3) {
            // getRandomRobotCards

            let robotPlayer = new RobotPlayer();
            let cards = CardMgr.shared.getRandomRobotCards(this.queuePlayers[0].getKitty())
            robotPlayer.setFightCards(cards);
            // 匹配机器人
            let fight = new Fight();
            fight.AddFightPlayer(this.queuePlayers[0],robotPlayer);
            this.fights.push(fight);
            fight.fightID = this.fightID++;
            let reInfo = {
                type:"beginFight",
            }
            this.queuePlayers[0].getAgent().send(reInfo);
            // this.queuePlayers[index+1].getAgent().send(reInfo);

        }

        // // 玩家建筑信息
        // let roleBuilds:any = [];
        // let roleBuildInfo = {
        //     buildid:1, // 建筑配置ID
        //     buildgrid:1, // 建筑所在地图格ID
        //     buildx:100.12, // 建筑所在地图格坐标X 保留2位小数
        //     buildy:100.12, // 建筑所在地图格坐标Y
        // }
        // roleBuilds.push(roleBuildInfo);
        // let roleBuildInfo2 = {
        //     buildid:2, // 建筑配置ID
        //     buildgrid:2, // 建筑所在地图格ID
        //     buildx:100.12, // 建筑所在地图格坐标X 保留2位小数
        //     buildy:100.12, // 建筑所在地图格坐标Y
        // }
        // roleBuilds.push(roleBuildInfo);
    }
}