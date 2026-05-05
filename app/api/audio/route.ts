import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { AUDIO_ID_TO_CONDITION } from '@/lib/stimuli';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room');
  const audioId = searchParams.get('id');

  if (!room || !audioId) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const condition = AUDIO_ID_TO_CONDITION[audioId];
  if (!condition) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Sanitize room to prevent directory traversal
  const safeRoom = path.basename(room);
  const conditionFileMap: Record<string, string> = {
    gt: 'gt.wav',
    ours: 'ours.wav',
    scratch: 'scratch.wav',
    image2reverb: 'image2reverb.wav',
  };

  const filename = conditionFileMap[condition];
  if (!filename) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'public', 'stimuli', safeRoom, filename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const rangeHeader = req.headers.get('range');

  if (rangeHeader) {
    const [startStr, endStr] = rangeHeader.replace('bytes=', '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });
    const body = new ReadableStream({
      start(controller) {
        stream.on('data', chunk => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', err => controller.error(err));
      },
    });
    return new NextResponse(body, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
      },
    });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/wav',
      'Content-Length': String(stat.size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    },
  });
}
