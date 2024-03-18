"use client";

import { parse } from "@/app/import/american-express/import";
import {
  categorizeTransaction,
  Category,
  type ParsedRow,
} from "@/app/import/helpers";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReloadIcon, UploadIcon } from "@radix-ui/react-icons";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  input: z.string().min(2),
});
export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { input: "" },
  });
  const [result, setResult] = useState<ParsedRow[]>([]);
  const ledger = result
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((i) => {
      const firstLine =
        i.amount < 0 ? i.category : "Liabilities:Credit Card:Amex";
      const secondLine =
        i.amount < 0 ? "Liabilities:Credit Card:Amex" : i.category;
      return `${i.date.toISOString().substring(0, 10)} ${i.description}${
        i.notes ? `; ${i.notes}` : ""
      }
    ${firstLine}          ${(-1 * i.amount).toFixed(2)} EUR
    ${secondLine}`;
    })
    .join("\n\n");
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setResult([]);
    const rows = parse(values.input);
    for (const row of rows) {
      try {
        const category = await categorizeTransaction(row);
        row.category = category;
      } catch (error) {
        // Ignore errors
      }
      setResult((prev) => [...prev, row]);
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("import:american-express");
    if (stored) form.setValue("input", stored);
  }, [form]);

  return (
    <main>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="shadcn"
                    onInput={(event) => {
                      if (
                        "value" in event.target &&
                        typeof event.target.value === "string"
                      ) {
                        const value = event.target.value;
                        requestIdleCallback(() =>
                          localStorage.setItem("import:american-express", value)
                        );
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadIcon className="mr-2 h-4 w-4" />
            )}
            Import
          </Button>
        </form>
      </Form>
      <div className="grid grid-cols-2 mt-8 gap-2">
        {result
          // Sort by category with unknown at the top, then by description
          .sort((a, b) =>
            a.category === Category["Expenses:UNKNOWN"]
              ? -1
              : b.category === Category["Expenses:UNKNOWN"]
              ? 1
              : a.category.localeCompare(b.category) ||
                a.description.localeCompare(b.description)
          )
          .map((row, index) => (
            <Fragment key={index}>
              <div className="truncate">{row.description}</div>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2">
                  {row.category.startsWith("Income")
                    ? "💰"
                    : row.category.startsWith("Expenses:Housing")
                    ? "🏠"
                    : row.category.startsWith("Expenses:Utilities")
                    ? "💡"
                    : row.category.endsWith(":Groceries")
                    ? "🥦"
                    : row.category.endsWith(":Coffee")
                    ? "☕"
                    : row.category.startsWith("Expenses:Food")
                    ? "🍔"
                    : row.category.startsWith("Expenses:Transport")
                    ? "🚕"
                    : row.category.startsWith("Expenses:Shopping")
                    ? "🛍️"
                    : row.category.startsWith("Expenses:Insurance")
                    ? "🛡️"
                    : row.category.startsWith("Expenses:Care")
                    ? "🏋️"
                    : row.category.startsWith("Expenses:Fun")
                    ? "🎉"
                    : row.category.startsWith("Expenses:Services")
                    ? "🔧"
                    : "⚠️"}
                </span>
                <select
                  value={row.category}
                  className={
                    row.category === "Expenses:UNKNOWN"
                      ? "text-amber-600 pl-5 w-full"
                      : "pl-5 w-full"
                  }
                  onChange={(event) => {
                    const category = event.target.value as Category;
                    setResult((result) =>
                      result.map((r) =>
                        r.description === row.description
                          ? { ...r, category }
                          : r
                      )
                    );
                    const cache = localStorage.getItem(
                      "categorizeTransactionCache"
                    );
                    const parsedCache = cache ? JSON.parse(cache) : {};
                    parsedCache[row.description] = category;
                    localStorage.setItem(
                      "categorizeTransactionCache",
                      JSON.stringify(parsedCache)
                    );
                  }}
                >
                  {Object.keys(Category).map((category) => (
                    <option key={category} value={category}>
                      {category === "UNKNOWN"
                        ? "Missing category"
                        : category.split(":").join(" › ")}
                    </option>
                  ))}
                </select>
              </div>
            </Fragment>
          ))}
      </div>
      <Button
        className="mt-8"
        onClick={() => navigator.clipboard.writeText(ledger)}
      >
        Copy
      </Button>
      <output className="mt-2 bg-slate-100 block border p-4 rounded-md shadow-sm text-sm overflow-auto">
        <pre>{ledger}</pre>
      </output>
    </main>
  );
}
