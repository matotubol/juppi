import { JupiterService } from './jupiter-service';
import { JupiterConfig, setSlippage, applyPreset } from './config';

// Replace with your actual wallet public key
const USER_PUBLIC_KEY = "FpJxBcaMAid9E4Mr3pLSyKk5JMUPiWtGcYBeYzQdRtgp";

class SwapService {
  private jupiter: JupiterService;
  private userPublicKey: string;

  constructor(userPublicKey: string) {
    this.jupiter = new JupiterService();
    this.userPublicKey = userPublicKey;
  }

  async buy(tokenMint: string, solAmount: string, slippageBps?: number) {
    const startTime = performance.now();
    const result = await this.jupiter.buy(tokenMint, solAmount, this.userPublicKey, slippageBps);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (result.success) {
      console.log(`✅ Buy successful - Expected output: ${result.quote.outAmount} tokens`);
      console.log(`⏱️ Buy operation took ${duration.toFixed(2)}ms`);
      return result.instructions;
    } else {
      console.error(`❌ Buy failed: ${result.error}`);
      console.log(`⏱️ Failed buy operation took ${duration.toFixed(2)}ms`);
      throw new Error(result.error);
    }
  }

  async sell(tokenMint: string, tokenAmount: string, slippageBps?: number) {
    const startTime = performance.now();
    const result = await this.jupiter.sell(tokenMint, tokenAmount, this.userPublicKey, slippageBps);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (result.success) {
      console.log(`✅ Sell successful - Expected output: ${result.quote.outAmount} lamports`);
      console.log(`⏱️ Sell operation took ${duration.toFixed(2)}ms`);
      return result.instructions;
    } else {
      console.error(`❌ Sell failed: ${result.error}`);
      console.log(`⏱️ Failed sell operation took ${duration.toFixed(2)}ms`);
      throw new Error(result.error);
    }
  }
}

// Example usage
async function main() {
  // Optional: Configure trading style
  // applyPreset('aggressive');  // Use aggressive preset
  // setSlippage(50);           // Or set custom slippage (0.5%)

  const swapService = new SwapService(USER_PUBLIC_KEY);

  try {
    // Buy BONK with 0.1 SOL (uses config default slippage)
    await swapService.buy(JupiterConfig.tokens.TEST, "100000000");
    
    // Buy with custom slippage override
    // await swapService.buy(JupiterConfig.tokens.BONK, "100000000", 150); // 1.5%
    
    // Sell 1000 BONK tokens  
    // await swapService.sell(JupiterConfig.tokens.BONK, "1000000000");
    
  } catch (error) {
    console.error("Swap failed:", error);
  }
}

if (require.main === module) {
  main();
} 