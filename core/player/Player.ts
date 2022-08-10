import moment from "moment";
import Http from "../../common/Http";
import FightMgr from "../fight/FightMgr";
import GameMgr from "../GameMgr";
import Global from "../Global";
import AgentBase from "../network/AgentBase";

export default class Player {

    private uid:number = 0;
    private token:string = "";
    private account:number = 0;
    private agent!:AgentBase;
    
    
    private cardlist:number[] = new Array();
    private carduse:number[] = new Array();
    protected fightcardlist:number[] = new Array();
    private cardUseTime:string = "";

    private httpRes:any;
    private httpResTime:number = 0;
    private heartbeatTime:number = 0;

    // 用户已经获得的kitty
    protected kitty:number = 0;
    
    private dailyRewardTime:string = "";

    // 1 ： 匹配战斗中httpResTime开始匹配时间 2 :战斗中
    private playerState:number = 0;

    public fightRatio:number = 0;
    public fightMatchNum:number = 0;

    constructor() {
        
    }

    setInfo(info:any){
        this.uid = info.uid;
        this.token = info.token;
        this.account = info.account;
        this.kitty = info.kitty;
        this.dailyRewardTime = "";
        if (info.lasttime && info.lasttime != "") {
            this.dailyRewardTime = moment(info.lasttime).format('YYYY-MM-DD');
        }
    }

    isGetDailyReward(){
        let timeStr = moment().format('YYYY-MM-DD');
        if (timeStr == this.dailyRewardTime) {
            return true;
        }
        return false;
    }

    resetDailyRewardTime(){
        this.dailyRewardTime = moment().format('YYYY-MM-DD');
    }

    setAgent(agent:AgentBase){
        this.agent = agent;
    }
    
    public getAgent(){
        return this.agent;
    }

    getUid(){
        return this.uid;
    }

    getKitty(){
        return this.kitty;
    }

    addKitty(num:number){
        this.kitty += num;
    }

    reduceKitty(num:number){
        this.kitty -= num;
    }

    getFightCards(){
        if (this.fightcardlist.length == 0) {
            this.fightcardlist.push(this.cardlist[0]);
            this.fightcardlist.push(this.cardlist[1]);
            this.fightcardlist.push(this.cardlist[2]);
        }
        return this.fightcardlist;
    }

    clearFightCards(){
        this.fightcardlist = [];
    }

    setFightCards(cards:any){
        this.fightcardlist = cards;
    }

    setFightZhu(index:number){
        let ratio = 10;
        if(index == 1){
            // this.fightRatio = 10;
        }else if (index == 2) {
            ratio = 50;
        }else if (index == 3) {
            ratio = 100;
        }
        if (this.kitty < ratio) {
            return;
        }
        this.fightRatio = ratio;
    }
    
    update(dt:number){
        if (this.playerState == 1) {
            if (GameMgr.gTime - this.heartbeatTime >= 3) {
                this.playerState = 0;
                FightMgr.shared.DelQueuePlayer(this);
            }
        }
    }

    delQueue(){
        this.playerState = 0;
    }

    heartbeat(){
        this.playerState = 1;
        this.heartbeatTime = GameMgr.gTime;
    }

    // setHttpRes(res:any,resTime:number = 0){
    //     this.playerState = 1;
    //     this.heartbeatTime = GameMgr.gTime;
    //     // if (resTime != 0) {
    //     //     this.httpResTime = resTime;
    //     // }
    //     this.httpRes = res;
    // }
    setHttpRes(res:any){
        this.playerState = 2;
        this.heartbeatTime = GameMgr.gTime;
        // if (resTime != 0) {
        //     this.httpResTime = resTime;
        // }
        this.httpRes = res;
    }

    sendFightResult(iswin:boolean,kitty:number){
        Http.reply(this.httpRes, {
            errorcode:Global.msgCode.SUCCESS,
            uid:this.uid,
            iswin:iswin,
            kitty:kitty,
        });
    }

    // let reinfo = {
    //     uid:uid,
    //     cardids:JSON.stringify(rows[0].cardids),
    //     carduse:carduse,
    // }
    clearCardUse(){
        for (let index = 0; index < this.cardlist.length; index++) {
            this.carduse[index] = 0;
        }
    }

    getCardInfo(){
        let nowTime = moment(GameMgr.gTime).format('YYYY-MM-DD');
        if (nowTime != this.cardUseTime) {
            this.cardUseTime = nowTime;
            this.clearCardUse();
        }
        
        let reinfo = {
            uid:this.uid,
            cardids:this.cardlist,
            carduse:this.carduse,
        }
        return reinfo;
    }

    setCardsList(cardids:number[]){
        this.cardlist = cardids;
    }

    updateCardUse(){
        let nowTime = moment(GameMgr.gTime).format('YYYY-MM-DD');
        if (nowTime != this.cardUseTime) {
            this.cardUseTime = nowTime;
            this.clearCardUse();
        }
    }

    setCardsUse(carduse:number[]){
        this.carduse = carduse;
        this.cardUseTime = moment(Date.now()).format('YYYY-MM-DD');
    }

    getCardsUse(cardid:number){
        for (let index = 0; index < this.cardlist.length; index++) {
            if (this.cardlist[index] == cardid) {
                return this.carduse[index];
            }
        }
        return 0;
    }

    addCardsUse(cardids:number[]){
        for (let index = 0; index < cardids.length; index++) {
            
            for (let index2 = 0; index2 < this.cardlist.length; index++) {
                if (this.cardlist[index2] == cardids[index]) {
                    this.carduse[index2] += 1;
                }
            }
        }
    }
    
    isRobot(){
        return false;
    }
}