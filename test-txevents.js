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
  console.log("Events:", tx.result.events.length);
  if (tx.result.events.length > 0) {
    const ev = tx.result.events[0];
    console.log("First Event Type:", ev.type);
    console.log("First Event attributes:", ev.attributes.map(a => ({
      key: Buffer.from(a.key).toString('utf-8'),
      value: a.value ? Buffer.from(a.value).toString('utf-8') : null
    })));
  }
}
main().catch(console.error);
