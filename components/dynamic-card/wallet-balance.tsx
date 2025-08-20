"use client";

import { TokenBalance } from "@/lib/dynamic";
import { Skeleton } from "../ui/skeleton";
import { forwardRef } from "react";

export interface WalletBalanceRef {
  refreshBalance: () => void;
}

interface WalletBalanceProps {
  isLoading: boolean;
  walletBalance: TokenBalance | undefined;
}

const WalletBalance = forwardRef<WalletBalanceRef, WalletBalanceProps>(
  ({ isLoading, walletBalance }, _) => {
    return (
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          Wallet Balance
        </div>
        <span className="text-sm font-medium text-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            `${walletBalance?.balance.toLocaleString() || "0"} rUSDC`
          )}
        </span>
      </div>
    );
  }
);

WalletBalance.displayName = "WalletBalance";

export default WalletBalance;
