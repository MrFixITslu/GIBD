/**
 * Wallet Extension Isolation Utility
 * Prevents browser wallet extensions from interfering with your application
 * 
 * This file handles browser wallet extensions (MetaMask, Binance Chain, etc.)
 * that inject code into ALL websites, even when not needed.
 */

class WalletIsolationManager {
  private initialized = false;
  private errorCount = 0;
  private maxErrors = 5;

  constructor() {
    this.initializeIsolation();
  }

  private initializeIsolation() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    // 1. Prevent wallet providers from initializing
    this.blockWalletProviders();

    // 2. Suppress wallet-related errors
    this.suppressWalletErrors();

    // 3. Clean up wallet injected properties
    this.cleanupWalletProperties();

    this.initialized = true;
    console.info('[WalletIsolation] Browser wallet extensions isolated from application');
  }

  private blockWalletProviders() {
    // Prevent common wallet providers from being accessible
    const walletProviders = [
      'ethereum',
      'BinanceChain', 
      'binance',
      'web3',
      'trustwallet',
      'coinbaseWallet',
      'phantom',
      'solana'
    ];

    walletProviders.forEach(provider => {
      try {
        Object.defineProperty(window, provider, {
          get: () => {
            console.warn(`[WalletIsolation] Blocked access to ${provider} wallet provider`);
            return undefined;
          },
          set: () => {
            // Prevent setting wallet providers
            console.warn(`[WalletIsolation] Prevented ${provider} wallet injection`);
          },
          configurable: false,
          enumerable: false
        });
      } catch (error) {
        // Property might already be defined, that's ok
      }
    });
  }

  private suppressWalletErrors() {
    // Suppress specific wallet-related errors
    const originalError = window.addEventListener;
    
    window.addEventListener = function(type: string, listener: any, options?: any) {
      if (type === 'error') {
        const wrappedListener = (event: Event) => {
          const errorEvent = event as ErrorEvent;
          // Check if error is from wallet extensions
          if (errorEvent.filename && (
            errorEvent.filename.includes('inpage.js') ||
            errorEvent.filename.includes('contentscript.js') ||
            errorEvent.filename.includes('pageWorld.js')
          )) {
            console.debug('[WalletIsolation] Suppressed wallet extension error:', errorEvent.message);
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
          
          // Call original listener for non-wallet errors
          if (typeof listener === 'function') {
            return listener(event);
          }
        };
        
        return originalError.call(this, type, wrappedListener, options);
      }
      
      return originalError.call(this, type, listener, options);
    };

    // Suppress unhandled promise rejections from wallets
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason?.toString() || '';
      
      if (reason.includes('BinanceChain') || 
          reason.includes('ethereum') ||
          reason.includes('MetaMask') ||
          reason.includes('wallet') ||
          reason.includes('injected')) {
        
        console.debug('[WalletIsolation] Suppressed wallet promise rejection:', reason);
        event.preventDefault();
        return false;
      }
    });
  }

  private cleanupWalletProperties() {
    // Remove wallet-injected properties if they exist
    const walletProperties = [
      '__METAMASK_DETECTED__',
      'isMetaMask',
      'isBinance',
      'isTrust',
      'isCoinbase'
    ];

    walletProperties.forEach(prop => {
      try {
        delete (window as any)[prop];
      } catch (error) {
        // Property might be non-configurable
      }
    });
  }

  // Public method to manually trigger isolation
  public isolate() {
    this.initializeIsolation();
  }

  // Check if wallet-related errors are occurring
  public getErrorCount(): number {
    return this.errorCount;
  }

  // Reset error count
  public resetErrorCount() {
    this.errorCount = 0;
  }
}

// Create singleton instance
export const walletIsolation = new WalletIsolationManager();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Initialize immediately
  walletIsolation.isolate();
  
  // Also initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      walletIsolation.isolate();
    });
  }
}
