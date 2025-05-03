"use client";
import React from 'react';
import { useCallback, useEffect, useState } from "react";
import { RpcProvider, constants } from "starknet";
import { ArgentWebWallet, deployAndExecuteWithPaymaster, SessionAccountInterface } from "@argent/invisible-sdk";

const envName = (process.env.NEXT_PUBLIC_ENV_NAME) as "mainnet" | "sepolia";
const isMainnet = envName === "mainnet";
const chainId = isMainnet ? constants.StarknetChainId.SN_MAIN : constants.StarknetChainId.SN_SEPOLIA;


const DUMMY_CONTRACT_ADDRESS = isMainnet
  ? "0x001c515f991f706039696a54f6f33730e9b0e8cc5d04187b13c2c714401acfd4"
  : "0x07557a2fbe051e6327ab603c6d1713a91d2cfba5382ac6ca7de884d3278636d7";
const DUMMY_CONTRACT_ENTRYPOINT = "increase_number";

const paymasterParams = !process.env.NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY ? undefined : {
  apiKey: process.env.NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY,
};

console.log(paymasterParams, envName);

const ArgentInvisibleWalletButton = () => {
  const [account, setAccount] = useState<SessionAccountInterface | undefined>(undefined);
  const [counter, setCounter] = useState<bigint | undefined>();
  const [connectStatus, setConnectStatus] = useState<"Connect" | "Connecting" | "Deploying account">("Connect");

  const provider = new RpcProvider({
    chainId: chainId,
    nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
    headers: JSON.parse(process.env.NEXT_PUBLIC_RPC_HEADERS || "{}"),
  });

  const argentWebWallet = ArgentWebWallet.init({
    appName: "Dewordle",
    environment: envName || "sepolia",
    sessionParams: {
      allowedMethods: [
        {
          contract: DUMMY_CONTRACT_ADDRESS,
          selector: DUMMY_CONTRACT_ENTRYPOINT,
        },
      ],
      validityDays: Number(process.env.NEXT_PUBLIC_VALIDITY_DAYS) || undefined,
    },
    webwalletTheme: "dark",
    paymasterParams,
  });

  // Auto-connect on component mount
  useEffect(() => {
    if (!argentWebWallet) {
      return;
    }

    argentWebWallet
      .connect()
      .then(async (res) => {
        if (!res) {
          console.log("Not connected");
          return;
        }

        console.log("Connected to ArgentWebWallet", res);
        const { account, callbackData, approvalTransactionHash } = res;

        if (account.getSessionStatus() !== "VALID") {
          console.log("Session is not valid");
          return;
        }

        console.log("Approval transaction hash", approvalTransactionHash);
        console.log("Callback data", callbackData);

        if (approvalTransactionHash && provider) {
          console.log("Waiting for approval");
          await provider.waitForTransaction(approvalTransactionHash);
        }

        setAccount(account);
      })
      .catch((err) => {
        console.error("Failed to connect to ArgentWebWallet", err);
      });
  }, []);

  const handleConnect = async () => {
    try {
      console.log("Starting connection...");

      if (!provider) {
        throw new Error("No provider provided");
      }

      setConnectStatus("Connecting");

      // Always include approvals
      const response = await argentWebWallet?.requestConnection({
        callbackData: "custom_callback_data",
        approvalRequests: [
          {
            tokenAddress: "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
            amount: BigInt("100000000000000000").toString(),
            spender: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          },
        ],
      });

      if (response) {
        const { account: sessionAccount } = response;
        const isDeployed = await sessionAccount.isDeployed();

        if (response.deploymentPayload && !isDeployed && response.approvalRequestsCalls && paymasterParams) {
          console.log("Deploying an account");
          setConnectStatus("Deploying account");

          const resp = await deployAndExecuteWithPaymaster(
            sessionAccount,
            paymasterParams,
            response.deploymentPayload,
            response.approvalRequestsCalls
          );

          if (resp) {
            console.log("Deployment hash: ", resp.transaction_hash);
            await provider.waitForTransaction(resp.transaction_hash);
            console.log("Account deployed");
          }
        } else if (response.approvalRequestsCalls) {
          console.log("Sending Approvals");
          const { transaction_hash } = await sessionAccount.execute(response.approvalRequestsCalls);
          console.log("Approvals hash: ", transaction_hash);
          await provider.waitForTransaction(transaction_hash);
          console.log("Approvals minted", transaction_hash);
        }

        if (response.approvalTransactionHash) {
          console.log("Waiting for approval", response.approvalTransactionHash);
          await provider.waitForTransaction(response.approvalTransactionHash);
          console.log("Approvals minted", response.approvalTransactionHash);
        }

        setAccount(sessionAccount);
        setConnectStatus("Connect");

        // Fetch counter after connection
        const newCounter = await fetchCounter(sessionAccount);
        setCounter(newCounter);
      } else {
        console.log("requestConnection response is undefined");
        setConnectStatus("Connect");
      }
    } catch (err: any) {
      console.error(err);
      setConnectStatus("Connect");
    }
  };

  // Update fetchCounter to use the proper contract call as in demo
  const fetchCounter = useCallback(async (account?: SessionAccountInterface) => {
    if (!account || !provider) {
      return BigInt(0);
    }

    try {
      const [counter] = await provider.callContract({
        contractAddress: DUMMY_CONTRACT_ADDRESS,
        entrypoint: "get_number",
        calldata: [account?.address],
      });

      return BigInt(counter);
    } catch (error) {
      console.error("Error fetching counter:", error);
      return BigInt(0);
    }
  }, [provider]);

  // Fetch counter whenever account changes
  useEffect(() => {
    fetchCounter(account).then(setCounter);
  }, [account, fetchCounter]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4">
      {!account ? (
        <button
          onClick={handleConnect}
          disabled={connectStatus !== "Connect"}
          className={`
            flex justify-center items-center h-12
            bg-indigo-600 hover:bg-indigo-700
            text-white font-semibold
            rounded-lg shadow-md
            transition-all duration-200
            ${connectStatus !== "Connect" ? 'opacity-70 cursor-not-allowed' : 'hover:transform hover:scale-[1.02]'}
          `}
        >
          {connectStatus === "Connecting" && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {connectStatus}
        </button>
      ) : (
        <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg text-white">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium">Connected</span>
          </div>

          <div className="mt-2">
            <div className="text-sm text-gray-400">Wallet Address</div>
            <div className="font-mono text-sm bg-gray-700 p-2 rounded mt-1 break-all">
              {account.address}
            </div>
          </div>

          {counter !== undefined && (
            <div className="mt-2">
              <div className="text-sm text-gray-400">Transaction Count</div>
              <div className="font-mono text-lg font-semibold">{counter.toString()}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArgentInvisibleWalletButton;