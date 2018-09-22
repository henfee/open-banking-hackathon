var rp = require('request-promise');
var fs = require('fs');

const access = {
    cert: fs.readFileSync('./9605a69a-6c81-459e-8d02-592c9dc9adde.pem', 'utf-8'),
    key: fs.readFileSync('./9605a69a-6c81-459e-8d02-592c9dc9adde.key', 'utf-8'),
};

const ASPSP_FINANCIAL_ID = "0015800001041REAAY";
const AS_JWK_URI = "https://as.aspsp.ob.forgerock.financial/oauth2/realms/root/realms/openbanking/connect/jwk_uri";
const AS_authorization_endpoint = "https://matls.as.aspsp.ob.forgerock.financial/oauth2/realms/root/realms/openbanking/authorize"
const CLIENT_ID = "b75505b8-e049-4921-9f9d-f097c9add03c";
const CLIENT_REDIRECT_URI = 'http://localhost:1993/callback';

module.exports = async () => {


    const CLIENT_CREDENTIAL_JWT = await rp({
        ...access,
        method: 'POST',
        url: 'https://jwkms.ob.forgerock.financial:443/api/crypto/signClaims',
        headers: {
            'Cache-Control': 'no-cache',
            issuerId: CLIENT_ID,
            'Content-Type': 'application/json'
        },
        body: {
            sub: CLIENT_ID,
            exp: (new Date().getTime() / 1000) + 60 * 5,
            aud: 'https://matls.as.aspsp.ob.forgerock.financial/oauth2/openbanking'
        },
        json: true
    })

    console.log('-------------------');
    console.log('step 1: ', CLIENT_CREDENTIAL_JWT);

    const { access_token, id_token } = await rp({
        ...access,
        method: 'POST',
        url: 'https://matls.as.aspsp.ob.forgerock.financial/oauth2/realms/root/realms/openbanking/access_token',
        headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            grant_type: 'client_credentials',
            scope: 'openid accounts payments',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: CLIENT_CREDENTIAL_JWT
        },
        json: true
    })

    console.log('-------------------');
    console.log('step 2: ', access_token, id_token);

    const { Data: { PaymentId: PaymentId } } = await rp({
        ...access,
        method: 'POST',
        url: 'https://rs.aspsp.ob.forgerock.financial:443/open-banking/v2.0/payments',
        headers: {
            'Cache-Control': 'no-cache',
            Accept: 'application/json',
            'x-fapi-interaction-id': '93bac548-d2de-4546-b106-880a5018460d',
            'x-fapi-customer-ip-address': '104.25.212.99',
            'x-fapi-customer-last-logged-time': 'Sun, 10 Sep 2017 19:43:31 UTC',
            'x-fapi-financial-id': ASPSP_FINANCIAL_ID,
            'x-idempotency-key': 'FRESCO.21302.GFX.20',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`
        },
        body: {
            Data: {
                Initiation: {
                    InstructionIdentification: 'ACME412',
                    EndToEndIdentification: 'FRESCO.21302.GFX.20',
                    InstructedAmount: { Amount: '165.88', Currency: 'GBP' },
                    CreditorAccount: {
                        SchemeName: 'SortCodeAccountNumber',
                        Identification: '08080021325698',
                        Name: 'ACME Inc',
                        SecondaryIdentification: '0002'
                    },
                    RemittanceInformation: {
                        Reference: 'FRESCO-101',
                        Unstructured: 'Internal ops code 5120101'
                    }
                }
            },
            Risk: {
                PaymentContextCode: 'EcommerceGoods',
                MerchantCategoryCode: '5967',
                MerchantCustomerIdentification: '053598653254',
                DeliveryAddress: {
                    AddressLine: ['Flat 7', 'Acacia Lodge'],
                    StreetName: 'Acacia Avenue',
                    BuildingNumber: '27',
                    PostCode: 'GU31 2ZZ',
                    TownName: 'Sparsholt',
                    CountySubDivision: ['Wessex'],
                    Country: 'UK'
                }
            }
        },
        json: true
    });

    console.log('-------------------');
    console.log('step 3: ', PaymentId);


    const request_parameter = await rp({
    // const data = await rp({
        method: 'POST',
        ...access,
        url: 'https://jwkms.ob.forgerock.financial:443/api/crypto/signClaims',
        headers: {
            'Cache-Control': 'no-cache',
            issuerId: CLIENT_ID,
            jwkUri: AS_JWK_URI,
            'Content-Type': 'application/json'
        },
        body: {
            aud: 'https://matls.as.aspsp.ob.forgerock.financial/oauth2/openbanking',
            scope: 'openid accounts',
            iss: CLIENT_ID,
            claims: {
                id_token: {
                    acr: { value: 'urn:openbanking:psd2:sca', essential: true },
                    openbanking_intent_id: {
                        value: PaymentId,
                        essential: true
                    }
                },
                userinfo: {
                    openbanking_intent_id: {
                        value: PaymentId,
                        essential: true
                    }
                }
            },
            response_type: 'code id_token',
            redirect_uri: CLIENT_REDIRECT_URI,
            state: '10d260bf-a7d9-444a-92d9-7b7a5f088208',
            exp: ((new Date().getTime() / 1000) + 60*5),
            nonce: '10d260bf-a7d9-444a-92d9-7b7a5f088208',
            client_id: CLIENT_ID
        },
        json: true
    });

    console.log('-------------------');
    console.log('step 4: ', request_parameter);
    console.log('-------------------');
    const URL = `${AS_authorization_endpoint}?response_type=code id_token&client_id=${CLIENT_ID}&state=10d260bf-a7d9-444a-92d9-7b7a5f088208&nonce=10d260bf-a7d9-444a-92d9-7b7a5f088208&scope=openid payments accounts&redirect_uri=${CLIENT_REDIRECT_URI}&request=${request_parameter}`
    console.log('step 5: go to this URL::::', `${AS_authorization_endpoint}?response_type=code id_token&client_id=${CLIENT_ID}&state=10d260bf-a7d9-444a-92d9-7b7a5f088208&nonce=10d260bf-a7d9-444a-92d9-7b7a5f088208&scope=openid payments accounts&redirect_uri=${CLIENT_REDIRECT_URI}&request=${request_parameter}`);

    return URL;
}
