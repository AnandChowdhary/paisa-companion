import Link from "next/link";

export default function Home() {
  return (
    <header className="p-8">
      <nav>
        <Link href="/">Dashboard</Link>
        <Link href="/">Import</Link>
      </nav>
    </header>
  );
}
