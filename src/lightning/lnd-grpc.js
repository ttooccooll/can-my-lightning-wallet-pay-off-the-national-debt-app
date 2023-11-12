export const getBalance = async () => {
    try {
      const response = await fetch('/api/grpc/getBalance');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  };
  

export const payInvoice = async (payment_request) => {
  try {
    const response = await fetch('/api/grpc/sendPayment', {
      method: 'POST',
      body: JSON.stringify({ payment_request }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data?.payment_preimage) {
        return data.payment_preimage;
    } else {
        return null;
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}

export const createInvoice = async (amount) => {
  try {
    const response = await fetch('/api/grpc/addInvoice', {
      method: 'POST',
      body: JSON.stringify({ value: amount }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    console.log('HERE', data);

    if (data?.payment_request) {
      return data.payment_request;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}