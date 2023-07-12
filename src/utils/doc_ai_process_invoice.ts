import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import {
  twoFourtyVolt,
  oneTwentyVolt,
  testData,
} from "./eligible_items/electric_hot_water";
import {
  gasStorage,
  gasTankless,
  gasResiCommercial,
} from "./eligible_items/gas_hot_water";
import { fileTypeFromBuffer } from "file-type";

const GOOGLE_SERVICE_KEY =
  (process.env.GOOGLE_APPLICATION_CREDENTIALS_1 || "") +
  (process.env.GOOGLE_APPLICATION_CREDENTIALS_2 || "");
const stringified = Buffer.from(GOOGLE_SERVICE_KEY || "", "base64")
  .toString()
  .replace(/\n/g, "");
const credential = JSON.parse(stringified);

interface Entity {
  type: string | undefined | null;
  mentionText: string | undefined | null;
  confidence: number | undefined | null;
}

export async function runDocAI(file: Buffer, returnAll = false) {
  const projectId = "homechat";
  const location = "us"; // Format is 'us' or 'eu'
  const processorId = "ba5a9353f63a5ef6"; // Create processor in Cloud Console

  // Instantiates a client
  const client = new DocumentProcessorServiceClient({
    credentials: credential,
  });

  async function processDocument() {
    // The full resource name of the processor, e.g.:
    // projects/project-id/locations/location/processor/processor-id
    // You must create new processors in the Cloud Console first
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    const fileType = await fileTypeFromBuffer(file);

    const request = {
      name,
      rawDocument: {
        content: file.toString("base64"),
        mimeType: fileType?.mime,
      },
      skipHumanReview: true,
      //   fieldMask: F "document.entities",
    };

    // Recognizes text entities in the PDF document
    const [result] = await client.processDocument(request);

    console.log("Document processing complete.");

    // Read fields specificly from the specalized US drivers license processor:
    // https://cloud.google.com/document-ai/docs/processors-list#processor_us-driver-license-parser
    // retriving data from other specalized processors follow a similar pattern.
    // For a complete list of processors see:
    // https://cloud.google.com/document-ai/docs/processors-list
    //
    // OCR and other data is also present in the quality processor's response.
    // Please see the OCR and other samples for how to parse other data in the
    // response.
    const { document } = result;
    if (returnAll) {
      return document;
    }

    const outputObj: { entities: Entity[]; items: Entity[] } = {
      entities: [],
      items: [],
    };
    for (const entity of document?.entities ?? []) {
      // Fields detected. For a full list of fields for each processor see
      // the processor documentation:
      // https://cloud.google.com/document-ai/docs/processors-list

      // const key = entity.type;
      // some other value formats in addition to text are availible
      // e.g. dates: `entity.normalizedValue.dateValue.year`
      const conf = (entity?.confidence || 1) * 100;
      const fields = {
        type: entity.type,
        mentionText: entity.mentionText,
        confidence: entity.confidence,
      };
      // For each property, get the same fields
      entity.properties?.forEach((property) => {
        const fields = {
          type: property.type,
          mentionText: property.mentionText,
          confidence: property.confidence,
        };
        outputObj.entities.push(fields);
      });
      outputObj.entities.push(fields);
    }
    // For each entity in outputObj.entities, find all with a type of line_item/product_code and stick into items array
    outputObj.entities.forEach((entity) => {
      if (entity.type === "line_item/product_code") {
        outputObj.items.push(entity);
      }
    });

    // For each items in the list, search the following arrays for a match of model.
    const toSearch = [
      twoFourtyVolt,
      oneTwentyVolt,
      gasStorage,
      gasTankless,
      gasResiCommercial,
      testData,
    ];

    outputObj.items = outputObj.items.map((item) => {
      const model = item.mentionText;
      const found = toSearch.find((arr) => arr.find((i) => i.Model === model));
      return {
        ...item,
        eligible: found ? "Yes" : "No",
      };
    });

    return outputObj;
  }

  return processDocument();
}
