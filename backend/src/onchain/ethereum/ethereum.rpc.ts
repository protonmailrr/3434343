/**
 * Ethereum RPC Client
 * Communicates with Ethereum node via JSON-RPC (Infura)
 */

export interface RpcError {
  code: number;
  message: string;
}

export interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: RpcError;
}

export interface EthBlock {
  number: string;
  hash: string;
  timestamp: string;
  transactions: string[];
}

export interface EthLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
}

export interface GetLogsParams {
  fromBlock: string;
  toBlock: string;
  address?: string | string[];
  topics?: (string | string[] | null)[];
}

/**
 * Ethereum RPC Client Class
 */
export class EthereumRpc {
  private requestId = 0;

  constructor(private url: string) {
    if (!url) {
      throw new Error('RPC URL is required');
    }
  }

  /**
   * Make JSON-RPC call
   */
  async call<T>(method: string, params: unknown[]): Promise<T> {
    this.requestId++;

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: this.requestId,
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC HTTP error: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as RpcResponse<T>;

    if (json.error) {
      throw new Error(`RPC error: ${json.error.message} (code: ${json.error.code})`);
    }

    return json.result as T;
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    const hex = await this.call<string>('eth_blockNumber', []);
    return parseInt(hex, 16);
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number, includeTransactions = false): Promise<EthBlock | null> {
    const hex = '0x' + blockNumber.toString(16);
    return this.call<EthBlock | null>('eth_getBlockByNumber', [hex, includeTransactions]);
  }

  /**
   * Get logs (events) with filter
   */
  async getLogs(params: GetLogsParams): Promise<EthLog[]> {
    return this.call<EthLog[]>('eth_getLogs', [params]);
  }

  /**
   * Get block timestamp
   */
  async getBlockTimestamp(blockNumber: number): Promise<Date> {
    const block = await this.getBlock(blockNumber);
    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }
    const timestamp = parseInt(block.timestamp, 16);
    return new Date(timestamp * 1000);
  }

  /**
   * Helper: Convert number to hex
   */
  static toHex(num: number): string {
    return '0x' + num.toString(16);
  }

  /**
   * Helper: Convert hex to number
   */
  static fromHex(hex: string): number {
    return parseInt(hex, 16);
  }
}
