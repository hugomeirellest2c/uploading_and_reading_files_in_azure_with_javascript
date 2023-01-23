const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

console.log(`Lendo o arquivo online: \n\n\t${process.env.FILE}\n`);
console.log(`Dentro do container online: \n\n\t${process.env.CONTAINER}\n`);

// The sample starts here

async function main() {
  console.time("Execution Time");

  try {
    const ConnectionStartWithBlobService = () => {
      console.log("Azure blob storage - Starting connection...");

      const AZURE_STORAGE_CONNECTION_STRING =
        process.env.AZURE_STORAGE_CONNECTION_STRING;

      if (!AZURE_STORAGE_CONNECTION_STRING)
        throw Error("Azure Storage Connection string not found");
      else console.log("\n\tConnection was successfully established!");

      return BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
    };

    const DownloadData = async (blockBlobClient) => {
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      console.log("\nDownloaded blob content...\n");

      return downloadBlockBlobResponse;
    };

    const showData = async (data) => {
      //console.log(
      await streamToText(data.readableStreamBody);
      //);
    };

    const blobServiceClient = await ConnectionStartWithBlobService();

    const containerClient = blobServiceClient.getContainerClient(
      process.env.CONTAINER
    );

    const blockBlobClient = containerClient.getBlockBlobClient(
      process.env.FILE
    );

    const dataRead = await DownloadData(blockBlobClient);

    await showData(dataRead);

    console.timeEnd("Execution Time");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function streamToText(readable) {
  readable.setEncoding("utf8");
  let data = "";
  let i = 0;
  for await (const chunk of readable) {
    if (i < 2) console.log({ chunk });
    data += chunk;
    i++;
  }
  console.log("Total de chunks: " + i);
  return data;
}

main()
  .then(() => console.log("\nDone"))
  .catch((ex) => console.log(ex.message));
