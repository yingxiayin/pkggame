// import Packet from "./Packet";
let ByteBuffer=require("byte-buffer");

export default class AgentBase{

    id:number;
    connected:boolean;
    socket:any;
    _buffer:any;
    lastPing:number;
    // packet:Packet;
    dt:number;
    msglist:any;

    constructor(socket:any) {
        this.dt = 0;
        this.id = -1;
        this.connected = false;
        this.socket = socket;
        // this._buffer = Buffer.alloc(buffer_max_length); //new Buffer(buffer_max_length);
        // this._buffer = new ByteBuffer(1024*2);
        this.lastPing = 0;
        // this.packet = new Packet();
    }

    set connection(value:boolean) {
        this.connected = value;
    }

    init() {
        let list1 = require('./BaseProto');
        let list2 = require('./GameProto');
        this.msglist = Object.assign(list1.netlist, list2.GameProto);

        this.socket.on('close', () => {
            console.log("AgentBase close")
            this.close();
        });
        this.socket.onopen =  () => {
            console.log("AgentBase onopen")
            this.connection=true;
        };
        this.socket.onerror = () => {
            console.log("AgentBase error")
            this.error();
        };

        this.socket.on('message', (data:any) => {
            let arrbuffer = this.formatBuffer(data);
            let buffer = new ByteBuffer(arrbuffer);
            let msgtype = buffer.readString();
            if(typeof msgtype == 'string'){
                this.onStrMsg(msgtype);
                return;
            }
        });
    }

    close() {
        this.socket = null;
        console.log(`agent[${this.id}] socket, close`);
    }

    error() {
        this.socket = null;
        console.log(`agent[${this.id}] socket, error`);
    }

    onStrMsg(str:string){
        let msgData = JSON.parse(str);
        if (!msgData.type) {
            console.log(`agent[${this.id}] socket, error`,"msgData.type = null");
            return;
        }
        let func = this.msglist[msgData.type];
        // this.msglist
        if (!func) {
            console.log(`agent[${this.id}] socket, error [${msgData.type} not registe]`);
            return;
        }
        func(this, msgData);
    }

    send(event:any, obj:any = null) {
        if (this.socket == null || this.socket.readyState != 1) {
            return;
        }
        // console.log(JSON.stringify(event));
        this.socket.send(JSON.stringify(event));
    }

    formatBuffer(buffer:any) {
        var bufferArray = Object.keys(buffer).map(function (k) {
            return buffer[k];
        })
        return bufferArray
    }

    ping() {
        this.send({id:0});
        this.lastPing = this.dt; //Date.now();
    }

    update(dt:number) {
        this.dt = dt;
        // 超过30秒 没收到 ping 就断开连接
        if (this.lastPing != 0 && this.dt - this.lastPing > 30 * 1000) {
            this.destroy();
        }
    }

    destroy() {
        this.socket = null;
    }

    disconnect(data?:any) {
        this.socket = null;
    }
}