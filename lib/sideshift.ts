import axios, { AxiosInstance, AxiosError } from "axios";

const SIDESHIFT_API_BASE_URL =
  process.env.SIDESHIFT_API_BASE_URL || "https://sideshift.ai/api/v2";
const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET!;
const SIDESHIFT_AFFILIATE_ID = process.env.SIDESHIFT_AFFILIATE_ID!;

interface CreateVariableShiftParams {
  settleAddress: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork?: string;
  settleNetwork?: string;
  refundAddress?: string;
  userIp: string; // Required
  commissionRate?: string;
}

interface VariableShiftResponse {
  id: string;
  createdAt: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAddress: string;
  depositMemo?: string;
  settleAddress: string;
  depositMin: string;
  depositMax: string;
  type: string;
  expiresAt: string;
  status: string;
  settleCoinNetworkFee: string;
  networkFeeUsd: string;
}

interface ShiftStatusResponse {
  id: string;
  status: string;
  depositCoin: string;
  settleCoin: string;
  depositAmount?: string;
  settleAmount?: string;
  depositAddress: string;
  settleAddress: string;
  expiresAt: string;
  createdAt: string;
  depositTx?: string;
  settleTx?: string;
}

interface PairInfoResponse {
  min: string;
  max: string;
  rate: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
}

interface PermissionsResponse {
  createShift: boolean;
}

class SideShiftClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: SIDESHIFT_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private handleError(error: any, context: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      // SideShift usually returns { error: { message: "..." } }
      const message = data?.error?.message || error.message;

      console.error(`SideShift API Error [${context}] (${status}):`, JSON.stringify(data));

      if (status === 429) {
        throw new Error(`SideShift Rate Limit Exceeded: ${message}`);
      }
      if (status === 403) {
        throw new Error(`SideShift Access Denied: ${message}`);
      }
      if (status === 400) {
        throw new Error(`SideShift Bad Request: ${message}`); 
      }
      
      throw new Error(message);
    }
    console.error(`SideShift Unexpected Error [${context}]:`, error);
    throw new Error("An unexpected error occurred with the payment provider.");
  }

  async checkPermissions(userIp: string): Promise<PermissionsResponse> {
    try {
      console.log("SideShift checkPermissions headers >>>", { "x-user-ip": userIp });
      const response = await this.client.get("/permissions", {
        headers: { "x-user-ip": userIp },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error, "checkPermissions");
    }
  }

  async getPairInfo(
    from: string,
    to: string,
    amount?: number
  ): Promise<PairInfoResponse> {
    try {
      const params: any = {
        affiliateId: SIDESHIFT_AFFILIATE_ID,
      };
      if (amount) {
        params.amount = amount.toString();
      }

      const response = await this.client.get(`/pair/${from}/${to}`, {
        headers: { "x-sideshift-secret": SIDESHIFT_SECRET },
        params,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error, "getPairInfo");
    }
  }

  async createVariableShift(
    params: CreateVariableShiftParams
  ): Promise<VariableShiftResponse> {
    if (!params.userIp) {
        throw new Error("User IP is required for SideShift shift creation");
    }

    const headers = {
      "x-sideshift-secret": SIDESHIFT_SECRET,
      "x-user-ip": params.userIp,
    };

    console.log("SideShift createVariableShift headers >>>", headers);

    try {
      const response = await this.client.post(
        "/shifts/variable",
        {
          settleAddress: params.settleAddress,
          depositCoin: params.depositCoin,
          settleCoin: params.settleCoin,
          depositNetwork: params.depositNetwork,
          settleNetwork: params.settleNetwork,
          refundAddress: params.refundAddress,
          affiliateId: SIDESHIFT_AFFILIATE_ID,
          commissionRate: params.commissionRate,
        },
        {
          headers: headers,
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error, "createVariableShift");
    }
  }

  async getShiftStatus(shiftId: string): Promise<ShiftStatusResponse> {
    try {
      const response = await this.client.get(`/shifts/${shiftId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, "getShiftStatus");
    }
  }

  async setRefundAddress(shiftId: string, address: string): Promise<void> {
    try {
      await this.client.post(
        `/shifts/${shiftId}/set-refund-address`,
        { address },
        {
          headers: { "x-sideshift-secret": SIDESHIFT_SECRET },
        }
      );
    } catch (error) {
      return this.handleError(error, "setRefundAddress");
    }
  }

  async getCoins(): Promise<any> {
    try {
      const response = await this.client.get("/coins");
      return response.data;
    } catch (error) {
      return this.handleError(error, "getCoins");
    }
  }
}

export const sideshift = new SideShiftClient();