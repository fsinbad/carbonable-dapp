import { ArrowTopRightOnSquareIcon, MinusIcon, PaperAirplaneIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useFetcher, useTransition } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { MintButton, WhitelistButton } from "../Buttons/ActionButton";
import { PlusIconBlack } from "../Icons/PlusIcon";
import moment from "moment";

import type { Project } from "@prisma/client";
import { useMaxBuyPerTx } from "~/hooks/minter";
import { useAccount, useConnectors, useStarknetExecute, useTransactionReceipt } from "@starknet-react/core";
import { toFelt } from "starknet/utils/number";
import { TxStatus } from "~/utils/blockchain/status";
import { MintingComponent } from "./TransactionComponents";

function EstimatedAPR({estimatedAPR}: {estimatedAPR: string}) {
    return (
        <div className="font-inter text-green text-xs 2xl:text-sm">Estimated APR {estimatedAPR}</div>
    )
}

export function ReportComponent() {
    return (
        <>
            <div className="font-trash font-bold text-xl uppercase 2xl:text-2xl">Follow the progress</div>
            <div className="font-americana font-light text-lg uppercase 2xl:text-xl">of the project</div>
            <div className="mt-6"><a href="/" target="_blank" className="bg-green-blue font-inter uppercase text-black/50 px-8 py-4 rounded-full text-sm font-semibold">Impact report</a></div>
        </>
    )
}

export function SimularorComponent() {
    return (
        <>
            <div className="font-trash font-bold text-base uppercase 2xl:text-xl">Estimate your gain for you</div>
            <div className="font-americana font-light text-base uppercase 2xl:text-xl">and the planet</div>
            <div className="mt-4"><a href="https://carbonable.io#simulator" target="_blank" className="bg-green-blue font-inter uppercase text-black/50 px-8 py-4 rounded-full text-sm font-semibold flex items-center justify-center w-fit" rel="noreferrer">Simulator <ArrowTopRightOnSquareIcon className="w-4 ml-4 text-black/50" /></a></div>
        </>
    )
}

export function MintComponent({estimatedAPR, price, paymentTokenSymbol, minterContract, paymentTokenAddress, publicSaleOpen, paymentTokenDecimals, refreshProjectTotalSupply, selectedNetwork, updateProgress}: any) {
    const [amount, setAmount] = useState(1);
    const { maxBuyPerTx } = useMaxBuyPerTx(minterContract, selectedNetwork);
    const { connect, available } = useConnectors();
    const { status } = useAccount();
    const [txHash, setTxHash] = useState("");
    const { data: dataTx } = useTransactionReceipt({ hash: txHash, watch: true });
    const [isMinting, setIsMinting] = useState(false);

    const calls = [
        {
            contractAddress: paymentTokenAddress,
            entrypoint: 'approve',
            calldata: [toFelt(minterContract), (amount * price * Math.pow(10, parseInt(paymentTokenDecimals))), '0']  
        },
        {
            contractAddress: minterContract,
            entrypoint: publicSaleOpen ? 'public_buy' : 'whitelist_buy',
            calldata: [toFelt(amount)]  
        },
    ];

    const { execute, data: dataExecute } = useStarknetExecute({ calls,
        metadata: {
            method: 'Approve and buy tokens',
            message: 'Approve and buy tokens',
        } });

    const connectAndExecute = () => {
        if (status === 'disconnected') {
            connect(available[0]);
        }

        execute();
    }

    useEffect(() => {
        if (amount < 1){
            setAmount(1);
        }
        if (amount > parseInt(maxBuyPerTx)) {
            setAmount(maxBuyPerTx);
        }
    }, [amount, maxBuyPerTx]);

    useEffect(() => {
        setTxHash(dataExecute ? dataExecute.transaction_hash : "");
    }, [dataExecute])

    useEffect(() => {
        updateProgress(dataTx?.status ? dataTx.status : TxStatus.NOT_RECEIVED);

        setIsMinting(dataTx?.status === TxStatus.RECEIVED || dataTx?.status === TxStatus.PENDING ? true : false);
        
        if (dataTx?.status === TxStatus.ACCEPTED_ON_L2) {
            refreshProjectTotalSupply();
        }
    }, [dataTx, refreshProjectTotalSupply, updateProgress]);

    return (
        <div>
            <div className={isMinting ? "w-full flex items-center justify-start" : "w-full flex items-start justify-start" }>
                <div className="w-4/12 flex items-center justify-center bg-black rounded-full text-white p-2 border border-white xl:w-4/12 2xl:max-w-[140px]">
                    { !isMinting && <MinusIcon className="w-6 bg-white p-1 rounded-full text-black cursor-pointer hover:bg-beaige" onClick={() => amount > 1 ? setAmount(amount - 1) : 1} /> }
                    { isMinting && <MinusIcon className="w-6 bg-grey p-1 rounded-full text-black" /> }
                    <div className="w-8/12 text-center">
                        <input className="bg-transparent w-full text-center outline-none" type="number" value={amount} readOnly name="amount" aria-label="Amount" aria-describedby="error-message" />
                    </div>
                    { !isMinting && <PlusIcon className="w-6 bg-white p-1 rounded-full text-black cursor-pointer hover:bg-beaige" onClick={() => setAmount(amount + 1)} /> }
                    { isMinting && <PlusIcon className="w-6 bg-grey p-1 rounded-full text-black" /> }
                </div>
                {!isMinting && 
                    <div className="w-8/12 flex flex-wrap items-center justify-center pl-4 xl:w-8/12 xl:justify-start xl:pl-6">
                        <MintButton className="min-h-[42px] 2xl:min-w-[220px]" onClick={connectAndExecute}>Buy now - {(amount * price).toFixed(2)}&nbsp;{paymentTokenSymbol}</MintButton>
                        <input hidden type="number" value={(amount * price)} readOnly name="price" aria-label="Price" />
                        <div className="mt-2 xl:w-full xl:text-left xl:pl-7 2xl:pl-12"><EstimatedAPR estimatedAPR={estimatedAPR} /></div>
                    </div>
                }
                {isMinting && <div className="w-8/12 flex flex-wrap items-center justify-center pl-8 xl:w-8/12 xl:justify-start xl:pl-6">
                    <MintingComponent />
                </div>}
            </div>
        </div>
    )
}

