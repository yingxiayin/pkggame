import DB from "../../common/DB";
import TokenMgr from "../../common/TokenMgr";
import CardMgr from "../card/CardMgr";
import FightMgr from "../fight/FightMgr";
import Global from "../Global";
import Player from "../player/Player";
import PlayerMgr from "../player/PlayerMgr";
import AgentBase from "./AgentBase";
import AgentMgr from "./AgentMgr";
import { ProtoID } from "./ProtoID";

export default class Agent extends AgentBase 
{
    accountid:number;
    token:string;
    loginstep:number;
    player!:Player;

    constructor(socket:any) {
        super(socket);
        this.accountid = -1; // agent 绑定的玩家id
        this.token = ""; // agent 登录token
        this.loginstep = 0;
    }

    disconnect(data?:any) {
        // this.destroy();
        if (!this.connection) {
            return;
        }
        this.connection = false;
        // let player = PlayerMgr.shared.getPlayer(this.accountid);
        // if (player) {
        //     player.playerOffline();
        // }
    }

    destroy() {
        super.destroy();
        this.disconnect();
        AgentMgr.shared.delAgent(this.id);
    }

    close() {
        super.close();
        this.destroy();
    }
    
    c2s_login(data:any) {
        let account = data.acc;
        if (!account) {
            return;
        }
        let player = PlayerMgr.shared.getPlayerByAcc(account);
        if (player) {
            let retdata:any = {
                type:'login',
                errorcode: Global.msgCode.FAILED,
                uid: 0,
            };
            this.send(retdata);
            return;
        }

        DB.accountLogin({
            account: account,
        }, (errorcode:any, dbdata:any) => {
            let retdata:any = {
                type:'login',
                errorcode: Global.msgCode.FAILED,
                uid: 0,
            };
            if (errorcode == Global.msgCode.SUCCESS) {
                retdata.errorcode = Global.msgCode.SUCCESS;
                retdata.account = dbdata.role_account;
                retdata.uid = dbdata.uid;
                retdata.kitty = dbdata.kitty;
                retdata.lasttime = dbdata.lasttime;
                // let token = TokenMgr.shared.makeSecret(dbdata.uid);
                // retdata.token = token;
                // this.token = token;
            }

            this.player = PlayerMgr.shared.addPlayer(retdata,this);
            this.send(retdata);

            if (errorcode == Global.msgCode.SUCCESS) {
                this.sendCardsConfig();
                this.sendCardsInfo();
                this.sendFirstReward();
                this.sendDailyReward();
            }
            
        });


        return;
    }

    sendCardsConfig(){
        let reInfo = {
            errorcode : Global.msgCode.SUCCESS,
            type : "cardsCfg",
            cardscfg : CardMgr.shared.GetAllCardInfo(),
        }
        this.send(reInfo);
    }

    sendCardsInfo(){
        DB.getCardsInfo(this.player.getUid(), (errorcode:any, dbdata:any) => {
            if (errorcode == Global.msgCode.SUCCESS) {
                let sendInfo = {
                    type : "cardsInfo",
                    errorcode : Global.msgCode.SUCCESS,
                    carduse:dbdata,
                    cardids:CardMgr.shared.GetAccCards(this.player.getaccount()),
                }
                // this.player.setCardsUse(dbdata);
                // dbdata.type = "cardsInfo";
                // dbdata.errorcode = Global.msgCode.SUCCESS;
                
                this.player.setCardsUse(dbdata);

                this.send(sendInfo);
            }
        });
    }

    sendFirstReward(){
        if (CardMgr.shared.roleCards.has(this.player.getaccount())) {
            this.player.addKitty(50);
            this.player.resetDailyRewardTime();
            let retdata:any = {
                type:'firstReward',
                kitty: 500,
            };
            this.send(retdata);
        }
        // this.player.addKitty(50);
    }

    sendDailyReward(){
        if (this.player.isGetDailyReward()){

        }else{
            this.player.addKitty(20);
            this.player.resetDailyRewardTime();
            let retdata:any = {
                type:'dailyReward',
                kitty: 20,
            };
            this.send(retdata);
        }
        
    }
    

    c2s_fight(data:any) {
        FightMgr.shared.AddQueuePlayer(this.player);
    }

    c2s_fightCancel(data:any) {
        let cancelSuc = FightMgr.shared.DelQueuePlayer(this.player);
        let reInfo = {
            type:"stopFight",
            errorcode:Global.msgCode.FAILED,
        }
        if (cancelSuc) {
            reInfo.errorcode = Global.msgCode.SUCCESS;
        }
        this.send(reInfo);
    }

    c2s_fightCards(data:any) {
        this.player.setFightCards(data.cards);

        // let cancelSuc = FightMgr.shared.DelQueuePlayer(this.player);
        // let reInfo = {
        //     type:"stopFight",
        //     errorcode:Global.msgCode.FAILED,
        // }
        // if (cancelSuc) {
        //     reInfo.errorcode = Global.msgCode.SUCCESS;
        // }
        // this.send(reInfo);
    }

    c2s_changZhu(data:any) {
        this.player.setFightZhu(data.index);
    }
    
    c2s_getRoleInfo(data:any) {
        let reinfo = {type:"roleinfo",holdpkg:0,usepkg:0,kitty:0,rankkitty:0,rankindex:0,rankall:0};
        let cardsinfo = this.player.getCardInfo();
        reinfo.holdpkg = cardsinfo.cardids.length;
        let useNum = 0;
        for (let index = 0; index < reinfo.holdpkg; index++) {
            if (cardsinfo.carduse[index] < 20) {
                useNum += 1;
            }
        }
        reinfo.usepkg = useNum;
        reinfo.kitty = this.player.getKitty();
        
        this.send(reinfo);
    }

    kickOutRoom(data:any){
        // // {"type":"out","uid":70,"b_uid":12,"room_id":70,"outType":0,"id":2}
        // if (!data.uid) {
        //     this.send({id:ProtoID.KICKOUT,code:-1,socket_err_msg:"参数错误"});
        //     return;
        // }

        // let pPlayer = PlayerMgr.shared.getPlayerByRoleId(this.accountid);
        // if (!pPlayer) {
        //     this.send({id:ProtoID.KICKOUT,code:-2,socket_err_msg:"玩家账号错误"});
        //     return;
        // }

        // pPlayer.kickOutRoom(data.uid);
    }

    c2s_relogin(data:any) {

    }
}