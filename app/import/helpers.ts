export enum Category {
  "Expenses:UNKNOWN" = "Expenses:UNKNOWN",
  "Expenses:Housing" = "Expenses:Housing",
  "Expenses:Housing:Rent" = "Expenses:Housing:Rent",
  "Expenses:Housing:Mortgage" = "Expenses:Housing:Mortgage",
  "Expenses:Housing:Storage" = "Expenses:Housing:Storage",
  "Expenses:Housing:Taxes" = "Expenses:Housing:Taxes",
  "Expenses:Housing:Maintenance & Repairs" = "Expenses:Housing:Maintenance & Repairs",
  "Expenses:Utilities" = "Expenses:Utilities",
  "Expenses:Utilities:Electricity" = "Expenses:Utilities:Electricity",
  "Expenses:Utilities:Heating" = "Expenses:Utilities:Heating",
  "Expenses:Utilities:Water" = "Expenses:Utilities:Water",
  "Expenses:Utilities:Internet" = "Expenses:Utilities:Internet",
  "Expenses:Utilities:Phone" = "Expenses:Utilities:Phone",
  "Expenses:Food" = "Expenses:Food",
  "Expenses:Food:Groceries" = "Expenses:Food:Groceries",
  "Expenses:Food:Restaurants" = "Expenses:Food:Restaurants",
  "Expenses:Food:Takeout" = "Expenses:Food:Takeout",
  "Expenses:Food:Coffee" = "Expenses:Food:Coffee",
  "Expenses:Food:Alcohol" = "Expenses:Food:Alcohol",
  "Expenses:Transport" = "Expenses:Transport",
  "Expenses:Transport:Public" = "Expenses:Transport:Public",
  "Expenses:Transport:Fuel" = "Expenses:Transport:Fuel",
  "Expenses:Transport:Taxi" = "Expenses:Transport:Taxi",
  "Expenses:Transport:Bike" = "Expenses:Transport:Bike",
  "Expenses:Insurance" = "Expenses:Insurance",
  "Expenses:Insurance:Life" = "Expenses:Insurance:Life",
  "Expenses:Insurance:Health" = "Expenses:Insurance:Health",
  "Expenses:Insurance:Home" = "Expenses:Insurance:Home",
  "Expenses:Shopping" = "Expenses:Shopping",
  "Expenses:Shopping:Clothes" = "Expenses:Shopping:Clothes",
  "Expenses:Shopping:Electronics" = "Expenses:Shopping:Electronics",
  "Expenses:Shopping:Furniture" = "Expenses:Shopping:Furniture",
  "Expenses:Shopping:Books" = "Expenses:Shopping:Books",
  "Expenses:Shopping:Software" = "Expenses:Shopping:Software",
  "Expenses:Shopping:Personal Care" = "Expenses:Shopping:Personal Care",
  "Expenses:Shopping:Home Improvement" = "Expenses:Shopping:Home Improvement",
  "Expenses:Shopping:Gifts" = "Expenses:Shopping:Gifts",
  "Expenses:Care" = "Expenses:Care",
  "Expenses:Care:Restrooms" = "Expenses:Care:Restrooms",
  "Expenses:Care:Health" = "Expenses:Care:Health",
  "Expenses:Care:Health:Dentist" = "Expenses:Care:Health:Dentist",
  "Expenses:Care:Health:Pharmacy" = "Expenses:Care:Health:Pharmacy",
  "Expenses:Care:Health:Recreational Drugs" = "Expenses:Care:Health:Recreational Drugs",
  "Expenses:Care:Salon" = "Expenses:Care:Salon",
  "Expenses:Care:Gym" = "Expenses:Care:Gym",
  "Expenses:Care:Trainer" = "Expenses:Care:Trainer",
  "Expenses:Fun" = "Expenses:Fun",
  "Expenses:Fun:Entertainment" = "Expenses:Fun:Entertainment",
  "Expenses:Fun:Entertainment:Streaming" = "Expenses:Fun:Entertainment:Streaming",
  "Expenses:Fun:Entertainment:Tickets" = "Expenses:Fun:Entertainment:Tickets",
  "Expenses:Fun:Entertainment:Tickets:Movies" = "Expenses:Fun:Entertainment:Tickets:Movies",
  "Expenses:Fun:Entertainment:Tickets:Parties" = "Expenses:Fun:Entertainment:Tickets:Parties",
  "Expenses:Fun:Entertainment:Tickets:Standup" = "Expenses:Fun:Entertainment:Tickets:Standup",
  "Expenses:Fun:Entertainment:Tickets:Gaming" = "Expenses:Fun:Entertainment:Tickets:Gaming",
  "Expenses:Fun:Entertainment:Tickets:Concerts" = "Expenses:Fun:Entertainment:Tickets:Concerts",
  "Expenses:Fun:Entertainment:Tickets:Museums" = "Expenses:Fun:Entertainment:Tickets:Museums",
  "Expenses:Fun:Travel" = "Expenses:Fun:Travel",
  "Expenses:Fun:Travel:Transport" = "Expenses:Fun:Travel:Transport",
  "Expenses:Fun:Travel:Stay" = "Expenses:Fun:Travel:Stay",
  "Expenses:Fun:Travel:Food & Drinks" = "Expenses:Fun:Travel:Food & Drinks",
  "Expenses:Fun:Travel:Activities" = "Expenses:Fun:Travel:Activities",
  "Expenses:Fun:Hobbies" = "Expenses:Fun:Hobbies",
  "Expenses:Fun:Hobbies:Social Media" = "Expenses:Fun:Hobbies:Social Media",
  "Expenses:Fun:Hobbies:Domains & Hosting" = "Expenses:Fun:Hobbies:Domains & Hosting",
  "Expenses:Services" = "Expenses:Services",
  "Expenses:Services:Education" = "Expenses:Services:Education",
  "Expenses:Services:Tax Advice" = "Expenses:Services:Tax Advice",
  "Expenses:Services:Bank Fees" = "Expenses:Services:Bank Fees",
  "Expenses:Investments" = "Expenses:Investments",
  "Expenses:Giving" = "Expenses:Giving",
  "Income:Salary" = "Income:Salary",
  "Income:Freelance" = "Income:Freelance",
  "Income:Gifts" = "Income:Gifts",
  "Income:Refunds" = "Income:Refunds",
  "Income:Rewards" = "Income:Rewards",
}

