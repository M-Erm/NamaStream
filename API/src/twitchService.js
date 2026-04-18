//
// Pega token, faz fetch, recupera token quando acaba.
//

const channels = [
    {name: "vedal987"}, 
    {name: "ironmouse"}, 
    {name: "henyathegenius"}, 
    {name: "dooby3d"}, 
    {name: "shachimu"}, 
    {name: "dokibird"}, 
    {name: "apricot"},
    {name: "camila"},
    {name: "cerberVT"},  
    {name: "filian"},
    {name: "kiara"},
    {name: "gigimurin"},
    {name: "FUWAMOCO"},
    {name: "michimochievee"},
    {name: "michimochievee"},
    {name: "nyanners"},
]

let token = null;

async function getToken (Client_Id, Client_Secret) 
{

    if (token && Date.now() < token.expires_at) {
        return token.access_token;
    }

    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${Client_Id}&client_secret=${Client_Secret}&grant_type=client_credentials`, 
        { method: 'POST' }
    );

    const data = await res.json();
    console.log("TOKEN RESPONSE:", data);

    if (!res.ok) {
        console.error("Erro ao pegar token:", data);
        throw new Error("Token inválido");
    }

    token = {
        access_token: data.access_token,
        expires_at: Date.now() + data.expires_in * 1000
    }

    if (!token.access_token) {
        throw new Error("Token inválido (sem access_token)");
    }
    return token.access_token;
}

export async function getTwitchStreams(Client_Id, Client_Secret, retry = true)
{
    const accessToken = await getToken(Client_Id, Client_Secret);

    const users = channels.map(channel => `user_login=${channel.name}`).join("&");

    const res = await fetch(
        `https://api.twitch.tv/helix/streams?${users}`,
        {
            headers: {
                "Client-Id": Client_Id,
                "Authorization": `Bearer ${accessToken}`
            }
        }
    );

    if (res.status === 401 && retry) {
        token = null;
        return getTwitchStreams(Client_Id, Client_Secret, false);
    }

    return res.json();
}