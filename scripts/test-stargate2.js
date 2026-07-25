const { StargateClient } = require('@cosmjs/stargate');

async function main() {
  const rpcEndpoint = "https://rpc.osmosis.zone";
  const client = await StargateClient.connect(rpcEndpoint);
  
  const block = await client.getBlock();
  console.log("Block time:", block.header.time);
}
main().catch(console.error);
