"use client";
import Image from "next/image";
import React from "react";
import { useState, useEffect } from "react";
import Button from "./Button";
import { ICommunity } from "@/models/community.models";
import CommunityCard from "./CommunityCard";
import {
  getContract,
  createThirdwebClient,
  readContract,
  Chain,
} from "thirdweb";
import ABI from "@/contract/localDAO/abi.json";
//import { baseSepolia } from 'viem/chains';
import { baseSepolia } from "@/utils/chain";

const client: any = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
});

const contract: any = getContract({
  client,
  chain: baseSepolia,
  address: "0x8D888473bCdEa4E21da862FA2e2637e3c2ae86fB",
  abi: ABI as any,
});

const mockData: ICommunity[] = [
  {
    _id: 2,
    surveyTitle: "Pepsi Challenge",
    imageUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flogo-marque.com%2Fwp-content%2Fuploads%2F2020%2F09%2FPepsi-Embleme.jpg&f=1&nofb=1&ipt=7ac82c48ab54e33ecbdf21626183c7c8db05040616bd535df938081cfb9c17fc&ipo=images",
    description:
      "Pepsi Challenge lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum etc long long long long long long long long long long long long long",
    country: "USA",
    region: "Manhattan",
    options: ["Pepsi", "Coke", "Sprite", "Fanta"],
  },
  {
    _id: 3,
    surveyTitle: "Sprite Refresh",
    imageUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.shopify.com%2Fs%2Ffiles%2F1%2F0959%2F7176%2Fproducts%2Fsprite-logo_1024x1024.jpg%3Fv%3D1454413466&f=1&nofb=1&ipt=a9cb7c23ef0086e33f8e6751636e1e87f75d389a75fd93b50c058c0a4ff09102&ipo=images",
    description: "short desc",
    country: "USA",
    region: "Los Angeles",
    options: ["Sprite", "7Up", "Mountain Dew"],
  },
  {
    _id: 4,
    surveyTitle: "Mountain Dew Adventure",
    imageUrl:
      "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fimg3.wikia.nocookie.net%2F__cb20100630194920%2Flogopedia%2Fimages%2Fa%2Fae%2FNew_Mountian_Dew_logo.png&f=1&nofb=1&ipt=abb3595d4ddcd5c0630b858f45feee6cce787a94f523e9ef1e79ad7af334c6b2&ipo=images",
    description:
      "Mountain Dew Adventure lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum etc",
    country: "Australia",
    region: "Sydney",
    options: ["Mountain Dew", "Mello Yello", "Surge"],
  },
];

const CommunityPage = () => {
  const [counter, setCounter] = useState<number>(0);
  const [data, setData] = useState<ICommunity[]>([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const counter = await readContract({
      contract: contract,
      method: "function getCounter() public view returns (uint256)",
      params: [],
    });
    alert("Successful")
    const items: any = [];
    for (let i = 1; i <= counter; i++) {
      const item: any = await readContract<any, any, any>({
        contract: contract,
        method: "getVoting",
        params: [BigInt(i)],
      });
      console.log(item);
      const res = await fetch(item.uri);
      const json = await res.json();
      console.log(json);

      const convertedItem: ICommunity = {
        _id: i,
        surveyTitle: json.name ? json.name : json.surveyTitle,
        imageUrl: json.imageUrl,
        description: json.description,
        country: json.country,
        region: json.region,
        options: json.options,
      };
      items.push(convertedItem);
    }
    setData(items);
    return counter;
  };

  return (
    <div className="flex justify-center items-center w-screen h-fit flex-grow absolute top-0 left-0 z-10 pb-[160px]">
      <div className="flex flex-grow flex-col gap-5 justify-center items-center h-full">
        <div className="grid grid-cols-3 gap-16 mt-20 p-20 px-[150px] h-full">
          {mockData.map((community) => (
            <CommunityCard key={community._id} community={community} />
          ))}
          {data.map((community) => (
            <CommunityCard key={community._id} community={community} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
