type Insight = { title: string; description: string };

export function Phase1Insights({ items }: { items: Insight[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="rounded-lg border border-[#2d3a4d] border-l-[3px] border-l-[#38bdf8] bg-[#121a26]/80 p-4"
        >
          <p className="font-semibold text-white">{item.title}</p>
          <p className="mt-1 text-sm text-[#8da2b2]">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
