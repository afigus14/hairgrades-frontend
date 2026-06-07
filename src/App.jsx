if (window.location.pathname === "/update-password") {
  window.location.href = "/#/update-password";
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import JoinAsStylist from "./pages/JoinAsStylist";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdvertisePage from "./pages/AdvertisePage";
import StylistLoginPage from "./pages/StylistLoginPage";
import DashboardPage from "./pages/DashboardPage"
import EditProfilePage from "./pages/EditProfilePage";
import AdminReviewPage from "./pages/AdminReviewPage";
import ReviewsPage from "./pages/ReviewsPage";
import BillingPage from "./pages/BillingPage";
import LeaveVerifiedReviewPage from "./pages/LeaveVerifiedReviewPage";
import ReviewPage from "./pages/ReviewPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ScrollToTop from "./components/ScrollToTop";
import StylistSignupPage from "./pages/StylistSignupPage";


function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<PublicLayout />}>

          {/* ✅ HOME */}
          <Route index element={<HomePage />} />

          {/* ✅ ALL CHILD ROUTES — NO LEADING SLASH */}
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="join" element={<JoinAsStylist />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="advertise" element={<AdvertisePage />} />
          <Route path="login" element={<StylistLoginPage />} />
          <Route path="signup" element={<StylistSignupPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="edit-profile" element={<EditProfilePage />} />
          <Route path="admin/review" element={<AdminReviewPage />} />
          <Route path="admin-review" element={<AdminReviewPage />} />
          <Route path="dashboard/billing" element={<BillingPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="update-password" element={<UpdatePasswordPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="refund-policy" element={<RefundPolicyPage />} />
          
          <Route
            path="review/invite/:token"
            element={<LeaveVerifiedReviewPage />}
          />

        </Route>
      </Routes>
    </>
  );
}

export default App;