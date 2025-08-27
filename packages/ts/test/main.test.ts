import {describe, expect, it} from 'vitest';
import {createSandboxClient} from "../index";
import sec from "../sec";
import {WALLET_ERROR_TYPES} from "../src/ErrorTypes";

describe('live HTTP calls tests', ()=> {

    // Bluvo API credentials - Replace with your own from https://docs.bluvo.co/introduction
    const client = createSandboxClient({
        apiKey: sec.apiKey,
        orgId: sec.orgId,
        projectId: sec.projectId,
    });

    describe('wallets',()=>{

        it('GET /v0/cex/wallets', async () => {

            const res = await client
                .wallet
                .list();

            console.log(res);

            expect(res).toBeDefined();
        });

        it('POST /v0/cex/connect/binance', async () => {

            const newWalletId = crypto.randomUUID();
            const randomIdem = crypto.randomUUID();

            console.log('adding bot with id', newWalletId)

            const res = await client
                .wallet
                .connect(
                    'binance',
                    newWalletId,
                    randomIdem,
                    {
                        apiKey:         sec.binance.apiKey,
                        apiSecret:      sec.binance.secret,
                    }
                );

            console.log(res); // 'wfr_${newWalletId}_connect';

            expect(res).toBeDefined();
        });

        it('DELETE /v0/cex/wallet/:walletId', async () => {

            const walletId = '2161dc8d-4b87-475e-8154-11bc04a5939a';

            const res = await client
                .wallet
                .delete(walletId);

            console.log(res);

            expect(res).toBeDefined();
        });

        it('GET /v0/cex/wallet/:walletId', async () => {
            const walletId = '314d7b73-a5d5-4be7-87ed-58b7a652ac88';

            const res = await client
                .wallet
                .get(walletId);

            console.log(res);

            expect(res).toBeDefined();
        });

        it('GET /v0/cex/wallet/:walletId not-found', async () => {
            const walletId = 'i-do-not-exist';

            await expect(client.wallet.get(walletId))
                .rejects
                .toThrow(WALLET_ERROR_TYPES.NOT_FOUND);
        })

        it('GET /v0/cex/wallet/:walletId/transactions', async () => {
            const walletId = '99a01408-4ef4-47da-935a-848618c11aro';

            const res = await client
                .wallet
                .transaction
                .list(walletId);

            console.log(res);

            expect(res).toBeDefined();
        });

    });

    describe('ott',()=>{

        it('get ott', async () => {
            const ott = await client
                .ott
                .get();
            console.log(ott);
            expect(ott).toBeDefined();
        });
    });

    describe('oauth2',()=>{

        it('get oauth2 link', async () => {

            const act = await client
                .oauth2
                .getLink(
                    'coinbase',
                    'my-wallet-id',
                    'my-idem',
                );

            console.log(act);

            expect(act).toBeDefined();
        });

    });

});