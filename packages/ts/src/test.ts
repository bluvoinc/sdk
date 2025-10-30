import {BluvoWebClient} from "./BluvoWebClient";

(async ()=>{

    await new BluvoWebClient(
        "org123",
        "proj456"
    )
        .oauth2
        .getURL("coinbase", {
           walletId: "abc",
            idem: "123"
        } as any)
        .then(res => res)
        .then(console.log)

})();