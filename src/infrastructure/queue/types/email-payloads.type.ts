export type ContactMessagePayload = {
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  phone: string;
  message: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productListingType: string;
  productImage: string;
};

export type AgencyMessagePayload = {
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  phone: string;
  message: string;
  agencyName: string;
};
export type UserMessagePayload = {
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  phone: string;
  message: string;
};