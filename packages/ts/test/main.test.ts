import {describe, expect, it} from 'vitest';
import {createClient} from "../index";
import sec from "../sec";

describe('live HTTP calls tests', ()=>{

    describe('prices', ()=>{

        // Bluvo API credentials - Replace with your own from https://docs.bluvo.co/introduction
        const client = createClient({
            apiKey: sec.apiKey,
            orgId: sec.orgId,
            projectId: sec.projectId,
        });

        it.each([
            ['ADA','USDT'],
            ['BTC','USDT'],
            ['ETH','USDT'],
            ['SOL','USDT'],
        ])
        ('GET /v0/price/candles/%s/%s', async (base, quote) => {

            const res = await client
                .prices
                .candlesticks(base, quote as any);

            expect(res).toBeDefined();

        });
    });


    describe('wallets',()=>{

        // Bluvo API credentials - Replace with your own from https://docs.bluvo.co/introduction
        const client = createClient({
            apiKey: sec.apiKey,
            orgId: sec.orgId,
            projectId: sec.projectId,
        });

        it('GET /v0/cex/wallets', async () => {

            const res = await client
                .wallet
                .list();

            console.log(res);

            expect(res).toBeDefined();
        });

        it('POST /v0/cex/connect/binance', async () => {

            const newWalletId = '2161dc8d-4b87-475e-8154-11bc04a5939a';

            console.log('adding bot with id', newWalletId)

            const res = await client
                .wallet
                .connect(
                    'binance',
                    newWalletId,
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

});