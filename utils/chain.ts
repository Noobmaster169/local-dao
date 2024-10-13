import { getContract, createThirdwebClient, readContract, Chain } from 'thirdweb';
import { defineChain } from 'thirdweb';

export const baseSepolia: Chain = defineChain({
    id: 84532,
    rpc: "https://base-sepolia.g.alchemy.com/v2/CIy2ezuBM2p9iHPNXw1jN_SMRelF4Gmq",
});