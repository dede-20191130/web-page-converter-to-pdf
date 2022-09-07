import { Dirent } from "fs";
import path from "path";

export const PDFFileExt = ".pdf";

export function isPdf(dirent: Dirent) {
    return dirent.isFile() && path.extname(dirent.name) === PDFFileExt;
}
