// Jupiter API Type Definitions

export type SwapMode = 'ExactIn' | 'ExactOut';

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string; // uint64 as string
  slippageBps?: number; // uint16
  swapMode?: SwapMode;
  dexes?: string[];
  excludeDexes?: string[];
  restrictIntermediateTokens?: boolean;
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
  platformFeeBps?: number; // uint16
  maxAccounts?: number; // uint64
  dynamicSlippage?: boolean;
}

export interface PlatformFee {
  amount: number; // uint64
  feeBps: number; // uint16
}

export interface SwapInfo {
  ammKey: string;
  label?: string;
  inputMint: string;
  outputMint: string;
  inAmount: number; // uint64
  outAmount: number; // uint64
  feeAmount: number; // uint64
  feeMint: string;
}

export interface RoutePlan {
  swapInfo: SwapInfo;
  percent: number; // uint8
}

export interface QuoteResponse {
  inputMint: string;
  inAmount: number; // uint64
  outputMint: string;
  outAmount: number; // uint64
  otherAmountThreshold: number; // uint64
  swapMode: SwapMode;
  slippageBps: number; // uint16
  platformFee?: PlatformFee;
  priceImpactPct: number;
  routePlan: RoutePlan[];
  contextSlot?: number; // uint64
  timeTaken?: number;
}

export interface Account {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

export interface Instruction {
  programId: string;
  accounts: Account[];
  data: string; // base64 encoded
}

export interface PrioritizationFeeLamports {
  priorityLevelWithMaxLamports?: {
    priorityLevel: string;
    priorityFeeInLamports: number;
  };
}

export interface SwapInstructionsParams {
  userPublicKey: string;
  payer?: string;
  wrapAndUnwrapSol?: boolean;
  useSharedAccounts?: boolean;
  feeAccount?: string;
  trackingAccount?: string;
  prioritizationFeeLamports?: PrioritizationFeeLamports;
  asLegacyTransaction?: boolean;
  destinationTokenAccount?: string;
  dynamicComputeUnitLimit?: boolean;
  skipUserAccountsRpcCalls?: boolean;
  dynamicSlippage?: boolean;
  computeUnitPriceMicroLamports?: number; // uint64
  blockhashSlotsToExpiry?: number; // uint8
  quoteResponse: QuoteResponse;
}

export interface SwapInstructionsResponse {
  otherInstructions?: Instruction[];
  computeBudgetInstructions?: Instruction[];
  setupInstructions?: Instruction[];
  swapInstruction: Instruction;
  cleanupInstruction?: Instruction;
  addressLookupTableAddresses?: string[];
}

export interface JupiterTransactionResult {
  quote: QuoteResponse;
  instructions: SwapInstructionsResponse;
  success: boolean;
  error?: string;
}

export interface TransactionConfig {
  userPublicKey: string;
  slippageBps?: number;
  swapMode?: SwapMode;
  prioritizationFeeLamports?: PrioritizationFeeLamports;
  asLegacyTransaction?: boolean;
  dynamicComputeUnitLimit?: boolean;
  dynamicSlippage?: boolean;
} 