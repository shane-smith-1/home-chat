import { NextRequest, NextResponse } from "next/server";
import { runDocAI } from "@/utils/doc_ai_process_invoice";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json(
      { error: "File blob is required." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const docAi = await runDocAI(buffer, true);

  return NextResponse.json(docAi);
}
