// Jupiter Trading Configuration
// Modify these settings to customize your trading behavior

export const JupiterConfig = {
  // === QUOTE SETTINGS ===
  quote: {
    slippageBps: 100,                    // Default slippage: 1% (100 basis points)
    swapMode: 'ExactIn' as const,        // 'ExactIn' or 'ExactOut'
    restrictIntermediateTokens: true,    // Use stable intermediate tokens
    onlyDirectRoutes: true,             // Allow multi-hop routes for better prices
    asLegacyTransaction: false,          // Use versioned transactions (faster)
    maxAccounts: 64,                     // Max accounts in transaction
    dynamicSlippage: false,              // Use fixed slippage instead of dynamic
    
    // Optional: Specify which DEXes to use (leave empty for all)
    dexes: [] as string[],               // e.g., ['Raydium', 'Orca V2']
    
    // Optional: Exclude specific DEXes
    excludeDexes: [] as string[],        // e.g., ['Meteora DLMM']
    
    // Optional: Platform fees (in basis points)
    platformFeeBps: 0,                   // 0 = no platform fees
  },

  // === SWAP INSTRUCTION SETTINGS ===
  swap: {
    wrapAndUnwrapSol: true,              // Auto wrap/unwrap SOL
    useSharedAccounts: false,             // Use shared accounts for better routing
    asLegacyTransaction: false,          // Match quote setting
    dynamicComputeUnitLimit: true,       // Auto-calculate compute units
    skipUserAccountsRpcCalls: false,     // Do account checks for safety
    dynamicSlippage: false,              // Match quote setting
    
    // Optional: Custom fee account (for revenue sharing)
    feeAccount: '',                      // Your fee collection account
    
    // Optional: Tracking account (for analytics)
    trackingAccount: '',                 // Your tracking account
    
    // Optional: Custom destination token account
    destinationTokenAccount: '',         // Leave empty for auto-detection
    
    // Optional: Priority fee settings (leave 0 for default)
    computeUnitPriceMicroLamports: 0,    // Custom priority fee
    
    // Optional: Transaction expiry (in slots)
    blockhashSlotsToExpiry: 3,         // ~60 seconds at 400ms/slot
  },

  // === COMMON TOKEN ADDRESSES ===
  tokens: {
    SOL: "So11111111111111111111111111111111111111112",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    TEST: "5NnBnzmo2817MbkWjTv23eMqFjMzryLeYXgKmiZb3m16"
  },

  // === PRESETS FOR DIFFERENT TRADING STYLES ===
  presets: {
    // Conservative: Lower slippage, stable routes
    conservative: {
      slippageBps: 50,                   // 0.5%
      restrictIntermediateTokens: true,
      onlyDirectRoutes: true,
      maxAccounts: 32,
    },
    
    // Aggressive: Higher slippage, all routes
    aggressive: {
      slippageBps: 300,                  // 3%
      restrictIntermediateTokens: false,
      onlyDirectRoutes: false,
      maxAccounts: 64,
    },
    
    // Fast: Optimized for speed
    fast: {
      slippageBps: 100,                  // 1%
      dynamicComputeUnitLimit: true,
      skipUserAccountsRpcCalls: true,
      computeUnitPriceMicroLamports: 1000, // Higher priority fee
    },
  }
};

// === HELPER FUNCTIONS ===

// Apply a preset to the config
export function applyPreset(presetName: keyof typeof JupiterConfig.presets) {
  const preset = JupiterConfig.presets[presetName];
  Object.assign(JupiterConfig.quote, preset);
  Object.assign(JupiterConfig.swap, preset);
}

// Quick config updates
export function setSlippage(bps: number) {
  JupiterConfig.quote.slippageBps = bps;
}

export function setMaxAccounts(count: number) {
  JupiterConfig.quote.maxAccounts = count;
}

export function enableDynamicSlippage() {
  JupiterConfig.quote.dynamicSlippage = true;
  JupiterConfig.swap.dynamicSlippage = true;
}

export function setPreferredDexes(dexes: string[]) {
  JupiterConfig.quote.dexes = dexes;
} 