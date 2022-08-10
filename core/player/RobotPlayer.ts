import moment from "moment";
import Http from "../../common/Http";
import FightMgr from "../fight/FightMgr";
import GameMgr from "../GameMgr";
import Global from "../Global";
import AgentBase from "../network/AgentBase";
import Player from "./Player";

export default class RobotPlayer {

    
    // private cardlist:number[] = new Array();
    // private carduse:number[] = new Array();
    protected fightcardlist:number[] = new Array();
    // private cardUseTime:string = "";

    // 用户已经获得的kitty
    protected kitty:number = 0;
    
    public fightRatio:number = 0;
    public fightMatchNum:number = 0;
    

    isRobot(){
        return true;
    }

    getKitty(){
        return 1000;
    }

    addKitty(num:number){
        this.kitty += num;
    }

    reduceKitty(num:number){
        this.kitty -= num;
    }

    addCardsUse(cardids:number[]){

    }

    getFightCards(){
        // if (this.fightcardlist.length == 0) {
        //     this.fightcardlist.push(this.cardlist[0]);
        //     this.fightcardlist.push(this.cardlist[1]);
        //     this.fightcardlist.push(this.cardlist[2]);
        // }
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
        // if(index == 1){
        //     // this.fightRatio = 10;
        // }else if (index == 2) {
        //     ratio = 50;
        // }else if (index == 3) {
        //     ratio = 100;
        // }
        // if (this.kitty < ratio) {
        //     return;
        // }
        this.fightRatio = ratio;
    }
    
    updateCardUse(){

    }


    getCardsUse(cardid:number){
        // for (let index = 0; index < this.cardlist.length; index++) {
        //     if (this.cardlist[index] == cardid) {
        //         return this.carduse[index];
        //     }
        // }
        return 0;
    }

}