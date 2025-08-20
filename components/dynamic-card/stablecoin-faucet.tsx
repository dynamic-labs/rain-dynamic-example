"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMintTokens } from "@/hooks/use-mint-tokens";

interface StablecoinFaucetProps {
  onMintSuccess?: () => void;
}

export default function StablecoinFaucet({
  onMintSuccess,
}: StablecoinFaucetProps) {
  const [fundingWallet, setFundingWallet] = useState(false);

  const { mintTokens, resetMint, isPending } = useMintTokens({
    onMintSuccess: () => {
      setFundingWallet(false);
      onMintSuccess?.();
      resetMint();
    },
    onMintError: () => setFundingWallet(false),
  });

  const handleFundWallet = () => {
    setFundingWallet(true);
    mintTokens({ amountDollars: 100 });
  };

  return (
    <div className="bg-muted/20 border border-dashed border-muted-foreground/15 rounded-md p-2.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground">
            Need Test Funds?
          </span>
          <span className="text-[10px] text-muted-foreground">
            Get $100 USDC for testing
          </span>
        </div>
        <Button
          onClick={handleFundWallet}
          variant="outline"
          size="sm"
          disabled={isPending || fundingWallet}
          className="shrink-0 h-7 px-2 text-xs"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Requesting...
            </>
          ) : (
            <>
              Request Funds
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
