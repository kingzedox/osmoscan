const { StargateClient } = require('@cosmjs/stargate');

async function main() {
  const rpcEndpoint = "https://rpc.osmosis.zone";
  const client = await StargateClient.connect(rpcEndpoint);
  
  // Search for transactions sent by some address
  const addr = "osmo18kxyn3dpmwnmctzkgckfcgp7a4nzss0l6agzpz";
  console.log("Searching for:", addr);
  const txs = await client.searchTx(`message.sender='${addr}'`);
  
  if (txs.length > 0) {
    const tx = txs[0];
    console.log("Tx keys:", Object.keys(tx));
    console.log("Tx height:", tx.height);
    // Does it have timestamp?
    console.log("Tx timestamp?", tx.timestamp || tx.time || tx.header);
  } else {
    console.log("No txs found.");
  }
}
main().catch(console.error);
