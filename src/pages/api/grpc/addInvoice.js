// import {lnd} from "@/pages/api/grpc/getBalance";
import LndGrpc from "lnd-grpc"

const options = {
    lndconnectUri: "lndconnect://127.0.0.1:10001?cert=MIICJjCCAcygAwIBAgIQXFL8f6v8BdlWanuRwP3HEzAKBggqhkjOPQQDAjAxMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ4wDAYDVQQDEwVhbGljZTAeFw0yMzExMzAyMDE4NDhaFw0yNTAxMjQyMDE4NDhaMDExHzAdBgNVBAoTFmxuZCBhdXRvZ2VuZXJhdGVkIGNlcnQxDjAMBgNVBAMTBWFsaWNlMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7U80NLFdoXMb3G4FzwtnHRzjAu7SKyO7BcUunc9NZ-vyrF4KvmxWommW31DxVvwNNg5qwpmtWwPWOO9gsng64KOBxTCBwjAOBgNVHQ8BAf8EBAMCAqQwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDwYDVR0TAQH_BAUwAwEB_zAdBgNVHQ4EFgQU8-RZ4EFFAQbyqXqv7QrG3OkGdjcwawYDVR0RBGQwYoIFYWxpY2WCCWxvY2FsaG9zdIIFYWxpY2WCDnBvbGFyLW4xLWFsaWNlggR1bml4ggp1bml4cGFja2V0ggdidWZjb25uhwR_AAABhxAAAAAAAAAAAAAAAAAAAAABhwSsFAACMAoGCCqGSM49BAMCA0gAMEUCIFcJJG_DbBx9JMSHRnjP08azUeuM5FQd5JmOSq8Nm-djAiEAz0Fv4WbLsGovNFzyepIGk-lfTUz0Ky2yVl5ahPvmIAA&macaroon=AgEDbG5kAvgBAwoQIqC41JMawRWz3SODpkUkKRIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgFIcuN6a9vzwsdNYb_08gowYS5bV0ge6VeIGq7cQVbMs"
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

export const createInvoice = async ({ value }) => {
    await connect();

    const invoice = await lnd.services.Lightning.addInvoice({
        value: value
    });
    
    if (invoice?.payment_request) {   
        return invoice;
    } else {
        return null;
    }
};

export default async function handler(req, res) {
    try {
        const response = await createInvoice(req.body);

        if (response?.payment_request) {
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

