
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

// Init Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const parentPageId = process.env.NOTION_PAGE_ID;

// Health check
app.get("/ping", (_, res) => {
  res.status(200).json({ message: "Pong" });
});

// Create a Notion page
app.post("/tool/make_page", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Missing 'title' or 'content'" });
  }

  try {
    const response = await notion.pages.create({
      parent: { page_id: parentPageId },
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
  } catch (error) {
    console.error("Notion error:", error.body || error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
