export const contactMessageTemplate = (
  name: string,
  email: string,
  message: string,
  productName: string,
  productPrice: number,
  productCategory: string,
  productListingType: string,
  productImageUrl?: string, // optional
): string => `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
    <h2>New Contact Message from ${name}</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong> ${message}</p>
    <hr/>
    <h3>Product Details</h3>
    <p><strong>Name:</strong> ${productName}</p>
    <p><strong>Price:</strong> ${productPrice}</p>
    <p><strong>Category:</strong> ${productCategory}</p>
    <p><strong>Listing Type:</strong> ${productListingType}</p>
    ${
      productImageUrl
        ? `<p><strong>Image:</strong><br/><img src="${productImageUrl}" alt="${productName}" style="max-width:300px;"/></p>`
        : ''
    }
  </div>
`;