export interface ParsedRow {
  date: Date;
  description: string;
  notes?: string;
  amount: number;
  category: Category;
}

export const cleanDescription = (description: string): string => {
  const removeStart = ["Zettle *", "SumUp *", "Sumup *", "CCV*", "Mollie="];
  for (const start of removeStart)
    if (description.startsWith(start))
      description = description.replace(start, "");

  // If previous line ends with pass details, e.g., "Example,PAS582", keep "Example" as the description
  if (description.includes(",PAS")) description = description.slice(0, -7);

  // If description is " via Mollie" then only keep the part before " via "
  if (description.includes(" via "))
    description = description.split(" via ")[0];
  return description;
};

export const categorizeTransaction = async ({
  amount,
  description,
}: ParsedRow): Promise<Category> => {
  let category = Category["Expenses:UNKNOWN"];
  const cache = localStorage.getItem("categorizeTransactionCache");
  if (cache) {
    const parsedCache = JSON.parse(cache) as Record<string, Category>;
    if (parsedCache[description]) return parsedCache[description];
  }

  const STARTS_WITH_MAP: Record<string, Category> = {
    Safekey: Category["Income:Rewards"],
    "ABN AMRO Bank N.V.": Category["Expenses:Services:Tax Advice"],
    "NS GROEP": Category["Expenses:Transport:Public"],
    ODIDO: Category["Expenses:Utilities:Phone"],
    "ALBERT HEIJN": Category["Expenses:Food:Groceries"],
    Jumbo: Category["Expenses:Food:Groceries"],
    "Uber Eats": Category["Expenses:Food:Takeout"],
    SWAPFIETS: Category["Expenses:Transport:Bike"],
    "HEMA Verzekeringen": Category["Expenses:Insurance:Health"],
    "Basic Fit": Category["Expenses:Care:Gym"],
    Xenos: Category["Expenses:Shopping:Home Improvement"],
    TivoliVredenburg: Category["Expenses:Fun:Entertainment:Tickets:Concerts"],
    "Nationale-Nederlanden": Category["Expenses:Insurance:Life"],
    HEMA: Category["Expenses:Shopping:Home Improvement"],
    "Manneken Pis": Category["Expenses:Food:Takeout"],
    "DTS Duijn's Tax Solution": Category["Expenses:Housing:Taxes"],
    "Monthly Card Membership Fee": Category["Expenses:Services:Bank Fees"],
  };
  const ENDS_WITH_MAP: Record<string, Category> = {};
  const INCLUDES_MAP: Record<string, Category> = {
    Taxi: Category["Expenses:Transport:Taxi"],
  };

  Object.entries(STARTS_WITH_MAP).forEach(([startsWith, cat]) => {
    if (
      description.toUpperCase().startsWith(`${startsWith} `.toUpperCase()) ||
      description.toUpperCase() === startsWith.toUpperCase()
    )
      category = cat;
  });
  Object.entries(ENDS_WITH_MAP).forEach(([endsWith, cat]) => {
    if (
      description.toUpperCase().endsWith(` ${endsWith}`.toUpperCase()) ||
      description.toUpperCase() === endsWith.toUpperCase()
    )
      category = cat;
  });
  Object.entries(INCLUDES_MAP).forEach(([includes, cat]) => {
    if (
      description.toUpperCase().includes(` ${includes} `.toUpperCase()) ||
      description.toUpperCase().endsWith(` ${includes}`.toUpperCase()) ||
      description.toUpperCase().startsWith(`${includes} `.toUpperCase()) ||
      description.toUpperCase() === includes.toUpperCase()
    )
      category = cat;
  });

  if (category === Category["Expenses:UNKNOWN"] && amount > 0) {
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a bank transaction classification assistant. You have to classify the provided transaction as one of the following categories:

${Object.values(Category).join("\n")}`,
          },
          { role: "user", content: "Ikea Utrecht - If Utrecht" },
          { role: "system", content: Category["Expenses:Shopping:Furniture"] },
          { role: "user", content: "The Store 19AB9C" },
          { role: "system", content: Category["Expenses:UNKNOWN"] },
          { role: "user", content: "Uber Eats https://help.ub" },
          { role: "system", content: Category["Expenses:Food:Takeout"] },
          { role: "user", content: description },
        ],
      }),
    });
    const data = await response.json();
    const result = data.choices[0]?.message?.content;
    if (Object.values(Category).includes(result)) category = result;
    else console.error("Unknown category:", result);
  }

  if (category !== Category["Expenses:UNKNOWN"]) {
    const cache = localStorage.getItem("categorizeTransactionCache");
    const parsedCache = cache ? JSON.parse(cache) : {};
    parsedCache[description] = category;
    localStorage.setItem(
      "categorizeTransactionCache",
      JSON.stringify(parsedCache)
    );
  }
  return category;
};
