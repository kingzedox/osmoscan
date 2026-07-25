const { StargateClient } = require('@cosmjs/stargate');

async function main() {
  console.time('connect');
  const client = await StargateClient.connect("https://rpc.osmosis.zone");
  console.timeEnd('connect');
  
  console.time('getBlock');
  const block = await client.getBlock(66226926);
  console.timeEnd('getBlock');
  
  console.log("Block time:", block.header.time);
}
main().catch(console.error);
