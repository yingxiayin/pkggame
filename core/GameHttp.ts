import Http from "../common/Http";
import Global from "./Global";
import qs from "qs";


function updatecards(req:any, res:any) {
    // let cardsstr = req.query.cards;
    // let cards = JSON.parse(cardsstr);
    // console.log(cardsstr)
    // let retdata:any = {
    //     errorcode: Global.msgCode.SUCCESS,
    // };

    // Http.reply(res, retdata);

    let obj = "";
    req.on("data",function(data1:any){
        obj += data1;
    })
    req.on("end",function(){
		let contents = qs.parse(obj);
        console.log(contents)
    })
    let retdata:any = {
        errorcode: Global.msgCode.SUCCESS,
    };
    Http.reply(res, retdata);
}

let http_list = {
    ['updatecards']: updatecards,
};

module.exports = http_list;