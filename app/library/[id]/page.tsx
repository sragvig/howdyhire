import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PastInterviewView } from "@/components/library/PastInterviewView";

// `params` is runtime data under cacheComponents, so read it inside a Suspense boundary.
async function PastInterview({ params }: { params: PageProps<"/library/[id]">["params"] }) {
  const { id } = await params;
  return <PastInterviewView id={id} />;
}

export default function PastInterviewPage({ params }: PageProps<"/library/[id]">) {
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading" />
          </div>
        }
      >
        <PastInterview params={params} />
      </Suspense>
    </div>
  );
}
