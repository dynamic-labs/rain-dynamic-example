"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  getAuthToken,
  useDynamicContext,
  useTokenBalances,
} from "@/lib/dynamic";
import { UserDepositContractResponse } from "@/lib/rain";
import { useDepositToken } from "@/hooks/use-deposit-tokens";
import { getContractAddress } from "@/constants";
import WalletBalance from "./wallet-balance";
import StablecoinFaucet from "./stablecoin-faucet";

const PRESET_AMOUNTS = [5, 10, 25];

function DepositAccountLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Loading deposit account...
        </p>
        <p className="text-xs text-muted-foreground/70">
          Setting up your deposit account
        </p>
      </div>
    </div>
  );
}

function DepositAccountPending({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Deposit Account Pending Creation
            </span>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/70 leading-relaxed">
              Your deposit account is being set up. Please wait a few minutes
              and try again.
            </p>
          </div>
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FundCard() {
  const { sdkHasLoaded, primaryWallet, network } = useDynamicContext();
  const { depositToken } = useDepositToken();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const rusdcAddress = useMemo(() => {
    if (!network) return undefined;
    return getContractAddress(network, "RUSDC");
  }, [network]);

  const {
    tokenBalances,
    isLoading: isLoadingBalances,
    fetchAccountBalances,
  } = useTokenBalances({
    networkId: Number(network),
    accountAddress: primaryWallet?.address,
    tokenAddresses: rusdcAddress ? [rusdcAddress] : [],
  });

  const walletBalance = useMemo(() => {
    return tokenBalances?.find(
      (t) => t.address.toLowerCase() === rusdcAddress?.toLowerCase()
    );
  }, [tokenBalances]);

  const {
    data,
    isLoading: isLoadingContracts,
    isError: isContractError,
    refetch,
  } = useQuery<{
    contract: UserDepositContractResponse;
  }>({
    queryKey: ["contracts", primaryWallet?.address, network],
    enabled: !!sdkHasLoaded && !!primaryWallet && !!network,
    retry: false,
    queryFn: async () => {
      const authToken = getAuthToken();
      const response = await fetch(`/api/contracts?chain=${network}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) throw new Error("Deposit account pending creation");
      return response.json();
    },
  });

  // Mutation for funding the card
  const fundCardMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!data?.contract.depositAddress || !primaryWallet || !rusdcAddress) {
        throw new Error("Missing required data");
      }

      await depositToken({
        amount: amount,
        decimals: 6,
        token: rusdcAddress,
        to: data.contract.depositAddress,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch transactions and balance queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });

      // Reset form on success
      setAmount("");
      setIsModalOpen(false);
      setError("");
    },
    onError: (error) => {
      console.error("Transfer failed:", error);
      setError("Transfer failed. Please try again.");
    },
  });

  const validateAmount = (value: string): boolean => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (num > (walletBalance?.balance || 0)) {
      setError(`Maximum deposit is ${walletBalance?.balance || 0}`);
      return false;
    }
    if (num < 1) {
      setError("Minimum deposit is $1");
      return false;
    }
    setError("");
    return true;
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const decimalCount = (cleanValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;

    // Limit to 2 decimal places
    const parts = cleanValue.split(".");
    if (parts[1] && parts[1].length > 2) return;

    setAmount(cleanValue);
    if (cleanValue) {
      validateAmount(cleanValue);
    } else {
      setError("");
    }
  };

  const handlePresetAmount = (presetAmount: number | "max") => {
    if (presetAmount === "max") {
      const maxAmount = walletBalance?.balance || 0;
      setAmount(maxAmount.toString());
    } else {
      setAmount(presetAmount.toString());
    }
    setError("");
    setShowCustomInput(false);
  };

  const handleFundCard = async () => {
    if (!validateAmount(amount)) return;
    if (!data?.contract.depositAddress) return;
    if (!primaryWallet) return;

    fundCardMutation.mutate(amount);
  };

  const canSubmit =
    amount && !error && !fundCardMutation.isPending && !isLoadingContracts;

  const handleOpenModal = () => {
    if (!sdkHasLoaded || isLoadingContracts) return;
    fetchAccountBalances(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAmount("");
    setError("");
    setShowCustomInput(false);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-14 w-14 transition-all duration-200 ease-out hover:scale-110 hover:shadow-sm hover:shadow-primary/10 active:scale-105"
          onClick={handleOpenModal}
          disabled={!sdkHasLoaded || isLoadingContracts}
        >
          {!sdkHasLoaded || isLoadingContracts ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </Button>
        <span className="text-xs text-foreground">Add Funds</span>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Funds"
        description="Choose an amount to deposit to your card"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <WalletBalance
              isLoading={sdkHasLoaded && isLoadingBalances}
              walletBalance={walletBalance}
              isRefetching={isLoadingBalances}
              handleRefresh={() => fetchAccountBalances(true)}
            />
            <StablecoinFaucet
              onMintSuccess={() => fetchAccountBalances(true)}
            />
          </div>
          {/* Amount Selection */}
          {(() => {
            if (isLoadingContracts) return <DepositAccountLoading />;
            if (isContractError) {
              return <DepositAccountPending onRetry={refetch} />;
            }
            return (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {PRESET_AMOUNTS.map((presetAmount) => (
                      <Button
                        key={presetAmount}
                        variant={
                          amount === presetAmount.toString() && !showCustomInput
                            ? "default"
                            : "outline"
                        }
                        size="lg"
                        onClick={() => handlePresetAmount(presetAmount)}
                        className="h-12"
                        disabled={
                          fundCardMutation.isPending ||
                          presetAmount > (walletBalance?.balance || 0)
                        }
                      >
                        ${presetAmount}
                      </Button>
                    ))}
                    <Button
                      key="max"
                      variant={
                        amount === (walletBalance?.balance || 0).toString() &&
                        !showCustomInput
                          ? "default"
                          : "outline"
                      }
                      size="lg"
                      onClick={() => handlePresetAmount("max")}
                      className="h-12"
                      disabled={
                        fundCardMutation.isPending || !walletBalance?.balance
                      }
                    >
                      Max
                    </Button>
                  </div>

                  {/* Custom Amount Button or Input */}
                  {!showCustomInput ? (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setShowCustomInput(true);
                        setAmount("");
                      }}
                      className="h-12 w-full"
                      disabled={
                        fundCardMutation.isPending || !walletBalance?.balance
                      }
                    >
                      Enter custom amount
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <Input
                          type="text"
                          placeholder="Custom amount"
                          value={amount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="pl-8 h-12 text-center"
                          autoFocus
                          disabled={fundCardMutation.isPending}
                        />
                      </div>
                      {error && (
                        <p className="text-sm text-red-500 text-center">
                          {error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1 h-12"
                    disabled={fundCardMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFundCard}
                    disabled={!canSubmit}
                    className="flex-1 h-12"
                  >
                    {fundCardMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>Deposit ${amount || "0"}</>
                    )}
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      </Modal>
    </>
  );
}
