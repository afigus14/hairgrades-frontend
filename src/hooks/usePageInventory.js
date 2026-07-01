import { useEffect, useState } from "react";
import useAdvertisers from "./useAdvertisers";
import { buildPageInventory } from "../lib/buildPageInventory";

export default function usePageInventory() {
  const { advertisers, loading } = useAdvertisers();

  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (loading) return;

    setInventory(buildPageInventory(advertisers));
  }, [advertisers, loading]);

  return {
    inventory,
    loading,
  };
}