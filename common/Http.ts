export default class Http{
    static reply = function (res:any, data:any) {
		if (data == null) {
			data = {};
		}
		var jsonstr = JSON.stringify(data);
		res.send(jsonstr);
	};
}