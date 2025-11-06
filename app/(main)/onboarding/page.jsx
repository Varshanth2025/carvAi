import { industries } from "../../../data/industries";
import { getUserOnboardingStatus } from "../../../actions/user";
import { redirect } from "next/navigation";
import OnBordingForm from "./_components/onboarding-form";
const OnBoardingPage = async () => {
  const { isOnBoarded } = await getUserOnboardingStatus();
  if (isOnBoarded) {
    redirect("/dashboard");
  }
  return (
    <main>
      <OnBordingForm industries={industries} />
    </main>
  );
};

export default OnBoardingPage;
