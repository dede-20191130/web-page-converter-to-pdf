import { PaperFormat } from "puppeteer";

interface iRequestConfig {
printFormat:PaperFormat
}

const RequestConfig :iRequestConfig= {
    printFormat: "A4"
}
export default RequestConfig;