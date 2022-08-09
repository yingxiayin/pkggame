import Http from "./core/net/Http";


function main(){
    // Http.sendget("127.0.0.1","8561","/fight",
    // {
    //     cardlist:1,
    // },
    // (ret:any, data:any) => {
    //     console.log('ReGet');
    // });

    let send_data = getCardData();

    Http.sendPost("127.0.0.1","8561","/fight",
    send_data,
    (ret:any, data:any) => {
        console.log('ReGet');
    });
}

main();