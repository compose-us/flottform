export const sdpExchangeServerBase = "https://192.168.0.21:5177/flottform"

export const createClientUrl= async ({ endpointId }:{ endpointId:string }) => {
    return `https://192.168.0.21:5173/flottform-client/${endpointId}`;
}