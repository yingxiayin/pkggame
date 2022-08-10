import Agent from "./Agent";

export let GameProto = {
    ['login']: (agent:Agent,data:any) => {
        agent.c2s_login && agent.c2s_login(data);
    },
    ['fight']: (agent:Agent,data:any) => {
        agent.c2s_fight && agent.c2s_fight(data);
    },
    ['stopfight']: (agent:Agent,data:any) => {
        agent.c2s_fightCancel && agent.c2s_fightCancel(data);
    },
    ['fightcards']: (agent:Agent,data:any) => {
        agent.c2s_fightCards && agent.c2s_fightCards(data);
    },
    ['changeZhu']: (agent:Agent,data:any) => {
        agent.c2s_changZhu && agent.c2s_changZhu(data);
    },
    ['roleinfo']: (agent:Agent,data:any) => {
        agent.c2s_getRoleInfo && agent.c2s_getRoleInfo(data);
    },
    ['kickout']: (agent:Agent,data:any) => {
        agent.kickOutRoom && agent.kickOutRoom(data);
    },
    // ['leave']: (agent:Agent,data:any) => {
    //     agent.kickOutRoom && agent.kickOutRoom(data);
    // },
    
    // ['c2s_relogin']: (agent:Agent,data:any) => {
    //     agent.c2s_relogin && agent.c2s_relogin(data);
    // },
};
