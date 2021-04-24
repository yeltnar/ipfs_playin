// curl -X POST http://localhost:5001/api/v0/cid {"Strings": ["12D3KooWB7Fb7GghxWizb9XN5afCs9QTXzDFDt1fmqFwnGwRG3ER"]}

const axios = require('axios');
const config = require('config');

(async()=>{

    const {api_url,peer_id} = config;

    const my_info = (await getMyInfo(api_url));
    const my_id = my_info.Identity.PeerID;
    const url = my_info.API.HTTPHeaders['Access-Control-Allow-Origin'][0];
    const peer_mulit_addrs = (await getPeerIds(api_url,peer_id)).Responses[0].Addrs;
    // const converted_cid = await convertCid();

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
    });

})();

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

function timeoutPromise(ms){
    return new Promise((resolve, reject)=>{
      setTimeout(resolve,ms);
    }); 
  }