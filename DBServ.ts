
import mysql from "mysql";
import Global from "./core/Global";
let config = require("./etc/gameconfig");

let pool:any= null;

function query(sql:any, callback:any) {
	console.log("SQL:",sql);
	pool.getConnection(function (err:any, conn:any) {
		if (err) {
			callback(err, null, null);
		} else {
			console.log(sql);
			conn.query(sql, function (qerr:any, vals:any, fields:any) {
				//释放连接  
				// pool.releaseConnection(conn)
				conn.release();
				//事件驱动回调  
				callback(qerr, vals, fields);
			});
		}
	});
};

function init() {
	pool = mysql.createPool({
		host: config.DB.HOST,
		user: config.DB.USER,
		password: config.DB.PWD,
		database: config.DB.DB,
		port: config.DB.PORT,
		timeout: 60 * 60 * 1000,
		multipleStatements: true,
	});
};

init();
console.log('数据库初始化完毕');

class agent {
	socket: any;
	name: string;
	id: number;
	constructor(socket:any) {
		this.socket = socket;
		this.name = '';
		this.id = 0;
	}
	send(event:any, data:any) {
		this.socket.emit(event, data);
	}
}

let agent_seed_id = 0;
let socket_pool:any = {};
let io = require('socket.io')(config.DBPORT, {
	"transports": ['websocket', 'polling']
});


function fsql(agent:any, data:any) {
	let sql_id = data.id;
	query(data.sql, (err:any, rows:any, fields:any) => {
		if (err) {
			agent.send('sqled', {
				errorcode: Global.msgCode.FAILED,
			});
			throw (err);
		}
		agent.send('sqled', {
			errorcode: Global.msgCode.SUCCESS,
			id: sql_id,
			data: rows,
		});
	});
}

function freg(agent:any, data:any) {
	agent.name = data.name;
	console.log(`[${agent.name}]完成注册`);
}

function fclose(agent:any) {
	delete socket_pool[agent.id];
}

io.sockets.on('connection', (socket:any) => {
	let sAgent = new agent(socket);
	sAgent.id = agent_seed_id;

	let list = require('./common/default_slist');
	for (let event in list) {
		if (list.hasOwnProperty(event)) {
			let func = list[event];
			sAgent.socket.on(event, (data:any) => {
				if (event != "ping" && event != "pong") console.log("<receive data>", event, data);
				func(sAgent, data);
			});
		}
	}
	socket.on('sql', (data:any) => {
		fsql(sAgent, data);
	});
	socket.on('reg', (data:any) => {
		freg(sAgent, data);
	});
	socket.on('close', (data:any) => {
		fclose(sAgent);
	});
	socket.on('disconnect',(data:any) => {
		fclose(sAgent);
	});
	socket_pool[agent_seed_id] = sAgent;
});

console.log("数据库模块启动完毕，正在监听本地:8807");