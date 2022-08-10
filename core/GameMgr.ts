import FightMgr from "./fight/FightMgr";
import PlayerMgr from "./player/PlayerMgr";


export default class GameMgr {
    static shared=new GameMgr();
    static gTime = 0;
    // 每秒4帧
    static frameTime = 1000 / 4;

    dt:number = 0;

    mainloop(){
        this.dt += GameMgr.frameTime;
        FightMgr.shared.update(GameMgr.frameTime);
        PlayerMgr.shared.update(GameMgr.frameTime);

        GameMgr.gTime += GameMgr.frameTime;

        if (this.dt % (1 * 60 * 1000) == 0) {
            GameMgr.gTime = Date.now();
        }
    }

    init(){
        GameMgr.gTime = Date.now();
        setInterval(this.mainloop,GameMgr.frameTime);
    }
}