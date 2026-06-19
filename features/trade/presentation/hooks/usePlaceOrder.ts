import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "../../model/order";

export function usePlaceOrder() {
  return useMutation({
    mutationFn: async (args: Parameters<typeof placeOrder>[0]) => {
      const res = await placeOrder(args);
      // Balances changed (funds locked / spent) and the order/trade lists have a
      // new entry — tell both views to re-fetch so the placed order shows up
      // without a manual reload.
      window.dispatchEvent(new Event("wallet-refresh"));
      window.dispatchEvent(new Event("orders-refresh"));
      return res;
    },
  });
}