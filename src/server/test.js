const go = async () => {

    var res = await fetch('https://talented-lofty-salary.glitch.me/api/check', {
        method: 'POST',
        body: JSON.stringify({
            id: 1,
            "testA": "testB"
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const isOK = (await res.json()).statis === 'ok';

    console.log("isOK =>", isOK);
}
go();