export function SoldoutComponent({saleDate, estimatedAPR}: Project) {
    return (
        <div className="w-full flex items-center justify-center xl:justify-start">
            <div className="w-7/12 xl:w-[11rem]">
                <div className="flex items-center justify-start font-inter font-bold text-xs text-black bg-white rounded-md py-1 px-4 w-10/12 xl:w-full xl:text-sm">
                    <div>Soldout</div>
                    <PlusIconBlack className="w-2 mx-1"></PlusIconBlack>
                    <div>{moment(saleDate).format("MM.DD.YYYY").toString()}</div>
                </div>
            </div>
            
            <div className="w-5/12 text-center xl:text-left xl:pl-8"><EstimatedAPR estimatedAPR={estimatedAPR} /></div>
        </div>
    )
}

export function ComingSoonComponent({saleDate, estimatedAPR}: Project) {
    const newsletter = useFetcher();
    const ref = useRef<HTMLInputElement>(null);

    const transition = useTransition();
    const state: "idle" | "success" | "error" | "submitting" = transition.submission
        ? "submitting"
        : newsletter?.data?.message
        ? "success"
        : newsletter?.data?.error
        ? "error"
        : "idle";
    return (
        <div>
            <div className="w-full flex items-center justify-start">
                <div className="flex items-center justify-center font-inter font-bold text-xs text-black bg-green-blue rounded-md w-7/12 py-1 px-2 xl:w-[11rem]">
                    <div>Coming soon</div>
                    <PlusIconBlack className="w-2 mx-1"></PlusIconBlack>
                    <div>{moment(saleDate).format("MM.DD.YYYY").toString()}</div>
                </div>
                <div className="w-5/12 text-center xl:text-left xl:pl-4 2xl:pl-8"><EstimatedAPR estimatedAPR={estimatedAPR} /></div>
            </div>
            <newsletter.Form
                    method="post"
                    action="/newsletter/subscribe"
                    >
                    <div className={state === 'error' ? 'bg-white mt-4 rounded-full w-full pl-4 pr-2 py-1 mx-auto flex border-2 border-red-400 2xl:max-w-[400px] 2xl:ml-0' : 'bg-white mt-4 rounded-full w-full pl-4 pr-2 py-1 mx-auto flex lg:w-full border-2 2xl:max-w-[400px] 2xl:ml-0'}>
                        <input type="email" className="text-sm text-slate-500 outline-0 w-full" name="email" ref={ref} placeholder="Enter your email" aria-label="Email address" aria-describedby="error-message" />
                        <WhitelistButton className="bg-green flex items-center text-xs w-min text-right" onClick={newsletter.submit}>
                            <PaperAirplaneIcon className={state === 'submitting' ? 'lg:hidden w-4 h-4 text-white animate-pulse' : 'lg:hidden w-4 h-4 text-white'} />
                            <div className="hidden uppercase lg:block min-w-max">Be reminded</div>
                        </WhitelistButton>
                    </div>
                    <div id="error-message" className={state === "success" ? 'text-green text-sm mt-1 mx-auto w-full lg:w-6/12 lg:pl-6 text-left ml-2' : "text-red-600 mt-1 mx-auto w-full text-sm lg:w-6/12 text-left lg:pl-6 ml-2"}>{state === "error" ? newsletter?.data?.error : newsletter?.data?.message}</div>
                </newsletter.Form>
        </div>
    )
}
