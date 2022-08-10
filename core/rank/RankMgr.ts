import moment from "moment";

let fs = require("fs")

export default class RankMgr {
    static shared=new RankMgr();

    ranklist:any[] = [];
    lastRankFileInfo:any;
    curRankInfo:any;
    lastRankInfo:any;

    curRankTimeStr:string = "";
    curRankTime:number = 0;
    curRankPlayers:any;

    public readRankInfo(){
        let self = this;
        fs.exists("/rankinfo/rank.txt",function(exists:any){
            if (exists) {
                fs.readFile("./rankinfo/rank.txt",'utf8',function(error2:any,data:any){
                    if (!error2) {
                        self.ranklist = JSON.parse(data);
                        self.ranklist.sort(function(a,b){
                            return b.time - a.time ;
                        })
                        self.lastRankFileInfo = self.ranklist[0];
                        self.readLastRank();
                    }
                })
            }
        })
    }

    public readLastRank(){
        let self = this;
        fs.readFile("./rankinfo/" + this.lastRankFileInfo.filename,'utf8',function(error:any,data:any){
            if (!error) {
                self.lastRankInfo = JSON.parse(data);
            }
        })
    }

    public newRank(){
        this.curRankTime = Date.now();
        this.curRankTimeStr = moment().format('YYYY-MM-DD hh:mm:ss');
    }

    public updateRank(player:any,kitty:number){
        let findPlayer = false;
        for (let index = 0; index < this.curRankPlayers.length; index++) {
            if (this.curRankPlayers[index].uid == player.uid) {
                this.curRankPlayers[index].kitty += kitty;
                findPlayer = true;
                return;
            }
        }
        
        this.curRankPlayers.push({uid:player.uid,kitty:kitty});
    }
    
    public endRank(){
        fs.writeFile("./rankinfo/" + this.curRankTimeStr + ".txt",JSON.stringify(this.curRankPlayers),'utf8',function(error:any,data:any){
            console.log(error)
        })
        this.ranklist.push({
            time:this.curRankTime,
            filename:"./rankinfo/" + this.curRankTimeStr + ".txt"
        })
        this.ranklist.sort(function(a,b){
            return b.time - a.time ;
            
        })
        fs.writeFile("./rankinfo/rank.txt",JSON.stringify(this.ranklist),'utf8',function(error:any,data:any){
            console.log(error)
        })
    }
}