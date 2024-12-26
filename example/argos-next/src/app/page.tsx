import { ImpressionManager } from './components/ImpressionManager';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Argos SDK Demo</h1>

        <div className="bg-gray-50 p-6 rounded-lg mb-8 text-black">
          <h2 className="text-2xl font-semibold mb-4">About This Demo</h2>
          <p className="mb-4">
            This demo showcases the environment-agnostic capabilities of the
            Argos SDK, demonstrating both client-side and server-side
            implementations in a Next.js application.
          </p>
          <div className="space-y-2">
            <h3 className="font-semibold">Key Features:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Client-side impression tracking using React hooks</li>
              <li>Server-side impression management via API routes</li>
              <li>Fingerprint integration for user tracking</li>
              <li>Real-time updates and state management</li>
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Documentation:</h3>
            <div className="space-x-4">
              <a
                href="https://github.com/Oneirocom/argos-sdk"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                SDK Documentation
              </a>
              <a
                href="https://github.com/Oneirocom/argos-sdk/tree/main/example/argos-next"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Demo Source Code
              </a>
            </div>
          </div>
        </div>

        <ImpressionManager />
      </div>
    </main>
  );
}
