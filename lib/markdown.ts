import type { EntryFormValues } from "@/lib/defaultEntry";

function markdownList(items: string[]) {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  return clean.length ? clean.map((item) => `- ${item}`) : ["- "];
}

export function buildMarkdown(date: string, entry: EntryFormValues) {
  const priorityLines = entry.priorities.map(
    (item, index) => `- [${item.done ? "x" : " "}]  ${index + 1}${item.text ? `. ${item.text}` : ""}`
  );

  return [
    `# Daily Update - ${date}`,
    "",
    "Top 3 Priorities:",
    "",
    ...priorityLines,
    "",
    "### 2. Tasks Completed:",
    "",
    ...markdownList(entry.completed),
    "",
    "### 3. Pending Tasks & Reasons:",
    "",
    ...markdownList(entry.pending),
    "",
    "### 4. Daily Reflection/how I am feeling",
    "",
    `- **Reflection:** ${entry.reflection || ""}`,
    `- **What went well:** ${entry.wentWell || ""}`,
    `- **Challenges faced:** ${entry.challenges || ""}`,
    "",
    "### 5. Next Steps:",
    "",
    ...markdownList(entry.nextSteps),
    "",
    "### 6. Gratitude",
    "",
    ...markdownList(entry.gratitude),
    "",
    "### 7. Life Force",
    "",
    `- Physical${entry.lifeForcePhysical ? `: ${entry.lifeForcePhysical}` : ""}`,
    `- Human${entry.lifeForceHuman ? `: ${entry.lifeForceHuman}` : ""}`,
    `- Self${entry.lifeForceSelf ? `: ${entry.lifeForceSelf}` : ""}`,
    "",
    "### 8. How can I Improve",
    "",
    entry.improve || "",
  ].join("\n");
}
