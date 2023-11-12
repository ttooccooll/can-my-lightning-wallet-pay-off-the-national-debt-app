export const getBalance = async () => {
    try {
      const response = await fetch('/api/rest/getBalance');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  };
  

export const payInvoice = async (payment_request) => {
  try {
    const response = await fetch('/api/rest/sendPayment', {
      method: 'POST',
      body: JSON.stringify({ payment_request }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}

export const createInvoice = async (amount) => {
  try {
    const response = await fetch('/api/rest/addInvoice', {
      method: 'POST',
      body: JSON.stringify({ value: amount }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    if (data) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}