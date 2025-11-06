export default function DashboardLoading() {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="h-12 w-1/2 animate-pulse rounded-md bg-muted mb-4"></div>
          <div className="h-6 w-3/4 animate-pulse rounded-md bg-muted"></div>
        </div>
      </div>
    );
  }
  