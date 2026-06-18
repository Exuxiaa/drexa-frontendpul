import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "../../model/order";

export function usePlaceOrder() {
  return useMutation({
    mutationFn: placeOrder,
  });
}