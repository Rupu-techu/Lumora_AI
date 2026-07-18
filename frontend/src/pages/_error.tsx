import type { NextPageContext } from "next";

type ErrorPageProps = {
  statusCode?: number;
};

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-3xl font-extrabold text-white">Something went wrong</h1>
        <p className="text-slate-400 text-sm">
          {statusCode ? `An error occurred on the server (status ${statusCode}).` : "An unexpected error occurred."}
        </p>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 404;
  return { statusCode };
};
