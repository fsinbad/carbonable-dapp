import { type Token } from "~/types/tokens";
import { useProject } from "../ProjectWrapper";
import { useMemo } from "react";

export default function PaymentDetails({ selectedToken, conversionRate, finalTokenAmount, priceInUsd, avnuFees }: { selectedToken: Token, conversionRate: string, finalTokenAmount: number | string, priceInUsd: string, avnuFees: number | undefined}) {
    const { boost } = useProject();
    const boostValue = useMemo(() => {
        if (boost === undefined) return 0;
        return parseInt(boost.boost) / 100;
    }, [boost]);

    return (
        <div className="border rounded-lg border-opacityLight-20">
            <div className="flex justify-between bg-opacityLight-5 py-2 px-3">
                <div className="uppercase text-sm flex-grow">Payment details</div>
            </div>
            <div className="py-4 px-6 border-t border-opacityLight-20">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-left">
                        Conversion rate
                    </div>
                    <div className="text-sm text-right text-neutral-300 font-light">
                        1 SHARE {selectedToken.symbol === 'USDC' ? <span>=</span> : <span>&cong;</span>} {conversionRate} {selectedToken.symbol}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-left">
                        Fees
                    </div>
                    <div className="text-sm text-right text-neutral-300 font-light">
                        {avnuFees === undefined ? 'free' : '$' + avnuFees.toFixed(2)}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-left flex items-center">
                        Points
                        {boostValue !== 0 && <img src={`/assets/images/leaderboard/boost_${boostValue}.svg`} alt="Boost" className="w-20 ml-2" />}
                    </div>
                    <div className="text-sm text-right text-neutral-300 font-light">
                        {boost?.total_score}
                    </div>
                </div>
            </div>
            <div className="flex justify-between py-3 px-6 border-t border-opacityLight-20">
                <div className="text-sm text-left">
                    Price 
                    {selectedToken.powered_by !== undefined && 
                        <span className="text-xs text-neutral-200"> (inc. fees)</span>
                    }
                </div>
                <div className="text-sm text-right text-neutral-300 font-light">
                    {typeof finalTokenAmount === 'number' ? finalTokenAmount.toFixed(2) : finalTokenAmount} {selectedToken.symbol} {finalTokenAmount !== 'n/a' && <span>(&cong; ${priceInUsd})</span>}
                </div>
            </div>
        </div>
    )
}