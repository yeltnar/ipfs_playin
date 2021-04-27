// curl -X POST http://localhost:5001/api/v0/cid {"Strings": ["12D3KooWB7Fb7GghxWizb9XN5afCs9QTXzDFDt1fmqFwnGwRG3ER"]}
// curl -X POST "http://127.0.0.1:5001/api/v0/config?arg=Experimental.Libp2pStreamMounting&arg=true&json=true"

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const config = require('config');

(async()=>{

    
    const outmultiaddr = (()=>{
        const outgoing_port = `22`;
        const outgoing_protocol = `tcp`;
        const outgoing_ip_address = `192.168.1.100`;
        const ipversion = `ip4`;

        const outmultiaddr = `/${ipversion}/${outgoing_ip_address}/${outgoing_protocol}/${outgoing_port}`;
        return outmultiaddr
    })();

    
    const inmultiaddr = (()=>{        
        const outgoing_port = `22`;
        const outgoing_protocol = `tcp`;
        const outgoing_ip_address = `0.0.0.0`;
        const ipversion = `ip4`;
        
        const inmultiaddr = `/${ipversion}/${outgoing_ip_address}/${outgoing_protocol}/${outgoing_port}`;
        return inmultiaddr
    })();

    
    const p2pmultiaddr = (()=>{        
        // const outgoing_port = `22`;
        // const outgoing_protocol = `tcp`;
        // const outgoing_ip_address = `0.0.0.0`;
        // const ipversion = `ip4`;
        
        // const inmultiaddr = `/${ipversion}/${outgoing_ip_address}/${outgoing_protocol}/${outgoing_port}`;
        // return inmultiaddr
        return `/p2p/12D3KooWAoAz3YbCtT79tMxD2vVumZcC9otqEiDs8kjB4HA5wkP3`
    })();

    console.log({
        outmultiaddr,
        inmultiaddr,
        p2pmultiaddr
    });


    const {api_url,api1_url,peer_id} = config;
    let stream_id_thing = `/x/drewsshtesting/1.0`; // yes, use let

    const my_info = (await getMyInfo(api_url));
    const my_id = my_info.Identity.PeerID;
    const url = my_info.API.HTTPHeaders['Access-Control-Allow-Origin'][0];
    const peer_mulit_addrs = (await getPeerIds(api_url,peer_id)).Responses[0].Addrs;

    const libp2p_streaming = await enableLibp2pStreamMounting(api_url);
    const libp2p_streaming1 = await enableLibp2pStreamMounting(api1_url);
    // const converted_cid = await convertCid();

    // setup the forwarding
    await Promise.all([
        await p2pListen(api_url,stream_id_thing,outmultiaddr),
        await p2pForward(api1_url, stream_id_thing, inmultiaddr, p2pmultiaddr)
    ]);

    setInterval(async()=>{

        console.log('callback')
        const random_id = uuidv4();

        const new_stream_id_thing = `/x/${random_id}`;
        
        await p2pListen(api_url, new_stream_id_thing,outmultiaddr);
        
        // ipfs p2p close -p /x/drewsshtesting/1.0 // the moment of the switch... need to test this heavily 
        await p2pClose(api1_url, stream_id_thing);
        await p2pForward(api1_url, new_stream_id_thing, inmultiaddr, p2pmultiaddr);

        await timeoutPromise()
        
        await p2pClose(api_url, stream_id_thing);

        stream_id_thing = new_stream_id_thing;

        const report = (await axios.post(`http://${api1_url}/api/v0/p2p/ls`)).data.Listeners;
        console.log({report});
    },10*1000)



    // TODO add 
    // ipfs config --json Experimental.Libp2pStreamMounting true

    const small_peer_mulit_addrs = peer_mulit_addrs.reduce((acc,cur)=>{
        if( acc!==undefined && !cur.includes("127") && !cur.includes("172") ){
            acc = cur;
        }
        return acc;
    },[]);

    console.log({
        my_id,
        // my_info,
        peer_id,
        small_peer_mulit_addrs,
        peer_mulit_addrs,
        url,
        // converted_cid,
        libp2p_streaming,
        libp2p_streaming1,
    });

})();

async function p2pClose(api_url,protocol,target_address){
    // ipfs p2p close -p /x/drewsshtesting/1.0
    // ipfs p2p close --protocol /x/drewsshtesting/1.0
    try{
        const url = `http://${api_url}/api/v0/p2p/close?protocol=${protocol}`;
        console.log({url});
        await axios.post(url);
    }catch(e){
        // console.log({e});
        const ms = 2000;
        console.log(`trying p2pClose in ${ms}ms`)
        await timeoutPromise(ms);
        return p2pClose(api_url,protocol,target_address);
    }
}

async function p2pListen(api_url,protocol,target_address){
    try{
        const url = `http://${api_url}/api/v0/p2p/listen?arg=${protocol}&arg=${target_address}`;
        console.log({url});
        await axios.post(url);
    }catch(e){
        // console.log({e});
        const ms = 2000;
        console.log(`trying p2pListen in ${ms}ms`)
        await timeoutPromise(ms);
        return p2pListen(api_url,protocol,target_address);
    }
}

async function p2pForward(api_url,protocol,listen_address,target_address){
    try{
        const url = `http://${api_url}/api/v0/p2p/forward?arg=${protocol}&arg=${listen_address}&arg=${target_address}`;
        console.log({url});
        await axios.post(url);
    }catch(e){
        console.log({e});
        const ms = 2000;
        console.log(`trying p2pForward in ${ms}ms`)
        await timeoutPromise(ms);
        return p2pForward(api_url,protocol,target_address);
    }
}


async function getPeerIds(api_url,peer_id){
    try{
        const url = `http://${api_url}/api/v0/dht/findpeer/${peer_id}`;
        return (await axios.post(url)).data;
    }catch(e){
        const ms = 2000;
        console.log(`trying getPeerIds in ${ms}ms`)
        await timeoutPromise(ms);
        return getPeerIds(api_url,peer_id);
    }
}

async function getMyInfo(api_url){
    try{
        const url = `http://${api_url}/api/v0/config/show`;
        return (await axios.post(url)).data;
    }catch(e){
        const ms = 2000;
        console.log(`trying getMyInfo in ${ms}ms`)
        await timeoutPromise(ms);
        return getMyInfo(api_url);
    }
}

async function convertCid(api_url,cid){
    try{
        const url = `http://${api_url}/api/v0/cid/base32${cid}`;
        return (await axios.post(url)).data;
    }catch(e){
        const ms = 2000;
        console.log(`trying convertCid in ${ms}ms`)
        await timeoutPromise(ms);
        return convertCid(api_url);
    }
}

// curl -X POST "http://127.0.0.1:5001/"
async function enableLibp2pStreamMounting(api_url){
    try{
        const url = `http://${api_url}/api/v0/config?arg=Experimental.Libp2pStreamMounting&arg=true&json=true`;
        return (await axios.post(url)).data;
    }catch(e){
        const ms = 2000;
        console.log(`trying enableLibp2pStreamMounting in ${ms}ms`)
        await timeoutPromise(ms);
        return enableLibp2pStreamMounting(api_url);
    }    
}

function timeoutPromise(ms){
    return new Promise((resolve, reject)=>{
      setTimeout(resolve,ms);
    }); 
  }