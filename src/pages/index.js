import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import axios from 'axios';
import { getBalance, payInvoice, createInvoice } from '@/lightning/lnd-webln';
// import { getBalance, createInvoice, payInvoice } from "@/lightning/lnd-rest"
// import { getBalance, createInvoice, payInvoice } from "@/lightning/lnd-grpc"


function SendModal({ onClose }) {
  const [invoice, setInvoice] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const result = await payInvoice(invoice);

    if (result || !result?.message === "Error fetching data") {
      setPaymentMessage("Payment successful!");
      setInvoice('');
    } else {
      setPaymentMessage('Payment failed...');
    }
  };

  return (
    <div className={styles.modal}>
      <h2>Send Invoice</h2>
      <form onSubmit={handleSubmit}>
        <label>Invoice:</label>
        <br />
        <input type="text" value={invoice} onChange={e => setInvoice(e.target.value)} />
        <br />
        <button className={styles.button} type="submit">Submit</button>
      </form>
      <button className={styles.button} onClick={onClose}>Close</button>
      {paymentMessage && <p>{paymentMessage}</p>}
    </div>
  );
}

function ReceiveModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [invoice, setInvoice] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const paymentRequest = await createInvoice(amount);
    if (paymentRequest) {
      setInvoice(paymentRequest);
      setMessage('Invoice created successfully.');
    } else {
      setMessage('Error creating invoice.');
    }
  };

  return (
    <div className={styles.modal}>
      <h2>Receive Amount</h2>
      <form onSubmit={handleSubmit}>
        <label>Amount:</label>
        <br />
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <br />
        <button className={styles.button} type="submit">Submit</button>
      </form>
      <button className={styles.button} onClick={onClose}>Close</button>
      {invoice ? (
        <>
          <p>{message}</p>
          <QRCode value={invoice} size={256} level="H" />
          <br />
          <span>Invoice:</span>
          <br />
          <span>{invoice}</span>
        </>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

export default function Home() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [balance, setBalance] = useState(null);
  const [fedDebt, setFedDebt] = useState(null);
  const [price, setPrice] = useState(null);
  const [balanceFact, setBalanceFact] = useState('');
  const [musicPlaying, setMusicPlaying] = useState(false);

// Function to generate a historical fact for a specific number
async function generateFactForNumber(number) {
  const apiUrl = `http://numbersapi.com/${number}/math`;
  
  try {
      const response = await fetch(apiUrl);
      
      if (response.ok) {
          const fact = await response.text();
          return fact;
      } else {
          console.error('Error:', response.status);
          return 'Error fetching fact';
      }
  } catch (error) {
      console.error('Error:', error);
      return 'Error fetching fact';
  }
}

const fetchBalanceFact = async () => {
  try {
    const fact = await generateFactForNumber(balance);
    setBalanceFact(fact);
  } catch (error) {
    console.error('Error fetching balance fact:', error);
    setBalanceFact('Error fetching fact');
  }
};

useEffect(() => {
  if (balance) {
    fetchBalanceFact();
  }
}, [balance]);


useEffect(() => {
  fetchBalanceFact();
}, [balance]);

const playMusicOnClick = () => {
  if (!musicPlaying && typeof window !== 'undefined') {
    const musicSound = new Audio("/Eric.wav");
    musicSound.play().catch(error => {
      console.error('Error playing music:', error);
    });
    setMusicPlaying(true);

    musicSound.addEventListener('ended', () => {
      setMusicPlaying(false);
    });
  }
};

  const usdToSats = (usdAmount) => {
    return Math.round(usdAmount * 1e8 / price);
  };

  const getPrice = () => {
    axios
      .get("https://api.coinbase.com/v2/prices/BTC-USD/spot")
      .then((res) => {
        const formattedPrice = Number(res.data.data.amount).toFixed(4)
        setPrice(formattedPrice);
        updateChartData(formattedPrice);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchBalance = async () => {
    const balanceResult = await getBalance();
    if (balanceResult) {
      console.log('Balance fetched successfully', balanceResult);
      setBalance(balanceResult?.balance);
    } else {
      console.error('Failed to fetch balance');
    }
  };

  useEffect(() => {
    getPrice();
    if (!balance) fetchBalance();
  }, [balance]);

  useEffect(() => {
    const priceInterval = setInterval(() => {
      getPrice();
    }, 1000);
    return () => {
      clearInterval(priceInterval);
    };
  }, []);

  async function fetchNationalDebt() {
    const url = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?format=json&sort=-record_date&limit=1';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching national debt data:', error);
        return null;
    }
  }
  
  async function displayNationalDebt() {
    const debtData = await fetchNationalDebt();
    console.log('Debt Data:', debtData);
    if (debtData && debtData.data) {
        const firstDataRow = debtData.data[0];
        if (firstDataRow) {
            const totalPublicDebtOutstanding = firstDataRow.tot_pub_debt_out_amt;
            if (totalPublicDebtOutstanding !== undefined && totalPublicDebtOutstanding !== null) {
                console.log('Total Public Debt Outstanding:', totalPublicDebtOutstanding);
                const firstTwoDigits = totalPublicDebtOutstanding.toString().slice(0, 2);
                console.log('First Two Digits:', firstTwoDigits);
                const fedDebt = document.getElementById('fedDebt');
                console.log('Fed Debt:', fedDebt);
                if (fedDebt) {
                    fedDebt.textContent = `US National Debt: $${totalPublicDebtOutstanding}`;
                } else {
                    console.error('Fed Debt not found.');
                }
            } else {
                console.error('Total public debt outstanding data not available or null/undefined.');
                const fedDebt = document.getElementById('fedDebt');
                if (fedDebt) {
                    fedDebt.textContent = `Fed's: Data Not Available`;
                } else {
                    console.error('Fed Debt not found.');
                }
            }
        } else {
            console.error('No data rows found.');
        }
    } else {
        console.log('Failed to fetch national debt data or data format is incorrect.');
    }
  }
  
  useEffect(() => {
    async function fetchData() {
      await fetchNationalDebt();
    }
    fetchData();
  }, []);

  useEffect(() => {
    displayNationalDebt();
  }, );

  async function displayNationalDebt() {
    const debtData = await fetchNationalDebt();
    if (debtData && debtData.data) {
      const firstDataRow = debtData.data[0];
      if (firstDataRow) {
        const totalPublicDebtOutstanding = firstDataRow.tot_pub_debt_out_amt;
        if (totalPublicDebtOutstanding !== undefined && totalPublicDebtOutstanding !== null) {
          setFedDebt(totalPublicDebtOutstanding);
        } else {
          setFedDebt('Data Not Available');
        }
      }
    }
  }

  const calculatePercentage = () => {
    if (balance !== null && fedDebt !== null) {
      const debtInSats = usdToSats(fedDebt, price);
      const percentage = (balance / debtInSats) * 100;
      return percentage.toFixed(50); 
    } else {
      return 'Loading...';
    }
  };

  const canPayOffDebt = () => {
    if (balance !== null && fedDebt !== null) {
      return balance >= usdToSats(fedDebt, price);
    } else {
      return 'Loading...';
    }
  };

  return (
    <>
      <Head>
        <title>Stress Wallet</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main} onClick={playMusicOnClick}>
        <h1>StresS WalLet</h1>
        <h2>Use this wallet whenever you&apos;re feeling too calm and need a healthy dose of chaos.</h2>
        <h3>Balance: {balance} sats</h3>
        <h3>USA national debt: {fedDebt ? usdToSats(fedDebt, price) : 'Loading...'} sats</h3>
        <h3>Your balance as a percentage of the USA national debt: {calculatePercentage()}%</h3>
        <h3>Can you currently pay off the USA national debt: {canPayOffDebt() ? 'Yes' : 'No'}</h3>
        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={() => setShowSendModal(true)}>Get my money out of here!</button>
          <button className={styles.button} onClick={() => setShowReceiveModal(true)}>Put some money in here!</button>
        </div>
        <h3>Your balance of {balanceFact} If you are consistantly getting generic responses here, you have way too much money in a browser extention wallet. Go zap somebody on nostr or something.</h3>
        {showSendModal && <SendModal onClose={() => setShowSendModal(false)} styles={styles} />}
        {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} styles={styles} />}
      </main>
    </>
  )
}
