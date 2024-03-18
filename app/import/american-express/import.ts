import {
  Category,
  cleanDescription,
  type ParsedRow,
} from "@/app/import/helpers";

export const parse = (input: string): ParsedRow[] => {
  const lines = input.replaceAll("\nCrediting\n", "").split("\n");
  const data: ParsedRow[] = [];

  lines.forEach((line, index, array) => {
    // If the line is in the format "Jan 4" or "Feb 29" or "Dec 31 2023"
    const isDateLine = /^([A-Z][a-z]{2} \d{1,2})(?: \d{4})?$/.test(line);
    if (!isDateLine) return;

    // If it doesn't include a year ("Jan 4"), add the current year ("Jan 4 2023")
    if (!/\d{4}/.test(line)) line = `${line} ${new Date().getFullYear()}`;

    const descriptionLine = array[index + 1];
    // Convert uppercase to sentence case
    const description = descriptionLine
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

    // Amount should be in the format "€123.00" or "€ -1,234.00"
    const amountLine = array[index + 3];
    if (!amountLine.startsWith("€")) {
      console.error("Invalid amount line", amountLine);
      return;
    }
    const amount = parseFloat(amountLine.replace("€", "").replace(",", ""));

    data.push({
      date: new Date(line),
      description: cleanDescription(description),
      amount,
      category: Category["Expenses:UNKNOWN"],
    });
  });

  return data;
};
