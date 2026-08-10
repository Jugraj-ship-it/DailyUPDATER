"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Users, Plus, X, Copy, Download, ArrowRight } from "lucide-react";
import { saveEntry } from "@/app/actions/entries";
import { buildMarkdown } from "@/lib/markdown";
import type { EntryFormValues } from "@/lib/defaultEntry";

const btn =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm text-ink transition-colors hover:border-line-strong hover:bg-panel-soft";
const iconBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-ink transition-colors hover:border-line-strong hover:bg-panel-soft";
const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-shadow placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent-soft";

function ListEditor({
  label,
  items,
  onChange,
}: {
  label?: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {label && <h2 className="font-medium">{label}</h2>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              className={input}
              value={item}
              placeholder="Add item"
              onChange={(e) => {
                const next = [...items];
                next[index] = e.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className={iconBtn}
              aria-label="Remove item"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={btn} onClick={() => onChange([...items, ""])}>
        <Plus size={15} />
        Add
      </button>
    </div>
  );
}

function PrivacyToggle({ shared, onToggle }: { shared: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
        shared
          ? "border-[#bde5dd] bg-accent-soft text-accent-dark"
          : "border-line bg-panel text-ink hover:border-line-strong"
      }`}
    >
      {shared ? <Users size={15} /> : <Lock size={15} />}
      {shared ? "Shared with friends" : "Private"}
    </button>
  );
}

function SectionHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-medium">{title}</h2>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export default function EntryForm({
  date,
  initial,
  historyDates,
}: {
  date: string;
  initial: EntryFormValues;
  historyDates: string[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof EntryFormValues>(key: K, value: EntryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setStatus("Saving...");
    startTransition(async () => {
      try {
        await saveEntry({ date, ...values });
        setStatus(`Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
        router.refresh();
      } catch {
        setStatus("Could not save - try again");
      }
    });
  }

  async function handleCopy() {
    const markdown = buildMarkdown(date, values);
    try {
      await navigator.clipboard.writeText(markdown);
      setExportMessage("Copied Markdown");
    } catch {
      setExportMessage("Could not copy");
    }
  }

  function handleDownload() {
    const markdown = buildMarkdown(date, values);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily-update-${date}.md`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportMessage("Downloaded Markdown");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
      <section className="border-b border-line p-5">
        <SectionHeading title="1. Top 3 Priorities" />
        <div className="space-y-2">
          {values.priorities.map((p, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 accent-accent"
                checked={p.done}
                onChange={(e) => {
                  const next = [...values.priorities];
                  next[index] = { ...next[index], done: e.target.checked };
                  set("priorities", next);
                }}
              />
              <input
                className={input}
                value={p.text}
                placeholder={`Priority ${index + 1}`}
                onChange={(e) => {
                  const next = [...values.priorities];
                  next[index] = { ...next[index], text: e.target.value };
                  set("priorities", next);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line p-5">
        <ListEditor label="2. Tasks Completed" items={values.completed} onChange={(v) => set("completed", v)} />
      </section>

      <section className="border-b border-line p-5">
        <ListEditor label="3. Pending Tasks & Reasons" items={values.pending} onChange={(v) => set("pending", v)} />
      </section>

      <section className="border-b border-line p-5">
        <SectionHeading title="4. Daily Reflection / How I Am Feeling">
          <PrivacyToggle
            shared={values.shareReflection}
            onToggle={() => set("shareReflection", !values.shareReflection)}
          />
        </SectionHeading>
        <div className="space-y-2">
          <textarea
            className={input}
            rows={2}
            placeholder="Reflection"
            value={values.reflection}
            onChange={(e) => set("reflection", e.target.value)}
          />
          <textarea
            className={input}
            rows={2}
            placeholder="What went well"
            value={values.wentWell}
            onChange={(e) => set("wentWell", e.target.value)}
          />
          <textarea
            className={input}
            rows={2}
            placeholder="Challenges faced"
            value={values.challenges}
            onChange={(e) => set("challenges", e.target.value)}
          />
        </div>
      </section>

      <section className="border-b border-line p-5">
        <ListEditor label="5. Next Steps" items={values.nextSteps} onChange={(v) => set("nextSteps", v)} />
      </section>

      <section className="border-b border-line p-5">
        <SectionHeading title="6. Gratitude">
          <PrivacyToggle
            shared={values.shareGratitude}
            onToggle={() => set("shareGratitude", !values.shareGratitude)}
          />
        </SectionHeading>
        <ListEditor items={values.gratitude} onChange={(v) => set("gratitude", v)} />
      </section>

      <section className="border-b border-line p-5">
        <SectionHeading title="7. Life Force">
          <PrivacyToggle
            shared={values.shareLifeForce}
            onToggle={() => set("shareLifeForce", !values.shareLifeForce)}
          />
        </SectionHeading>
        <div className="space-y-2">
          <textarea
            className={input}
            rows={2}
            placeholder="Physical"
            value={values.lifeForcePhysical}
            onChange={(e) => set("lifeForcePhysical", e.target.value)}
          />
          <textarea
            className={input}
            rows={2}
            placeholder="Human"
            value={values.lifeForceHuman}
            onChange={(e) => set("lifeForceHuman", e.target.value)}
          />
          <textarea
            className={input}
            rows={2}
            placeholder="Self"
            value={values.lifeForceSelf}
            onChange={(e) => set("lifeForceSelf", e.target.value)}
          />
        </div>
      </section>

      <section className="border-b border-line p-5">
        <SectionHeading title="8. How Can I Improve">
          <PrivacyToggle shared={values.shareImprove} onToggle={() => set("shareImprove", !values.shareImprove)} />
        </SectionHeading>
        <textarea
          className={input}
          rows={3}
          value={values.improve}
          onChange={(e) => set("improve", e.target.value)}
        />
      </section>

      <section className="flex items-center gap-3 border-b border-line p-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          Save
        </button>
        <span className="min-h-[1.4em] text-sm text-muted">{status}</span>
      </section>

      <section className="border-b border-line p-5">
        <h2 className="mb-3 font-medium">Export</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btn} onClick={handleCopy}>
            <Copy size={15} />
            Copy Markdown
          </button>
          <button type="button" className={btn} onClick={handleDownload}>
            <Download size={15} />
            Download
          </button>
          <span className="text-sm text-muted">{exportMessage}</span>
        </div>
      </section>

      <section className="p-5">
        <h2 className="mb-3 font-medium">History</h2>
        {historyDates.length === 0 ? (
          <p className="text-sm text-muted">No saved days yet</p>
        ) : (
          <div className="space-y-2">
            {historyDates.map((d) => (
              <a
                key={d}
                href={d === new Date().toISOString().slice(0, 10) ? "/" : `/?date=${d}`}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                  d === date
                    ? "border-[#bde5dd] bg-accent-soft text-accent-dark"
                    : "border-line bg-panel text-ink hover:border-line-strong"
                }`}
              >
                <span>
                  {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
                    new Date(`${d}T12:00:00`)
                  )}
                </span>
                <ArrowRight size={16} />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
