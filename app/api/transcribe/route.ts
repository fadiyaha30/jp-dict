import "server-only";
import { NextResponse } from "next/server";
import { nodewhisper } from "nodejs-whisper";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function POST(req: Request) {
  let tmpPath: string | null = null;
  try {
    const form = await req.formData();
    const audio = form.get("audio") as File | null;
    if (!audio) return NextResponse.json({ error: "No audio provided" }, { status: 400 });

    const buffer = Buffer.from(await audio.arrayBuffer());
    tmpPath = path.join(tmpdir(), `whisper-${Date.now()}.webm`);
    await writeFile(tmpPath, buffer);

    const transcript = await nodewhisper(tmpPath, {
      modelName: "small",
      autoDownloadModelName: "small",
      removeWavFileAfterTranscription: true,
      logger: { debug: () => {}, error: console.error } as unknown as Console,
      whisperOptions: {
        outputInText: true,
        language: "ja",
        wordTimestamps: false,
      },
    });

    const clean = (transcript as string)
      .replace(/\[[\d:.]+ --> [\d:.]+\]\s*/g, "")
      .trim();
    return NextResponse.json({ transcript: clean });
  } catch (err: any) {
    console.error("transcribe error:", err);
    return NextResponse.json({ error: err.message ?? "Transcription failed" }, { status: 500 });
  } finally {
    if (tmpPath) unlink(tmpPath).catch(() => {});
  }
}
