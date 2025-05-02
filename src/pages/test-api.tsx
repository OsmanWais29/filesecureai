
import { TestAnalysisConnection } from "@/components/TestAnalysisConnection";
import { MainLayout } from "@/components/layout/MainLayout";

export default function TestApiPage() {
  return (
    <MainLayout>
      <div className="py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">API Connection Test</h1>
        <TestAnalysisConnection />
      </div>
    </MainLayout>
  );
}
