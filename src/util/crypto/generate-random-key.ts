import { generateKeySync } from "crypto";

export function generateRandomKey() {
    // generate 10-len base64url text
    return generateKeySync("hmac", { length: 60 })
        .export()
        .toString("base64url");
}
