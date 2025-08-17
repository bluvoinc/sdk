import {describe, expect, it} from 'vitest';
import {createClient, createWebClient} from "../index";
import sec from "../sec";

describe('live HTTP calls tests', ()=>{

    // Bluvo API credentials - Replace with your own from https://docs.bluvo.co/introduction
    const client = createWebClient({
        orgId: sec.orgId,
        projectId: sec.projectId,
    });

    describe('oauth2',()=>{

        it('open oauth2 window', async () => {
            // open the URL in a new window
            await client
                .oauth2
                .openWindow(
                    'coinbase',
                    {
                        walletId: 'my-wallet-id',
                        idem: 'my-idem',
                    }
                );
        });

    });
});