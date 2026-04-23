// app/page.tsx
import Form from '@/components/Form';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900/60 p-8 shadow-xl border border-slate-800">
        <h1 className="text-3xl font-semibold mb-4">
          Configurateur de cuisine
        </h1>
        <Form />
      </div>
    </main>
  );
}