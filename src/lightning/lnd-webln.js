// Assuming WebLN and other relevant APIs are available in the window object

export const getBalance = async () => {
    if (window.webln) {
      try {
        await window.webln.enable(); // Enabling WebLN
        const balance = await window.webln.getBalance(); // Fetching balance
        console.log('Balance fetched successfully');
        return balance;
      } catch (error) {
        console.error('Error fetching balance:', error);
        return null;
      }
    } else {
      console.error('WebLN not supported');
      return null;
    }
  };
  
  export const payInvoice = async (invoice) => {
    if (window.webln) {
      try {
        await window.webln.enable(); // Enabling WebLN
        const result = await window.webln.sendPayment(invoice); // Sending payment using the invoice
        if (result?.preimage) {
          console.log('Payment sent successfully');
          return result.preimage;
        } else {
          console.error('Payment failed');
          return null;
        }
      } catch (error) {
        console.error('Error sending payment:', error);
        return null;
      }
    } else {
      console.error('WebLN not supported');
      return null;
    }
  };
  
  export const createInvoice = async (amount) => {
    if (window.webln) {
      try {
        await window.webln.enable(); // Enabling WebLN
        const { paymentRequest } = await window.webln.makeInvoice({ amount });
        console.log('Payment request created:', paymentRequest);
        return paymentRequest;
      } catch (error) {
        console.error('Error creating invoice:', error);
        return null;
      }
    } else {
      console.error('WebLN not supported');
      return null;
    }
  };
  