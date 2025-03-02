export enum LibreLinkUpEndpoints {
    Login = '/llu/auth/login',
    Country = '/llu/config/country?country=DE',
    Connections = '/llu/connections',
}

export const DefaultHeaders = {
    product: 'llu.android',
    version: '4.12.0',
    'accept-encoding': 'gzip',
    'cache-control': 'no-cache',
    connection: 'Keep-Alive',
    'content-type': 'application/json',
};
