const { StargateClient } = require('@cosmjs/stargate');

async function main() {
  const rpcEndpoint = "https://rpc.osmosis.zone";
  const client = await StargateClient.connect(rpcEndpoint);
  
  const addr = "osmo18kxyn3dpmwnmctzkgckfcgp7a4nzss0l6agzpz";
  console.log("Searching for:", addr);
  
  // Cast to any to access forceGetCometClient
  const cometClient = client.forceGetCometClient();
  
  const response = await cometClient.txSearch({
    query: `message.sender='${addr}'`,
    page: 1,
    per_page: 50,
    order_by: "desc"
  });
  
  console.log(`Found ${response.totalCount} txs total. Returned ${response.txs.length}.`);
}
main().catch(console.error);
