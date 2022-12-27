import { useEffect, useState } from "react"

export const OrbisProfile = ({ did, orbis }) => {

    const [profile, setProfile] = useState();

    useEffect(() => {

        async function getProfile() {
            let { data, error } = await orbis.getProfile(did);
            console.log(data);
            setProfile(JSON.stringify(data));
        }

        if (!profile && did && orbis) {
            getProfile();
        }
    }, [did, orbis])

    return (
        <>
            {
                profile !== null ? 'yes' : 'no'
            }
        </>
    )
}