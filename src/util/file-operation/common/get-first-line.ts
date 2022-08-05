import fs from 'fs';
import readline from 'readline';
import events from 'events';

export async function getFirstLine(pathToFile: string) {
    const readable = fs.createReadStream(pathToFile);
    const reader = readline.createInterface({ input: readable });
    const linePromise = new Promise<string>((resolve) => {
        reader.on('line', (line) => {
            reader.close();
            resolve(line);
        });
    });

    const closePromise = (async () => {
        const result = await events.once(reader, 'close');
        return result.join("");
    })();

    const eventResult = await Promise.any([linePromise, closePromise]);

    return eventResult;
}