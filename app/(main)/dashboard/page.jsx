import { getIndustryInsights } from "../../../actions/dashboard";
import { getUserOnboardingStatus } from "../../../actions/user";
import { redirect } from "next/navigation";
import DashboardView from "./_components/dashboard-view";

const IndustryInsightsPage = async () => {
  const { isOnBoarded } = await getUserOnboardingStatus();
  if (!isOnBoarded) {
    redirect("/onboarding");
  }
  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto ">
      <DashboardView insights={insights} />
    </div>
  );
};

export default IndustryInsightsPage;
