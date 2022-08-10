import DB from "../common/DB";
import Http from "../common/Http";
import TokenMgr from "../common/TokenMgr";
import FightMgr from "./fight/FightMgr";
import Global from "./Global";
import PlayerMgr from "./player/PlayerMgr";
import qs from "qs";


// 通过连接 获取客户端ip
function getClientIP(req:any) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    ip = ip.replace(/::ffff:/, '');
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0];
    }
    return ip;
}

function login(req:any, res:any) {
    let account = req.query.acc;
    // let ip = getClientIP(req);
    DB.accountLogin({
        account: account,
    }, (errorcode:any, dbdata:any) => {
        let retdata:any = {
            errorcode: Global.msgCode.FAILED,
            uid: 0,
        };
        if (errorcode == Global.msgCode.SUCCESS) {
            console.log(dbdata);
            retdata.account = dbdata.role_account;
            retdata.uid = dbdata.uid;
            let token = TokenMgr.shared.makeSecret(dbdata.uid);
            retdata.token = token;
        }
        Http.reply(res, retdata);
    });
}

function getCardsData(req:any, res:any) {
    // 
    let token = req.query.token;
    let uid = req.query.uid;
    let savetoken = TokenMgr.shared.getSecretByAccountId(uid);

    let retdata:any = {
        errorcode: Global.msgCode.FAILED,
        uid: 0,
    };
    if (token != savetoken) {
        Http.reply(res, retdata);
    }

    let player = PlayerMgr.shared.getPlayer(uid);
    if (player) {
        retdata.uid = player.getUid();
        retdata.info = player.getCardInfo();
        Http.reply(res, retdata);
    }else{
        DB.getCardsInfo(uid, (errorcode:any, dbdata:any) => {
            if (errorcode == Global.msgCode.SUCCESS) {
                retdata.uid = uid;
                retdata.info = dbdata;
            }
            Http.reply(res, retdata);
        });
    }
}

function setfightcards(req:any, res:any) {
    
}

function fight(req:any, res:any) {
    // let token = req.query.token;
    // let uid = req.query.uid;
    // let cards = req.query.cards;
    // let savetoken = TokenMgr.shared.getSecretByAccountId(uid);

    console.log("fight")
    let obj = "";
    req.on("data",function(data1:any){
        console.log("data")
        // console.log(data1)

        obj += data1;
    })
    req.on("end",function(){
        console.log("end")
        console.log(obj)

        let retdata:any = {
            errorcode: Global.msgCode.SUCCESS,
        };
        Http.reply(res, retdata);
        
		// let contents = qs.parse(obj);
        // console.log(contents)
    })


    // let cardsstr = req.query.cards;
    // console.log(cardsstr)
    // let cards = JSON.parse(cardsstr);
    // console.log(cards)
    // let retdata:any = {
    //     errorcode: Global.msgCode.SUCCESS,
    // };
    // Http.reply(res, retdata);

    // let retdata:any = {
    //     errorcode: Global.msgCode.SUCCESS,
    //     uid: 0,
    // };
    // console.log("reFight");
    // // if (token != savetoken) {
    //     Http.reply(res, retdata);
    // }

    // let player = PlayerMgr.shared.getPlayer(uid);
    // FightMgr.shared.AddQueuePlayer(player,res);
}

function beginfight(req:any, res:any) {
    
}

function cancelfight(req:any, res:any) {
    let token = req.query.token;
    let uid = req.query.uid;
    let savetoken = TokenMgr.shared.getSecretByAccountId(uid);

    let retdata:any = {
        errorcode: Global.msgCode.FAILED,
        uid: 0,
    };

    if (token != savetoken) {
        Http.reply(res, retdata);
    }

    let player = PlayerMgr.shared.getPlayer(uid);
    FightMgr.shared.DelQueuePlayer(player);
    retdata.errorcode = Global.msgCode.SUCCESS;
    retdata.uid = uid;
    Http.reply(res, retdata);
}

let http_list = {
    ['login']: login,
    ['getCardsData']: getCardsData,
    ['fight']: fight,
    ['setfightcards']: setfightcards,
    ['beginfight']: beginfight,
    ['cancelfight']: cancelfight,
};

module.exports = http_list;