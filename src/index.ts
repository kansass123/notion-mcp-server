
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const parentPageId = process.env.NOTION_PAGE_ID;

app.get("/ping", (_: any, res: any) => {
  res.status(200).json({ message: "Pong" });
});

app.post("/tool/make_page", async (req: any, res: any) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Missing 'title' or 'content'" });
  }

  try {
    const response = await notion.pages.create({
      parent: { page_id: parentPageId || "MISSING_PAGE_ID" },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content,
                },
              },
            ],
          },
        },
      ],
    });

    res.status(200).json({ message: "Page created", id: response.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Notion error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    res.status(500).json({ error: "Failed to create page" });
  }
});

app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
