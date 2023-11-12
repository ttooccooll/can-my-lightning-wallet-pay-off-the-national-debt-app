import axios from "axios"
import https from "https"
import LndGrpc from "lnd-grpc"

const macaroon = "0201036c6e6402f801030a109b6d802e18017d1bf4536d078c9329751201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e65726174651204726561640000062058d201c77473d9855447c54ffcc1f33f9c07c3ce240767402fd38f0bf2ca4624"

const agent = new https.Agent({
    rejectUnauthorized: false // This will accept self-signed certificates
});

const options = {
    lndconnectUri: "lndconnect://127.0.0.1:10001?cert=MIICJjCCAc2gAwIBAgIRALQLmIckTeNR1_ViqFLGlPswCgYIKoZIzj0EAwIwMTEfMB0GA1UEChMWbG5kIGF1dG9nZW5lcmF0ZWQgY2VydDEOMAwGA1UEAxMFYWxpY2UwHhcNMjMxMTA5MDE1MDE1WhcNMjUwMTAzMDE1MDE1WjAxMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ4wDAYDVQQDEwVhbGljZTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHB_XGOGKpSZfsWbynFedhFYSGQPEkjfGgHfQawpmpV9kz1nvHhlk_ge0VIG8G7vUvi8x68byUYX4XvB7ds5y6yjgcUwgcIwDgYDVR0PAQH_BAQDAgKkMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA8GA1UdEwEB_wQFMAMBAf8wHQYDVR0OBBYEFIVbHCWqtX08X_AED9aa7N6QpdvWMGsGA1UdEQRkMGKCBWFsaWNlgglsb2NhbGhvc3SCBWFsaWNlgg5wb2xhci1uMS1hbGljZYIEdW5peIIKdW5peHBhY2tldIIHYnVmY29ubocEfwAAAYcQAAAAAAAAAAAAAAAAAAAAAYcErBwABDAKBggqhkjOPQQDAgNHADBEAiBjxLIqDOYp75BjldU7w6cSoui0Gv9ihMQ0FpG_ob9o6wIgNDcrp0aCxKZ4KUYOxj0dMqRfR-NMVgWFSo-yhA6PpAA&macaroon=AgEDbG5kAvgBAwoQm22ALhgBfRv0U20HjJMpdRIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgWNIBx3Rz2YVUR8VP_MHzP5wHw84kB2dAL9OPC_LKRiQ"
};

const lnd = new LndGrpc(options);

const connect = async () => {
    try {
        await lnd.connect();

        if (lnd.state !== "active") {
            throw new Error(
                "LND did not reach 'active' state within the expected time"
            );
        }

        console.log(`LND gRPC connection state: ${lnd.state}`);
    } catch (e) {
        console.log("error", e);
    }
};

export const getBalance = async () => {
    await connect();
    
    const channelBalance = await lnd.services.Lightning.channelBalance();

    console.log('channelBalance', channelBalance);

    return channelBalance;
  };

export default async function handler(req, res) {
    try {
        // const response = await axios.get('https://127.0.0.1:8081/v1/balance/channels', {
        //     httpsAgent: agent,
        //     headers: {
        //         'Grpc-Metadata-macaroon': macaroon,
        //     }
        // });

        // res.status(200).json(response.data);
        const balance = await getBalance();
        res.status(200).json(balance);
    } catch (error) {
        // console.error(inspect(error, false, undefined, true));
        console.error('Error (server) fetching data from LND:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
}