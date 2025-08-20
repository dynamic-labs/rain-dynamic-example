"use client";

import { RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

import { Skeleton } from "../ui/skeleton";
import { UserCreditBalanceResponse } from "@/lib/rain";
import { cn } from "@/lib/utils";
import { formatBalance } from "@/utils/format-balance";

export default function CardBalance() {
  const authToken = getAuthToken();
  const queryClient = useQueryClient();

  const { data, isLoading, isRefetching, refetch } = useQuery<{
    balance: UserCreditBalanceResponse;
  }>({
    queryKey: ["balance"],
    queryFn: () =>
      fetch("/api/balance", {
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => res.json()),
  });

  const handleRefresh = async () => {
    // Refetch both balance and transactions
    await Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    ]);
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">Available Balance</span>
      <div className="text-xl font-semibold text-foreground">
        {isLoading || isLoading === undefined ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <div className="flex items-center gap-2">
            {formatBalance(data?.balance?.spendingPower || 0)}
            <button
              className="cursor-pointer"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 text-muted-foreground",
                  isRefetching && "animate-spin"
                )}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
