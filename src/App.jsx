import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/join" element={<JoinAsStylist />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/login" element={<StylistLoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/admin/review" element={<AdminReviewPage />} />
        <Route path="/admin-review" element={<AdminReviewPage />} />
        <Route path="/dashboard/billing" element={<BillingPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
      </Route>
    </Routes>
  );
}

export default App;