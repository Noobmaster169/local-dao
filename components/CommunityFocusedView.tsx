import React from "react";
import Modal from "react-modal";
import { Styles } from "react-modal";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ICommunity } from "@/models/community.models";
import { IoMdClose } from "react-icons/io";
import OptionTag from "./OptionTag";
import Button from "./Button";
import { CgSpinner } from "react-icons/cg";
import CommunityReview from "./CommunityReview";
import CommunityCard from "./CommunityCard";
import {
  getContract,
  createThirdwebClient,
  readContract,
  Chain,
} from "thirdweb";
import ABI from "@/contract/localDAO/abi.json";
import { baseSepolia } from "@/utils/chain";
import {
  prepareContractCall,
  toWei,
  sendAndConfirmTransaction,
  sendTransaction,
} from "thirdweb";
import { Account, createWallet } from "thirdweb/wallets";

const client: any = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
});

const contract: any = getContract({
  client,
  chain: baseSepolia,
  address: "0x39683204f4822A75A3264a9e6583e9105fAD3fAc",
  abi: ABI as any,
});

type CommunityFocusedViewProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  community: ICommunity;
};

const CommunityFocusedView = ({
  community,
  isOpen,
  setIsOpen,
}: CommunityFocusedViewProps) => {
  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      width: "auto",
      maxWidth: "1600px",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#FFFFFF",
      border: "3px solid #2EF2FF",
      borderRadius: "10px", // Add this line for rounded border
      padding: "0px",
      boxShadow: "0 0 20px 5px #40A4FF",
      zIndex: 1001,
    },
  };

  // border-[#40A4FF] border-[3px] shadow-[0_0_20px_#40A4FF]
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reviewIsOpen, setReviewIsOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  const vote = async () => {
    const wallet = createWallet("io.metamask");
    const account = await wallet.connect({ client });
    console.log("Account:", account);
    const transaction: any = await prepareContractCall<any, any>({
      contract: contract,
      method: "vote",
      params: [BigInt(1), BigInt(1)],
    });
    console.log(transaction);

    const transactionResult = await sendTransaction({
      transaction,
      account,
    });
    console.log(transactionResult);
    // const transactionReceipt = await sendAndConfirmTransaction({
    //   account,
    //   transaction,
    // });
    // alert(transactionReceipt);
    console.log("Done");
  };

  useEffect(() => {
    console.log(selectedOption);
  }, [selectedOption]);

  return (
    <div className="gap-4 flex-col">
      <Modal
        isOpen={isOpen}
        ariaHideApp={false}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles as Styles}
      >
        <div className="flex flex-col gap-4 h-full w-full justify-center items-center bg-[#050915]">
          <div className="flex flex-grow h-fit w-[100vh] transform transition hover:shadow-lg p-16 pb-8">
            {/* Image */}
            <Image
              src={community.imageUrl}
              alt="coverImage"
              width={250}
              height={250}
              className="h-[250px] w-[250px] object-cover"
            />
            {/* Text */}
            <div className="flex flex-col pb-4 px-8 gap-1 font-geist-mono w-full h-full">
              <h1 className="text-2xl font-semibold text-p4">
                {community.surveyTitle}
              </h1>
              <p className="text-md font-semibold text-p5">
                Location:{" "}
                <span className="text-p4">
                  {community.region}, {community.country}
                </span>
              </p>
              <p className="text-md pt-2 text-primary text-p5">
                {community.description}
              </p>
              <div className="w-full h-full grid grid-cols-2 py-4 gap-4">
                {community.options.map((option, index) => (
                  <OptionTag
                    key={index}
                    option={option}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="pb-16 w-fit h-fit flex gap-4">
            {!isOwner && <button
              className={`font-semibold p-2 py-4 rounded-2xl flex items-center justify-center w-full text-lg text-white bg-[#40A4FF] 
              shadow-[0_0_30px_#40A4FF] drop-shadow-xl ${!selectedOption ? "opacity-50 pointer-events-none" : "opacity-100"} hover:bg-opacity-100 flex gap-2`}
              onClick={() => {setIsOpen(false)}}
              >
                {false ? "Sending" : "Send Transaction"}
                {false && <div className="animate-spin">
                <CgSpinner />
                </div>}
            </button>}
            {isOwner && <button
              className={`font-semibold px-3 py-4 rounded-2xl flex items-center justify-center w-full text-lg text-white bg-green-400 
              shadow-[0_0_20px_#4ade80] drop-shadow-xl hover:bg-opacity-100 gap-2`}
              onClick={() => {setReviewIsOpen(true)}}
              >
                Open Result
              </button>}
          </div>
        </div>
      </Modal>
      <CommunityReview isOpen={reviewIsOpen} setIsOpen={setReviewIsOpen} community={community} />
    </div>
  );
};

export default CommunityFocusedView;
