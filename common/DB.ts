import { randomInt } from "crypto";
import moment from "moment";
import mysql, { MysqlError } from "mysql";
import Global from "../core/Global";
import PlayerMgr from "../core/player/PlayerMgr";
import DBForm from "./DBForm";

export default class DB {

    static pool: mysql.Pool;

    static nop(a: any, b: any, c: any, d: any, e: any, f: any, g: any) {
    }

    static query(sql: string, callback: Function) {
        // DB.pool.getConnection((err: MysqlError, conn: mysql.PoolConnection)=>{
        //     if (err) {
        //         callback(err, null, null);
        //     } else {
        //         conn.query(sql, function (qerr:any, vals:any, fields:any) {
        //             //释放连接
        //             conn.release();
        //             //事件驱动回调  
        //             if(callback){
        //                 callback(qerr, vals, fields);
        //             }else{
        //                 console.log("回调不能为空");
        //             }
        //         });
        //     }
        // });
        DBForm.shared.query(sql,callback);
    };

    static accountLogin(logininfo:any, callback:any){

        let account = logininfo.account;
        // let password = logininfo.password;
        // let ip = logininfo.ip == null ? "" : logininfo.ip;
        // let mac = logininfo.mac;

        callback = callback == null ? DB.nop : callback;
        if (account == null) {
            callback(Global.msgCode.FAILED);
            return;
        }

        console.log(account, 'account');
        // console.log(password, 'password');
        var sql = `SELECT * FROM account WHERE role_account = '${account}';`;
        
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                // acc uid kitty lastsign
                let playerdbinfo = rows[0];
                console.log(playerdbinfo);
                callback(Global.msgCode.SUCCESS, playerdbinfo);
            }
            if (rows.length == 0) {
                // 加入测试卡牌数据
                sql = `INSERT INTO account(role_account,kitty) VALUES('${account}','0');`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        throw err;
                    }
                    let playerdbinfo = {
                        role_account:account,
                        uid:rows.insertId,
                        kitty:0,
                    };
                    callback(Global.msgCode.SUCCESS, playerdbinfo);
                    // callback(Global.msgCode.SUCCESS);
                });

                // callback(Global.msgCode.LOGIN_ACCOUNT_PWD_ERROR);
            }
        })
    }

    static getCardConfig(callback:any){
        var sql = `SELECT * FROM card`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                callback(Global.msgCode.SUCCESS, rows);
            }
        })
    }

    static insertTestCards(uid:any,callback:any){
        let cardids:number[] = [1,3,4,5,6,8,9,11,13,14,15,16,18,19,21,22,31,32,33,41]
        let carduse:number[] = []
        for (let index = 0; index < 20; index++) {
            // cardids[index] = Math.ceil(Math.random()*100);
            carduse[index] = Math.ceil(Math.random()*15);
        }
        
        let player = PlayerMgr.shared.getPlayer(uid);
        if (!player) {
            callback(Global.msgCode.FAILED);
            return;
        }
        player.setCardsList(cardids);
        player.setCardsUse(carduse);
        let sql = `INSERT INTO usercards(uid,cardids,carduse,lasttime) VALUES('${uid}','${JSON.stringify(cardids)}','${JSON.stringify(carduse)}',NOW());`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }

            callback(Global.msgCode.SUCCESS, {
                uid:uid,
                cardids:JSON.stringify(cardids),
                carduse:JSON.stringify(carduse),
            });
        });
    }

    static getCardsInfo(uid:any,callback:any){
        var sql = `SELECT * FROM usercards WHERE uid = '${uid}';`;
        DB.query(sql, function (err: any, rows: any, fields: any) {
            if (err) {
                callback(Global.msgCode.FAILED);
                throw err;
            }
            if (rows.length > 0) {
                let nowTime = moment().format('YYYY-MM-DD');
                let sqlTime = moment(rows[0].lasttime).format('YYYY-MM-DD');
                let carduse:any = [];
                // let cardids = JSON.parse(rows[0].cardids) ;
                if (nowTime == sqlTime) {
                    carduse = JSON.parse(rows[0].carduse);
                }else{
                    carduse = [];
                    // for (let index = 0; index < cardids.length; index++) {
                    //     carduse[index] = 0;
                    // }
                }
                // let carduseStr = JSON.stringify(carduse)
                // let reinfo = {
                //     uid:uid,
                //     // cardids:cardids,
                //     carduse:carduse,
                // }

                callback(Global.msgCode.SUCCESS, carduse);

            }else{
                let carduse:any = [];
                let carduseStr = JSON.stringify(carduse);
                sql = `INSERT INTO usercards(uid,carduse,lasttime) VALUES('${uid}','${carduseStr}',NOW());`;
                DB.query(sql, function (err: any, rows: any, fields: any) {
                    if (err) {
                        callback(Global.msgCode.FAILED);
                        throw err;
                    }
                    callback(Global.msgCode.SUCCESS, []);
                });
                // DB.insertTestCards(uid,callback);
            }
        })
    }
}