import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";

const youTube_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w\-]{11}(&\S*)?$/;

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const isYoutube = youTube_REGEX.test(data.url);

    if (!isYoutube) {
      return NextResponse.json(
        {
          message: "Wrong URL format",
        },
        {
          status: 411,
        }
      );
    }

    const extractedId = data.url.split("?v=")[1];

    const videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);

    const thumbnails = videoDetails?.thumbnail?.thumbnails.sort(
      (a: { width: number }, b: { width: number }) => b.width - a.width
    );

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: videoDetails?.title ?? "Title not found",
        bigImg:
          thumbnails[0]?.url ??
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fcats&psig=AOvVaw29Fz1wkvZPdZBF5QA2cH-u&ust=1751657624212000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNDhx6W3oY4DFQAAAAAdAAAAABAE",
        smallImg:
          thumbnails[1]?.url ??
          thumbnails[0]?.url ??
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fcats&psig=AOvVaw29Fz1wkvZPdZBF5QA2cH-u&ust=1751657624212000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNDhx6W3oY4DFQAAAAAdAAAAABAE",
      },
    });

    return NextResponse.json({
      message: "Stream added successfully",
      streamId: stream.id,
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Error while adding a stream",
      },
      {
        status: 411,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const streams = await prismaClient.stream.findMany({
    where: {
      userId: creatorId ?? "",
    },
  });

  return NextResponse.json({
    streams,
  });
}
