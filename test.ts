import Http from "./core/network/Http";

function main(){
    // Http.sendget("127.0.0.1","8561","/fight",
    // {
    //     cardlist:1,
    // },
    // (ret:any, data:any) => {
    //     console.log('ReGet');
    // });


    let send_data = {
        cards:[1,2,3,4,5],
    };

    Http.sendPost("127.0.0.1","8561","/fight",
    send_data,
    (ret:any, data:any) => {
        console.log('ReGet');
    });
}

main();