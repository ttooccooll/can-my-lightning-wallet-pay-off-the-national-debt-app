import axios from "axios"
import https from "https"

const macaroon = "0201036c6e6402f801030a1022a0b8d4931ac115b3dd2383a64524291201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e65726174651204726561640000062014872e37a6bdbf3c2c74d61bff4f20a30612e5b57481ee957881aaedc4156ccb"

const agent = new https.Agent({
    rejectUnauthorized: false // This will accept self-signed certificates
});

export default async function handler(req, res) {
    try {
        const response = await axios.post('https://127.0.0.1:8081/v1/channels/transactions', {
            payment_request: req.body.payment_request,
        }, {
            httpsAgent: agent,
            headers: {
                'Grpc-Metadata-macaroon': macaroon,
            }
        });

        console.log(response.data);

        res.status(200).json(response.data);
    } catch (error) {
        // console.error(inspect(error, false, undefined, true));
        console.error('Error (server) fetching data from LND:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
}