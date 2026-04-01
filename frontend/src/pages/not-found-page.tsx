import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/shared/empty-state";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="section-shell py-24">
      <EmptyState
        title="This route drifted off the grid"
        description="The page you requested is not available. Head back to the storefront and continue exploring the platform."
        actionLabel="Return Home"
        onAction={() => navigate("/")}
      />
    </main>
  );
};
