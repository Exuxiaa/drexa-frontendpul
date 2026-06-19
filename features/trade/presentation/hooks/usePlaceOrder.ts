import { useMutation, useQueryClient } from "@tanstack/react-query";
import { placeOrder } from "../../model/order";
import { ordersKey, tradesKey } from "./useOrders";

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      // A new order may rest, fill, or print trades — refresh every view.
      void qc.invalidateQueries({ queryKey: ordersKey });
      void qc.invalidateQueries({ queryKey: tradesKey });
    },
  });
}
