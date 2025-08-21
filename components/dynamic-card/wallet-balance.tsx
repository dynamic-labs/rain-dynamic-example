"use client";

import { TokenBalance } from "@/lib/dynamic";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface WalletBalanceProps {
  isLoading: boolean;
  walletBalance: TokenBalance | undefined;
  isRefetching: boolean;
  handleRefresh: () => void;
}

export default function WalletBalance({
  isLoading,
  walletBalance,
  isRefetching,
  handleRefresh,
}: WalletBalanceProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-muted-foreground">
        Wallet Balance
      </div>
      <span className="text-sm font-medium text-foreground">
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <div className="flex items-center gap-2">
            {`${walletBalance?.balance.toLocaleString() || "0"} rUSDC`}
            <button
              className="cursor-pointer"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw
                className={cn(
                  "w-3 h-3 text-muted-foreground",
                  isRefetching && "animate-spin"
                )}
              />
            </button>
          </div>
        )}
      </span>
    </div>
  );
}
