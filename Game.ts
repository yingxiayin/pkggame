let config = require("./etc/gameconfig");

function doHttp(){
    let http_service = require('./common/http_service');
    let funlist = require('./core/GameHttp');
    http_service.start({
        ip: config.HTTP.LOCAL,
        port: config.HTTP.PORT,
        funclist: funlist,
    });
    console.log(`HTTP模块启动完毕，开始监听${config.HTTP.LOCAL}:${config.HTTP.PORT}`);
}


function main(){
    doHttp();
}


main();