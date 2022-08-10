// import TokenMgr from "./common/TokenMgr";
import { time } from "console";
import { appendFile } from "fs";
import { json } from "stream/consumers";
import DB from "./common/DB";
import CardMgr from "./core/card/CardMgr";
import GameMgr from "./core/GameMgr";
import Global from "./core/Global";
import AgentMgr from "./core/network/AgentMgr";
import RankMgr from "./core/rank/RankMgr";

let config = require("./etc/gameconfig");
let moment = require("moment");
Global.serverConfig = config;

function doHttp(){
    let http_service = require('./common/http_service');
    let funlist = require('./core/GameHttp');
    http_service.start({
        ip: config.HTTP.LOCAL,
        port: config.HTTP.PORT,
        funclist: funlist,
    });
    console.log(`HTTP模块启动完毕，开始监听${config.HTTP.LOCAL}:${config.HTTP.PORT}`);
}

function doNet(){
    AgentMgr.shared.start();
}

function main(){
    doHttp();

    //加载配置表
    console.log("正在加载卡牌配置数据")
    DB.getCardConfig((errorcode:any, dbdata:any) => {
        CardMgr.shared.initCards(dbdata);
        GameMgr.shared.init();
        doNet();
    });
    

    RankMgr.shared.readRankInfo();
    
    
}

main();

