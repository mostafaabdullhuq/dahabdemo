export interface PurchasePayment {
  id: number;
  purchase_order: number;
  payment_date: string;
  total_amount: string;
  salesman: number;
  branch: number;
  items: PurchasePaymentItem[];
  total_weight: string;
  gold_price: string;

  // Allow any extra fields
  [key: string]: any;
}

export interface PurchasePaymentItem {
  id: number;
  purchase_payment: number;
  type: "TTB" | "Amount" | "Scrap" | "Tag No";
  is_fixed: boolean;
  amount: string;
  description: string;
  product: PurchasePaymentItemProduct | null;
  quantity: string;
  pure_weight: string;
  weight: string;
  purchase_order: number | null;
  payment_method: number | null;
  payment_method_name?: string; // Optional because it's missing in this response

  // Allow any extra fields
  [key: string]: any;
}

export interface PurchasePaymentItemProduct {
  id: number;
  name: string;
  purity: number;
  purity_value: string;
  weight: string;
  tag_number: string;
  purity_name: string;

  // Allow any extra fields
  [key: string]: any;
}
