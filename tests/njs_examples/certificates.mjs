import x509 from 'x509.js';

async function der(r) {
    const bytes = Buffer.from(await r.readRequestArrayBuffer());
    r.return(200, JSON.stringify(x509.asn1_read(bytes)[0]));
}

async function san(r) {
    const pem = await r.readRequestText();
    const cert = x509.parse_pem_cert(pem);
    r.return(200, JSON.stringify(x509.get_oid_value(cert, '2.5.29.17')[0]));
}

export default { der, san };
