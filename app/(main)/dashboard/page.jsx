import { getUserOnboardingStatus } from "../../../actions/user";
import { redirect } from "next/navigation";

const IndustryInsightsPage = async () => {
  const { isOnBoarded } = await getUserOnboardingStatus();
  if (!isOnBoarded) {
    redirect("/onboarding");
  }

  return <div>IndustryInsightsPage</div>;
};

export default IndustryInsightsPage;
