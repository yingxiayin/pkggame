import AgentBase from "../network/AgentBase";
import Player from "./Player";

export default class PlayerMgr {
    static shared=new PlayerMgr();

    // cardInfos:any;
    player_list:Player[] = new Array();

    getPlayer(uid:number){
        return this.player_list[uid];
    }

    update(dt:number){
        // for (let index = 0; index < this.player_list.length; index++) {
        //     this.player_list[index].update(dt);
        // }
    }

    addPlayer(playerInfo:any,agent:AgentBase){
        let player = new Player();
        player.setInfo(playerInfo);
        player.setAgent(agent);
        this.player_list[playerInfo.uid] = player;
        return player;
    }
    
}