import { createdPdfDirPath } from "@config/conf-file";
import { isPdf, PDFFileExt } from "@util/file-operation/pdf/check-if-pdf";
import { opendir, rename } from "fs/promises";
import path from "path";

function removeSuffix11Char(targetFilename: string) {
    const { name, ext } = path.parse(targetFilename);
    return name.slice(0, -11) + ext;
}

export async function removePdfFileSuffix(): Promise<boolean> {
    const allFileNames: string[] = [];
    const pdfFileNames: string[] = [];
    const processedFileNames: string[] = [];

    const dir = await opendir(createdPdfDirPath, { bufferSize: 4 });
    for await (const dirent of dir) {
        allFileNames.push(dirent.name);
        if (isPdf(dirent)) pdfFileNames.push(dirent.name);
    }

    for (const pdfFileName of pdfFileNames) {
        const suffixRemovedName = removeSuffix11Char(pdfFileName);

        if (
            suffixRemovedName === PDFFileExt ||
            allFileNames.includes(suffixRemovedName) ||
            processedFileNames.includes(suffixRemovedName)
        )
            continue;

        const fullPath = path.join(createdPdfDirPath, pdfFileName);
        const newFullPath = path.join(createdPdfDirPath, suffixRemovedName);

        await rename(fullPath, newFullPath);

        processedFileNames.push(suffixRemovedName);
    }

    return true;
}
