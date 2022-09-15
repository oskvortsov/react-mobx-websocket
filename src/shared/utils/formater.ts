export function currencyFormatter(cur: string, num: number, bitcoins: Set<string>) {
    return bitcoins.has(cur) ? num : Number(num).toFixed(2);
}