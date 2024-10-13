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

import Link from "next/link";

import FileUploader from "@/components/FileUploader";
import {
  uploadFile,
  uploadJSON,
  linkBuilder,
  fetchJSON,
  fetchLinkData,
} from "@/utils/ipfs";
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
  address: "0x8D888473bCdEa4E21da862FA2e2637e3c2ae86fB",
  abi: ABI as any,
});

const SurveyForm = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [amount, setAmount] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    files: [] as File[],
    imageUrl: "",
    description: "",
  });

  useEffect(() => {
    form.setValue("options", options);
  }, [options, setNewOption]);

  const formSchema = z.object({
    surveyTitle: z.string(),
    description: z.string(),
    country: z.string(),
    region: z.string(),
    imageUrl: z.string(),
    options: z.array(z.string()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveyTitle: "",
      description: "",
      country: "Malaysia",
      region: "",
      imageUrl: "",
      options: [],
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

  async function onSubmit(values: z.infer<typeof formSchema>): Promise<void> {
    //console.log(uploadToIpfs(form.getValues("imageUrl")))
    console.log("Submitted values:", values);
    // values.name = values.surveyTitle;
    setIsBuilding(true);
    const jsonUpload = await uploadJSON(values);
    const IPFSLink = await linkBuilder(jsonUpload);
    console.log("Successfully uploaded and link built");
    console.log(IPFSLink);
    await createVoting(IPFSLink);
    setIsBuilding(false);
    router.push("/community");
  }

  const createVoting = async (uri: string) => {
    const wallet = createWallet("io.metamask");
    const account = await wallet.connect({ client });
    const transaction: any = await prepareContractCall<any, any>({
      contract: contract,
      method: "createVoting",
      params: [
        form.getValues("surveyTitle"),
        uri,
        form.getValues("options"),
        toWei(amount),
      ],
      value: toWei(amount),
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

  return (
    <div className="w-full h-fit pt-8 px-8 pb-10 font-geist-mono">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-clear h-full flex flex-col gap-y-8 w-full"
        >
          <div className="flex gap-6 justify-between p-8">
            <div className="flex h-[450px] w-[450px] max-w-[450px] max-h-[450px] aspect-square">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploader
                        imageUrl={formData.imageUrl}
                        setFiles={setFiles}
                        uploadToIpfs={uploadToIpfs}
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
              {/* Image Title */}
              <FormField
                control={form.control}
                name="surveyTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="px-1">Survey Title:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-b-p1 border-t-0 border-l-0 border-r-0 bg-black bg-opacity-40 w-full py-2 text-white"
                        placeholder="Survey Title"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormLabel className="pt-2 -mb-1 px-1">
                Voting Incentive:
              </FormLabel>
              {/* Eth amount */}
              <Input
                className="border-b-p1 border-t-0 border-l-0 border-r-0 bg-black bg-opacity-40 w-full text-white"
                placeholder="ETH Amount"
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              />

              {/* Country */}
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

              {/* Image Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="px-1">Survey Description:</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="resize-none bg-black bg-opacity-40 w-full py-2 text-white border-b-p1 border-t-0 border-l-0 border-r-0"
                        placeholder="Description"
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="px-1">Survey Options:</FormLabel>
                    <FormControl>
                      <div className="w-full h-full flex flex-col gap-4">
                        <div className="w-full h-full flex gap-4">
                          <Input
                            className="bg-black bg-opacity-40 w-full py-2 text-white border-b-p1 border-t-0 border-l-0 border-r-0"
                            placeholder="New Option"
                            value={newOption}
                            onChange={(e) => {
                              setNewOption(e.target.value);
                            }}
                          />
                          <button
                            type="button"
                            className="font-semibold font-geist-mono p-2 rounded-2xl flex items-center justify-center w-1/4 text-lg text-white bg-[#40A4FF] drop-shadow-xl hover:bg-opacity-100"
                            onClick={() => {
                              setOptions([...options, newOption]);
                              setNewOption("");
                            }}
                          >
                            Add
                          </button>
                        </div>

                        <div className="h-full flex flex-wrap gap-y-4 gap-x-2 w-fit">
                          {options.map((option, index) => {
                            return (
                              <div
                                key={index}
                                className="line-clamp-2 flex max-w-[450px] h-full bg-black bg-opacity-40 drop-shadow-lg rounded-lg p-2 border border-p1"
                              >
                                <p className="truncate">{option}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
              {isBuilding || isUploading ? "Uploading" : "Create"}
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
export default SurveyForm;
