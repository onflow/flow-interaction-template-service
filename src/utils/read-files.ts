import { glob } from "glob";
import fs from "fs";

export interface File {
  path: string;
  content: string;
}

export function readFiles(pattern: string): Promise<File[]> {
  return new Promise((res, rej) => {
    try {
      glob(pattern, {}).then((paths: string[]) => {
        const fileReadPromises = paths.map(
          (path) =>
            new Promise<File | null>((fsRes, fsRej) => {
              try {
                // Check if the path is a file before trying to read it
                fs.stat(path, (statErr, stats) => {
                  if (statErr) {
                    fsRej(statErr);
                    return;
                  }
                  
                  // Only read if it's a file, skip directories
                  if (!stats.isFile()) {
                    fsRes(null); // Return null for directories
                    return;
                  }
                  
                  fs.readFile(path, "utf8", function (err: any, data: any) {
                    if (err) {
                      fsRej(err);
                      return;
                    }
                    const file: File = {
                      path,
                      content: data,
                    };
                    fsRes(file);
                  });
                });
              } catch (e) {
                fsRej(e);
              }
            })
        );
        return Promise.all(fileReadPromises).then((files: (File | null)[]) => {
          // Filter out null values (directories)
          const validFiles = files.filter((file): file is File => file !== null);
          res(validFiles);
        });
      }).catch(rej);
    } catch (e) {
      rej(e);
    }
  });
}
