/**
 * Fantasy402 Betting API Client
 *
 * Client for interacting with the Fantasy402 betting platform API
 * Handles authentication, bet ticker fetching, and wager monitoring
 */

interface BetTickerRequest {
  agentID: string;
  wagerNumber: number;
  operation: 'getBetTicker';
  RRO?: number;
  agentOwner: string;
  agentSite: number;
}

interface BetTickerResponse {
  wagerNumber: number;
  agentID: string;
  customerID: string;
  login: string;
  wagerType: string;
  amountWagered: number;
  toWinAmount: number;
  ticketWriter: string;
  volumeAmount: number;
  shortDesc: string;
  vip: string;
  agentLogin: string;
  // Additional detailed fields from API
  status?: string;
  outcome?: string;
  settledDate?: string;
  odds?: string;
  sport?: string;
  event?: string;
  market?: string;
  selection?: string;
  timestamp?: string;
}

interface APIConfig {
  baseUrl: string;
  agentId: string;
  agentOwner: string;
  agentSite: number;
  bearerToken: string;
  timeout: number;
}

export class BettingAPIClient {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  /**
   * Fetch bet ticker for a specific wager
   */
  async getBetTicker(wagerNumber: number): Promise<BetTickerResponse | null> {
    const requestData: BetTickerRequest = {
      agentID: this.config.agentId,
      wagerNumber,
      operation: 'getBetTicker',
      RRO: 1,
      agentOwner: this.config.agentOwner,
      agentSite: this.config.agentSite
    };

    const formData = new URLSearchParams();
    Object.entries(requestData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    try {
      const response = await fetch(`${this.config.baseUrl}/cloud/api/Manager/getBetTicker`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': `Bearer ${this.config.bearerToken}`,
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest'
        },
        referrer: `${this.config.baseUrl}/manager.html?bet-ticker=active&undefined`,
        body: formData.toString(),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        console.warn(`Bet ticker API returned ${response.status} for wager ${wagerNumber}`);
        return null;
      }

      const data = await response.json();

      // Handle API response format - may need adjustment based on actual response
      if (data && typeof data === 'object') {
        return {
          wagerNumber,
          agentID: data.agentID || this.config.agentId,
          customerID: data.customerID || data.CustomerID || '',
          login: data.login || data.Login || '',
          wagerType: data.wagerType || data.WagerType || '',
          amountWagered: data.amountWagered || data.AmountWagered || 0,
          toWinAmount: data.toWinAmount || data.ToWinAmount || 0,
          ticketWriter: data.ticketWriter || data.TicketWriter || '',
          volumeAmount: data.volumeAmount || data.VolumeAmount || 0,
          shortDesc: data.shortDesc || data.ShortDesc || '',
          vip: data.vip || data.VIP || '0',
          agentLogin: data.agentLogin || data.AgentLogin || '',
          status: data.status,
          outcome: data.outcome,
          settledDate: data.settledDate,
          odds: data.odds,
          sport: data.sport,
          event: data.event,
          market: data.market,
          selection: data.selection,
          timestamp: data.timestamp || new Date().toISOString()
        };
      }

      return null;

    } catch (error) {
      console.error(`Failed to fetch bet ticker for wager ${wagerNumber}:`, error);
      return null;
    }
  }

  /**
   * Fetch multiple bet tickers in parallel
   */
  async getMultipleBetTickers(wagerNumbers: number[]): Promise<Map<number, BetTickerResponse>> {
    const promises = wagerNumbers.map(async (wagerNumber) => {
      const data = await this.getBetTicker(wagerNumber);
      return [wagerNumber, data] as [number, BetTickerResponse | null];
    });

    const results = await Promise.allSettled(promises);
    const betData = new Map<number, BetTickerResponse>();

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const [wagerNumber, data] = result.value;
        if (data) {
          betData.set(wagerNumber, data);
        }
      } else {
        console.error(`Failed to fetch bet ticker for wager ${wagerNumbers[index]}:`, result.reason);
      }
    });

    return betData;
  }

  /**
   * Get active wagers (requires additional API endpoint)
   */
  async getActiveWagers(): Promise<BetTickerResponse[]> {
    // This would need a separate API call to get active wager numbers
    // For now, return empty array - would need to implement based on actual API
    console.warn('getActiveWagers not implemented - requires additional API endpoint');
    return [];
  }

  /**
   * Monitor specific wager numbers for updates
   */
  async monitorWagers(wagerNumbers: number[]): Promise<Map<number, BetTickerResponse | null>> {
    return this.getMultipleBetTickers(wagerNumbers);
  }

  /**
   * Update API configuration
   */
  updateConfig(updates: Partial<APIConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch a known wager or use a test endpoint
      const testWager = 725385092; // Use first wager from sample data
      const result = await this.getBetTicker(testWager);
      return result !== null;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get API statistics
   */
  getStats(): {
    baseUrl: string;
    agentId: string;
    timeout: number;
    connected: boolean;
  } {
    return {
      baseUrl: this.config.baseUrl,
      agentId: this.config.agentId,
      timeout: this.config.timeout,
      connected: true // Would need to track actual connection status
    };
  }
}

/**
 * Create API client from environment variables
 */
export function createBettingAPIClient(): BettingAPIClient {
  const config: APIConfig = {
    baseUrl: process.env.BETTING_API_BASE_URL || 'https://betting-api.example.com',
    agentId: process.env.BETTING_API_AGENT_ID?.trim() || 'DEMO_AGENT',
    agentOwner: process.env.BETTING_API_AGENT_OWNER?.trim() || 'DEMO_AGENT',
    agentSite: parseInt(process.env.BETTING_API_AGENT_SITE || '1'),
    bearerToken: process.env.BETTING_API_BEARER_TOKEN?.trim() || 'demo-token-please-set-env-var',
    timeout: parseInt(process.env.BETTING_API_TIMEOUT || '10000')
  };

  // Validate required configuration
  if (!config.bearerToken || config.bearerToken === 'demo-token-please-set-env-var') {
    throw new Error('BETTING_API_BEARER_TOKEN environment variable is required. Please set a valid Bearer token.');
  }

  if (config.baseUrl.includes('example.com')) {
    console.warn('⚠️  Using placeholder domain. Set BETTING_API_BASE_URL for production use.');
  }

  return new BettingAPIClient(config);
}

/**
 * Convert BetTickerResponse to WagerData format for compatibility
 */
export function convertBetTickerToWagerData(betTicker: BetTickerResponse): any {
  return {
    WagerNumber: betTicker.wagerNumber,
    AgentID: betTicker.agentID,
    CustomerID: betTicker.customerID,
    Login: betTicker.login,
    WagerType: betTicker.wagerType,
    AmountWagered: betTicker.amountWagered,
    InsertDateTime: betTicker.timestamp || new Date().toISOString(),
    ToWinAmount: betTicker.toWinAmount,
    TicketWriter: betTicker.ticketWriter,
    VolumeAmount: betTicker.volumeAmount,
    ShortDesc: betTicker.shortDesc,
    VIP: betTicker.vip,
    AgentLogin: betTicker.agentLogin,
    // Additional fields
    Status: betTicker.status,
    Outcome: betTicker.outcome,
    SettledDate: betTicker.settledDate,
    Odds: betTicker.odds,
    Sport: betTicker.sport,
    Event: betTicker.event,
    Market: betTicker.market,
    Selection: betTicker.selection
  };
}
