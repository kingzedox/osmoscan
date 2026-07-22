const { StargateClient } = require('@cosmjs/stargate');

async function main() {
  const rpcEndpoint = "https://rpc.osmosis.zone";
  const client = await StargateClient.connect(rpcEndpoint);
  
  const addr = "osmo1kd93t40mmjp64l6wth2tgrp5rtqha0rj8kk89g";
  const cometClient = client.forceGetCometClient();
  
  const response = await cometClient.txSearch({
    query: `message.sender='${addr}'`,
    page: 1,
    per_page: 1,
    order_by: "desc"
  });
  
  const tx = response.txs[0];
  console.log("Log string:", tx.result.log);
  
  const { decodeTxRaw } = require('@cosmjs/proto-signing');
  const decodedTx = decodeTxRaw(tx.tx);
  console.log("Msg typeUrl:", decodedTx.body.messages[0].typeUrl);
}
main().catch(console.error);
