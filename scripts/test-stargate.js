const { StargateClient } = require('@cosmjs/stargate');

async function main() {
  const rpcEndpoint = "https://rpc.osmosis.zone";
  const client = await StargateClient.connect(rpcEndpoint);
  
  // Just get any block, or a recent tx
  const block = await client.getBlock(20000000);
  console.log("Block time:", block.header.time);
  console.log("Block date:", new Date(block.header.time));
}
main().catch(console.error);
