import { ArgosSDK } from "@project89/argos-sdk";
const sdk = new ArgosSDK({ apiKey: "test", baseUrl: "http://localhost" });
const isOnline = sdk.isOnline();
