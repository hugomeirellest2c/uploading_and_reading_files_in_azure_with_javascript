const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();

const input = require("fs").readFileSync(
  "./files/" + process.env.FILENAME,
  "utf8"
);

async function main() {
  console.time("Execution Time");

  try {
    const ConnectionStartWithBlobService = () => {
      console.log("Azure Blob storage v12 - JavaScript quickstart sample");

      const AZURE_STORAGE_CONNECTION_STRING =
        process.env.AZURE_STORAGE_CONNECTION_STRING;

      if (!AZURE_STORAGE_CONNECTION_STRING)
        throw Error("Azure Storage Connection string not found");

      return BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
    };

    const CreateContainerBlob = async () => {
      console.log("\nCreating container...");
    
      const containerName = process.env.SLUG.toLowerCase() + "-" + uuidv1();
      console.log("containerName:\t", containerName);

      const containerClient = blobServiceClient.getContainerClient(containerName);

      const createContainerResponse = await containerClient.create();
      console.log(
        `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
      );
      return containerClient
    };

    const BuildBlobClient = (containerClient) => {
      const blobName = uuidv1() + "." + process.env.FILENAME;

      const response = containerClient.getBlockBlobClient(blobName);

      console.log(
        `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${response.url}`
      );

      return response;
    };

    const DownloadData = async (blockBlobClient) => {
      
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
    console.log("\nDownloaded blob content...");
    
      return downloadBlockBlobResponse
    }
    
    const UploadData = async (blockBlobClient) => {
      
      // Upload data to the blob
      const data = input;
      const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
      console.log(
        `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
      );
      return uploadBlobResponse
    }


    const showData = async (data) => {

       //console.log(
        await streamToText(data.readableStreamBody)
       //); 

    }
    const blobServiceClient = await ConnectionStartWithBlobService();

    const containerClient = await CreateContainerBlob();

    const blockBlobClient = await BuildBlobClient(containerClient);
    
    await UploadData(blockBlobClient);

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
    if(i<2) console.log({chunk})
    data += chunk;
    i++;
  }
  console.log({i})
  return data;
}

main()
  .then(() => console.log("\nDone"))
  .catch((ex) => console.log(ex.message));
