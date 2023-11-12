import LndGrpc from "lnd-grpc"

const options = {
    lndconnectUri: "lndconnect://127.0.0.1:10001?cert=MIICJjCCAc2gAwIBAgIRALQLmIckTeNR1_ViqFLGlPswCgYIKoZIzj0EAwIwMTEfMB0GA1UEChMWbG5kIGF1dG9nZW5lcmF0ZWQgY2VydDEOMAwGA1UEAxMFYWxpY2UwHhcNMjMxMTA5MDE1MDE1WhcNMjUwMTAzMDE1MDE1WjAxMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ4wDAYDVQQDEwVhbGljZTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHB_XGOGKpSZfsWbynFedhFYSGQPEkjfGgHfQawpmpV9kz1nvHhlk_ge0VIG8G7vUvi8x68byUYX4XvB7ds5y6yjgcUwgcIwDgYDVR0PAQH_BAQDAgKkMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA8GA1UdEwEB_wQFMAMBAf8wHQYDVR0OBBYEFIVbHCWqtX08X_AED9aa7N6QpdvWMGsGA1UdEQRkMGKCBWFsaWNlgglsb2NhbGhvc3SCBWFsaWNlgg5wb2xhci1uMS1hbGljZYIEdW5peIIKdW5peHBhY2tldIIHYnVmY29ubocEfwAAAYcQAAAAAAAAAAAAAAAAAAAAAYcErBwABDAKBggqhkjOPQQDAgNHADBEAiBjxLIqDOYp75BjldU7w6cSoui0Gv9ihMQ0FpG_ob9o6wIgNDcrp0aCxKZ4KUYOxj0dMqRfR-NMVgWFSo-yhA6PpAA&macaroon=AgEDbG5kAvgBAwoQm22ALhgBfRv0U20HjJMpdRIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgWNIBx3Rz2YVUR8VP_MHzP5wHw84kB2dAL9OPC_LKRiQ"
};

export const lnd = new LndGrpc(options);

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

export const payInvoice = async ({ payment_request }) => {
    await connect();

    const paidInvoice = await lnd.services.Lightning.sendPaymentSync({
        payment_request: payment_request,
    });

    return paidInvoice;
};

export default async function handler(req, res) {
    try {
        const response = await payInvoice(req.body);

        if (response?.payment_preimage) {
            res.status(200).json(response);
        } else {
            res.status(500).json({ message: 'Error fetching data' });
        }
    } catch (error) {
        // console.error(inspect(error, false, undefined, true));
        console.error('Error (server) fetching data from LND:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
}
