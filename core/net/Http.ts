import qs from "qs";
// import https from "https";
import http from "http";

export default class Http{
	
	static sendget(host:any, port:any, path:any, data:any, callback:any, safe?:any){
		if (host == null){
			console.log('[HTTP] ERROR: host is null');
			return;
		}
		var content = qs.stringify(data);
		var options:any = {
			hostname: host,
			path: path + '?' + content,
			method: 'GET'
		};

		if (port) {
			options.port = port;
		}

		let proto:any = http;

		let req = proto.request(options, function (res:any) {
			res.setEncoding('utf8');
			res.on('data', function (chunk:any) {
				try {
					let json = JSON.parse(chunk);
					callback(true, json);
				} catch (error) {
					callback(false, chunk);
				}
			});
		});
		req.setTimeout(5000);
		req.on('error', function (e:any) {
			console.log('problem with request: ' + e.message);
			callback(false, e);
		});
		req.end();
	};

	static sendPost = function (host:any, port:any, path:any, data:any, callback:any) {
		// let contents = qs.stringify(data);
		let options:any = {
			host: host,
			port: port,
			path: path,
			method:'POST',
			headers:{
				'Content-Type':'application/json',
				'Content-Length': Buffer.byteLength(data)
			}
		};
	
		let req = http.request(options, function(res:any){
			// console.log('STATUS:'+res.statusCode);
			// console.log('HEADERS:'+JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data',function(data:any){
				// console.log("data:",data);   //一段html代码
				
			});
			res.on('end', () => {
				console.log('No more data in response.');
				callback(data);
			});
		});
		req.write(data);
		req.end();
	};
	static reply = function (res:any, data:any) {
		if (data == null) {
			data = {};
		}
		var jsonstr = JSON.stringify(data);
		res.send(jsonstr);
	};
}

