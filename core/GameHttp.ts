import Http from "../common/Http";
import Global from "./Global";

function updatecards(req:any, res:any) {
    let cardsstr = req.query.cards;
    let cards = JSON.parse(cardsstr);
    console.log(cardsstr)
    let retdata:any = {
        errorcode: Global.msgCode.FAILED,
    };

    Http.reply(res, retdata);
}

let http_list = {
    ['updatecards']: updatecards,
};

module.exports = http_list;