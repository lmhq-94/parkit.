import { PageLoader } from "@/components/PageLoader";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[200px]">
      <PageLoader />
    </div>
  );
}
