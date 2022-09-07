export function waitForTimeout(milliseconds: number) {
    return new Promise((r) => setTimeout(r, milliseconds));
}
