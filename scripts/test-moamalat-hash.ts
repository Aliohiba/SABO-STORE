
import crypto from 'crypto';

const config = {
    merchantId: "43233",
    terminalId: "53532091",
    secretKey: "35333335653063302D663464372D343237652D623739362D643234666661386432323065",
};

function hexDecode(hex: string): Buffer {
    return Buffer.from(hex, 'hex');
}

function generateHash() {
    // Values from Example
    const amount = "100";
    const dateTime = "202009171418";
    const merchantReference = "Txn-1234";
    const merchantId = config.merchantId;
    const terminalId = config.terminalId;

    const params = new Map<string, string>();
    params.set('Amount', amount);
    params.set('DateTimeLocalTrxn', dateTime);
    params.set('MerchantId', merchantId);
    params.set('MerchantReference', merchantReference);
    params.set('TerminalId', terminalId);

    const sortedKeys = Array.from(params.keys()).sort();
    const stringParts = sortedKeys.map(key => `${key}=${params.get(key)}`);
    const dataString = stringParts.join('&');

    console.log("Data String:", dataString);

    const keyBuffer = hexDecode(config.secretKey);
    const hmac = crypto.createHmac('sha256', keyBuffer);
    hmac.update(dataString);
    const hash = hmac.digest('hex').toUpperCase();

    console.log("Calculated Hash:", hash);
    console.log("Expected Hash:  ", "EAD7AB68E23BFF2E5B03F4A0CD41581722FD14C349C6743CD91B577341465A61");
    console.log("Match:", hash === "EAD7AB68E23BFF2E5B03F4A0CD41581722FD14C349C6743CD91B577341465A61");
}

generateHash();
