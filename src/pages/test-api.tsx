
import { TestAnalysisConnection } from "@/components/TestAnalysisConnection";
import { Shell } from "@/components/Shell";

export default function TestApiPage() {
  return (
    <Shell>
      <div className="py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">API Connection Test</h1>
        <TestAnalysisConnection />
      </div>
    </Shell>
  );
}
