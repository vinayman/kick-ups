import WebcamPrompt from "@/components/WebcamPrompt";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 pt-16 sm:p-8">
      <div className="w-full max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center">
        <WebcamPrompt />
      </div>
    </main>
  );
}
