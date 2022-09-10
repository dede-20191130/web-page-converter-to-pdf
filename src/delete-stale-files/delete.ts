import { dirPathsHavingStale, projectRootPath } from "@config/conf-file";
import { readFileSync } from "fs";
import { join } from "path";
import ignore from "ignore";
import rimraf from "rimraf";
import { opendir } from "fs/promises";

async function getPromisesDeletionAllFiles(dirPath: string) {
    const filePaths = await opendir(dirPath, { bufferSize: 4 });
    const promises: Promise<unknown>[] = [];
    for await (const file of filePaths) {
        const fullPath = join(projectRootPath, dirPath, file.name);
        const deletionPromise = new Promise((res) => rimraf(fullPath, res));
        promises.push(deletionPromise);
    }
    return promises;
}

export async function deleteStaleFiles() {
    const gitIgnoreDataInTop = readFileSync(
        join(projectRootPath, ".gitignore")
    ).toString();

    const pathsManagedByGit = ignore()
        .add(gitIgnoreDataInTop)
        .filter(dirPathsHavingStale);
    const filteredTargetDirPaths = dirPathsHavingStale.filter(
        (pth) => !pathsManagedByGit.includes(pth)
    );
    const promisesOfPromisesDeletionAllFiles = filteredTargetDirPaths.map(
        (dirPath) => getPromisesDeletionAllFiles(dirPath)
    );
    const promisesDeletionAllFiles = (
        await Promise.all(promisesOfPromisesDeletionAllFiles)
    ).flat();

    await Promise.all(promisesDeletionAllFiles);

    return true;
}
