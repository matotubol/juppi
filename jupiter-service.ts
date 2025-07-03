import axios, { AxiosInstance } from 'axios';
import {
  QuoteParams,
  QuoteResponse,
  SwapInstructionsParams,
  SwapInstructionsResponse,
  JupiterTransactionResult,
  TransactionConfig,
  SwapMode
} from './types';
import { JupiterConfig } from './config';

export class JupiterService {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://lite-api.jup.ag/swap/v1';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Main method for getting swap transaction instructions
   * @param inputMint - Token mint address to swap from
   * @param outputMint - Token mint address to swap to  
   * @param amount - Raw amount to swap (before decimals)
   * @param slippageBps - Slippage in basis points (e.g., 100 = 1%)
   * @param config - Additional transaction configuration
   * @returns Promise<JupiterTransactionResult>
   */
  async getTransaction(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps?: number,
    config?: Partial<TransactionConfig>
  ): Promise<JupiterTransactionResult> {
    try {
      // Step 1: Get quote
      const quote = await this.getQuote({
        inputMint,
        outputMint,
        amount,
        slippageBps,
      });

      // Step 2: Get swap instructions
      const instructions = await this.getSwapInstructions({
        userPublicKey: config?.userPublicKey || 'REPLACE_WITH_WALLET_KEY',
        quoteResponse: quote,
        prioritizationFeeLamports: config?.prioritizationFeeLamports,
      });

      return {
        quote,
        instructions,
        success: true,
      };
    } catch (error) {
      console.error('Jupiter transaction error:', error);
      return {
        quote: {} as QuoteResponse,
        instructions: {} as SwapInstructionsResponse,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Simplified buy method - swaps from SOL to target token
   * @param tokenMint - Target token mint address
   * @param solAmount - Amount of SOL to spend (in lamports)
   * @param userPublicKey - User's wallet public key
   * @param slippageBps - Optional slippage override
   */
  async buy(
    tokenMint: string,
    solAmount: string,
    userPublicKey: string,
    slippageBps?: number
  ): Promise<JupiterTransactionResult> {
    return this.getTransaction(
      JupiterConfig.tokens.SOL, 
      tokenMint, 
      solAmount, 
      slippageBps, 
      { userPublicKey }
    );
  }

  /**
   * Simplified sell method - swaps from token to SOL
   * @param tokenMint - Token mint address to sell
   * @param tokenAmount - Amount of token to sell (raw amount)
   * @param userPublicKey - User's wallet public key
   * @param slippageBps - Optional slippage override
   */
  async sell(
    tokenMint: string,
    tokenAmount: string,
    userPublicKey: string,
    slippageBps?: number
  ): Promise<JupiterTransactionResult> {
    return this.getTransaction(
      tokenMint, 
      JupiterConfig.tokens.SOL, 
      tokenAmount, 
      slippageBps, 
      { userPublicKey }
    );
  }

  /**
   * Get a quote from Jupiter
   * @param params - Quote parameters
   * @returns Promise<QuoteResponse>
   */
  private async getQuote(params: QuoteParams): Promise<QuoteResponse> {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    queryParams.append('inputMint', params.inputMint);
    queryParams.append('outputMint', params.outputMint);
    queryParams.append('amount', params.amount);
    
    // Use config defaults, but allow override from params
    const config = JupiterConfig.quote;
    queryParams.append('slippageBps', (params.slippageBps ?? config.slippageBps).toString());
    queryParams.append('swapMode', params.swapMode ?? config.swapMode);
    queryParams.append('restrictIntermediateTokens', (params.restrictIntermediateTokens ?? config.restrictIntermediateTokens).toString());
    queryParams.append('onlyDirectRoutes', (params.onlyDirectRoutes ?? config.onlyDirectRoutes).toString());
    queryParams.append('asLegacyTransaction', (params.asLegacyTransaction ?? config.asLegacyTransaction).toString());
    queryParams.append('maxAccounts', (params.maxAccounts ?? config.maxAccounts).toString());
    queryParams.append('dynamicSlippage', (params.dynamicSlippage ?? config.dynamicSlippage).toString());
    
    if (params.dexes?.length || config.dexes.length) {
      queryParams.append('dexes', (params.dexes ?? config.dexes).join(','));
    }
    if (params.excludeDexes?.length || config.excludeDexes.length) {
      queryParams.append('excludeDexes', (params.excludeDexes ?? config.excludeDexes).join(','));
    }
    if (params.platformFeeBps ?? config.platformFeeBps) {
      queryParams.append('platformFeeBps', (params.platformFeeBps ?? config.platformFeeBps).toString());
    }

    const response = await this.client.get(`/quote?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get swap instructions from Jupiter
   * @param params - Swap instructions parameters
   * @returns Promise<SwapInstructionsResponse>
   */
  private async getSwapInstructions(params: SwapInstructionsParams): Promise<SwapInstructionsResponse> {
    const config = JupiterConfig.swap;
    
    // Build params with config defaults
    const requestParams = {
      userPublicKey: params.userPublicKey,
      quoteResponse: params.quoteResponse,
      wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? config.wrapAndUnwrapSol,
      useSharedAccounts: params.useSharedAccounts ?? config.useSharedAccounts,
      asLegacyTransaction: params.asLegacyTransaction ?? config.asLegacyTransaction,
      dynamicComputeUnitLimit: params.dynamicComputeUnitLimit ?? config.dynamicComputeUnitLimit,
      skipUserAccountsRpcCalls: params.skipUserAccountsRpcCalls ?? config.skipUserAccountsRpcCalls,
      dynamicSlippage: params.dynamicSlippage ?? config.dynamicSlippage,
      ...(params.feeAccount || config.feeAccount) && { feeAccount: params.feeAccount || config.feeAccount },
      ...(params.trackingAccount || config.trackingAccount) && { trackingAccount: params.trackingAccount || config.trackingAccount },
      ...(params.destinationTokenAccount || config.destinationTokenAccount) && { destinationTokenAccount: params.destinationTokenAccount || config.destinationTokenAccount },
      ...(params.computeUnitPriceMicroLamports || config.computeUnitPriceMicroLamports) && { computeUnitPriceMicroLamports: params.computeUnitPriceMicroLamports || config.computeUnitPriceMicroLamports },
      ...(params.blockhashSlotsToExpiry || config.blockhashSlotsToExpiry) && { blockhashSlotsToExpiry: params.blockhashSlotsToExpiry || config.blockhashSlotsToExpiry },
      ...(params.prioritizationFeeLamports) && { prioritizationFeeLamports: params.prioritizationFeeLamports },
      ...(params.payer) && { payer: params.payer },
    };

    const response = await this.client.post('/swap-instructions', requestParams);
    return response.data;
  }

  /**
   * Validate if a mint address format is correct
   * @param mint - Mint address to validate
   * @returns boolean
   */
  public isValidMint(mint: string): boolean {
    // Basic validation: Solana addresses are 32-44 characters long and base58 encoded
    return typeof mint === 'string' && mint.length >= 32 && mint.length <= 44;
  }

  /**
   * Get route information for a potential swap
   * @param inputMint - Input token mint
   * @param outputMint - Output token mint  
   * @param amount - Amount to swap
   * @returns Promise<QuoteResponse>
   */
  async getRouteInfo(
    inputMint: string, 
    outputMint: string, 
    amount: string
  ): Promise<QuoteResponse> {
    return this.getQuote({
      inputMint,
      outputMint,
      amount,
      slippageBps: 100, // 1% default for route info
    });
  }

  /**
   * Calculate price impact for a swap
   * @param inputMint - Input token mint
   * @param outputMint - Output token mint
   * @param amount - Amount to swap
   * @returns Promise<number> - Price impact percentage
   */
  async calculatePriceImpact(
    inputMint: string,
    outputMint: string, 
    amount: string
  ): Promise<number> {
    const quote = await this.getRouteInfo(inputMint, outputMint, amount);
    return quote.priceImpactPct;
  }
} 