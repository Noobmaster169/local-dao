"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from "react-country-region-selector";
import { CgSpinner } from "react-icons/cg";

import {
  uploadFile,
  uploadJSON,
  linkBuilder,
  fetchJSON,
  fetchLinkData,
} from "@/utils/ipfs";
import { getContract, createThirdwebClient } from "thirdweb";
import ABI from "@/contract/verifier/abi.json";
import { baseSepolia } from "@/utils/chain";
import JSONUploader from "./JSONUploader";
import {
  prepareContractCall,
  toWei,
  sendAndConfirmTransaction,
  sendTransaction,
} from "thirdweb";
import { Account, createWallet } from "thirdweb/wallets";
import { ThirdwebSDK, getProviderFromRpcUrl} from "@thirdweb-dev/sdk";

const client: any = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
});

const contract: any = getContract({
  client,
  chain: baseSepolia,
  address: "0xD0940e213D8dD9EA159ed2C084e69760065cCA1f",
  abi: ABI as any,
});

type props = {
  hasUploaded: boolean;
  setHasUploaded: React.Dispatch<React.SetStateAction<boolean>>;
  country: string;
  setCountry: React.Dispatch<React.SetStateAction<string>>;
  region: string;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
};

const UploadJSONForm = ({
  hasUploaded,
  setHasUploaded,
  country,
  setCountry,
  region,
  setRegion,
}: props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  // const [result, setResult] = useState<ContractResponse | null>(null);
  // const [error, setError] = useState<string | null>(null);

  const [proof, setProof] = useState<any>("");
  const [formData, setFormData] = useState({
    title: "",
    files: [] as File[],
    imageUrl: "",
    description: "",
  });

  const formSchema = z.object({
    country: z.string(),
    region: z.string(),
    imageUrl: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "Malaysia",
      region: "",
      imageUrl: "",
    },
  });

  const uploadToIpfs = async (file: any) => {
    console.log("Uploading file to ipfs");
    console.log(file);
    setIsUploading(true);
    const resData = await uploadFile(file);
    const imageLink = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${resData}`;
    console.log("IPFS Hash is:", imageLink);
    form.setValue("imageUrl", imageLink);
    setIsUploading(false);
  };

  //.const account = useActiveAccount();
  
  // async function verifyIdentity(){
  //   alert("Verifying Identity")
  //   try {
  //     // Load environment variables from the .env.local file
  //     const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  //     const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;

  //     if (!rpcUrl || !privateKey) {
  //       throw new Error("Missing RPC URL or private key in environment variables");
  //     }

  //     // Create a provider and wallet
  //     const provider = getProviderFromRpcUrl(rpcUrl, 534351);
  //     const wallet = new ethers.Wallet(privateKey, provider);

  //     // Initialize the Thirdweb SDK with the wallet
  //     const sdk = new ThirdwebSDK(wallet);

  //     // Get the contract (replace with your contract address)
  //     const contract = await sdk.getContract("0xD0940e213D8dD9EA159ed2C084e69760065cCA1f");

  //     // Call the contract function (replace with your function name and arguments)
  //     const response = await contract.call("addUser", [account?.address]);

  //     // Assuming the function returns a response that matches the ContractResponse type
  //     setResult({
  //       success: true,
  //       message: `Transaction successful: ${JSON.stringify(response)}`,
  //     });
  //   } catch (err: any) {
  //     setError(`Error calling function: ${err.message}`);
  //   }
  // }
  
  async function onSubmit(values: z.infer<typeof formSchema>): Promise<void> {
    //console.log(uploadToIpfs(form.getValues("imageUrl")))
    console.log("Submitted values:", values);
    setIsBuilding(true);
    if(!proof){alert("Please upload a file"); return}

    // const _identity = new Identity();
    // let data = {
    //   proof: JSON.parse(proof),
    //   identityCommitment: {
    //       commit: _identity.commitment.toString()
    //   },
    // }
    // let response = await fetch("api/tlsn", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    // })

    // if (response.status === 200) {
    //   //await verifyIdentity();
      setHasUploaded(true);
      setCountry(values.country);
      setRegion(values.region);
    // }else{
    //   alert("Error in generating proof")
    // }
    setIsBuilding(false);
  }

  return (
    <div className="w-full h-fit pt-6 px-8 pb-10 font-geist-mono">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-clear h-full flex flex-col gap-y-8 w-full"
        >
          <div className="flex gap-6 justify-between p-8 pb-0">
            <div className="flex h-[400px] w-[400px] max-w-[400px] max-h-[400px] aspect-square">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <JSONUploader
                        imageUrl={formData.imageUrl}
                        setFiles={setFiles}
                        uploadToIpfs={uploadToIpfs}
                        setProof={setProof}
                        onFieldChange={(url: string) => {
                          setFormData((prevState) => ({
                            ...prevState,
                            imageUrl: url,
                          }));
                          field.onChange(url); // Ensure the form state is updated
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full flex flex-col h-full gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="px-1">Country:</FormLabel>
                    <FormControl>
                      <CountryDropdown
                        {...field}
                        onChange={(val) => field.onChange(val)}
                        classes="bg-black bg-opacity-40 w-full text-white p-3 w-full rounded-lg border-b-[##2EF2FF] border-t-0 border-l-0 border-r-0 font-geist-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Region */}
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="px-1 flex-col">Region:</FormLabel>
                    <FormControl>
                      <RegionDropdown
                        {...field}
                        country={form.getValues("country")}
                        classes="bg-black bg-opacity-40 w-full text-white p-3 rounded-lg w-full border-b-[##2EF2FF] border-t-0 border-l-0 border-r-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="w-full h-full justify-center items-center flex">
            <Button
              className={`font-semibold p-2 py-6 rounded-2xl flex items-center justify-center w-1/4 text-lg text-white bg-[#40A4FF] 
                shadow-[0_0_30px_#40A4FF] drop-shadow-xl ${
                  isBuilding || isUploading
                    ? "opacity-50 pointer-events-none"
                    : "opacity-100"
                } hover:bg-opacity-100 flex gap-2`}
              type="submit"
            >
              {isBuilding || isUploading ? "Uploading" : "Verify"}
              {isBuilding || isUploading ? (
                <div className="animate-spin">
                  <CgSpinner />
                </div>
              ) : (
                ""
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UploadJSONForm;
