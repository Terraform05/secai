"use client";

interface AnalyzeDocumentsProps {
  onAnalyze: () => void;
}

const AnalyzeDocuments: React.FC<AnalyzeDocumentsProps> = ({ onAnalyze }) => {
  return (
    <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <button
        onClick={onAnalyze}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow hover:bg-blue-700 transition-all"
      >
        Analyze Documents
      </button>
    </section>
  );
};

export default AnalyzeDocuments;
