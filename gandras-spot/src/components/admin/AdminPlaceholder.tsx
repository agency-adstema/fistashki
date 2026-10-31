export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-black text-black">{title}</h1>
        <p className="mt-2 text-gray-500">UI spreman — backend integracija u sledećoj fazi.</p>
      </div>
    </div>
  );
}
