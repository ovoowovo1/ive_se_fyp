import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../UI/ProtectedRoute';

const AdminCreate = lazy(() => import('../Admin/AdminCreate'));
const AdminEdit = lazy(() => import('../Admin/AdminEdit'));
const AdminList = lazy(() => import('../Admin/AdminList'));
const ViewAdminDetail = lazy(() => import('../Admin/ViewAdminDetail'));
const AIChat = lazy(() => import('../AIChat/AIcs'));
const AnalysisData = lazy(() => import('../Analysis/AnalysisMain'));
const AnnouncementEdit = lazy(() => import('../Announcement/Edit'));
const AnnouncementHistory = lazy(() => import('../Announcement/History'));
const AnnouncementPublish = lazy(() => import('../Announcement/Publish'));
const AnnouncementView = lazy(() => import('../Announcement/ViewAN'));
const DonatedClassification = lazy(() => import('../Donate/DonatedClassification'));
const DonatedClassificationAdd = lazy(() => import('../Donate/DonatedClassificationAdd'));
const DonatedClassificationEdit = lazy(() => import('../Donate/DonatedClassificationEdit'));
const DonatedItemList = lazy(() => import('../Donate/DonatedItemList'));
const EditDonatedItem = lazy(() => import('../Donate/EditDonatedItem'));
const MapShowDonation = lazy(() => import('../Donate/MapShowDonation'));
const ViewDonatedItem = lazy(() => import('../Donate/ViewDonatedItem'));
const GroupUserList = lazy(() => import('../GroupUser/GroupUserList'));
const NewLogin = lazy(() => import('../Login/Login'));
const NewUI = lazy(() => import('../UI/NewUI'));
const UserCreate = lazy(() => import('../User/UserCreate'));
const UserDonatedItem = lazy(() => import('../User/UserDonatedItem'));
const UserEdit = lazy(() => import('../User/UserEdit'));
const UserList2 = lazy(() => import('../User/UserList2'));
const UserRating = lazy(() => import('../User/UserRating'));
const ViewUserDetail = lazy(() => import('../User/ViewUserDetail'));
const AIImageDetectedList = lazy(() => import('../VIolation/AIImageDetectedList'));
const AlDetectedList = lazy(() => import('../VIolation/AlDetectedList'));
const DectectedSetting = lazy(() => import('../VIolation/DectectedSetting'));
const DectectedTextSetting = lazy(() => import('../VIolation/DectectedTextSetting'));
const HumanReport = lazy(() => import('../VIolation/HumanReport'));
const ViewHumanReport = lazy(() => import('../VIolation/ViewHumanReport'));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<NewLogin />} />
          <Route
            path="/admin/:Login_id/*"
            element={
              <ProtectedRoute>
                <NewUI />
              </ProtectedRoute>
            }
          >
            <Route path="alluserdata" element={<UserList2 />} />
            <Route path=":user_id/user/view/*" element={<ViewUserDetail />}>
              <Route path="rating" element={<UserRating />} />
              <Route path="donateditem" element={<UserDonatedItem />} />
            </Route>
            <Route path="allgroupuserdata" element={<GroupUserList />} />
            <Route path=":user_id/user/edit" element={<UserEdit />} />
            <Route path="alladmindata" element={<AdminList />} />
            <Route path="createadmin" element={<AdminCreate />} />
            <Route path=":admin_id/admindetail" element={<ViewAdminDetail />} />
            <Route path=":admin_id/adminedit" element={<AdminEdit />} />
            <Route path=":donateditem_id/donatededit" element={<EditDonatedItem />} />
            <Route path=":donateditem_id/donatedetail" element={<ViewDonatedItem />} />
            <Route path=":alldonateditem" element={<DonatedItemList />} />
            <Route path="donationClassification" element={<DonatedClassification />} />
            <Route
              path="donationClassification/:classificationID/edit"
              element={<DonatedClassificationEdit />}
            />
            <Route path="donationClassification/add" element={<DonatedClassificationAdd />} />
            <Route path="mapShowDonation" element={<MapShowDonation />} />
            <Route path="announcement/edit/:alldonateditemID" element={<AnnouncementEdit />} />
            <Route path="publishannouncement" element={<AnnouncementPublish />} />
            <Route path="announcementhistory" element={<AnnouncementHistory />} />
            <Route path="announcement/view/:alldonateditemID" element={<AnnouncementView />} />
            <Route path="AIDetected" element={<AlDetectedList />} />
            <Route path="AIImageDetected" element={<AIImageDetectedList />} />
            <Route path="AIDetectedsetting" element={<DectectedSetting />} />
            <Route path="AITextSetting" element={<DectectedTextSetting />} />
            <Route path="HumanReported" element={<HumanReport />} />
            <Route path="HumanReported/:humanReportID/view" element={<ViewHumanReport />} />
            <Route path="analysis" element={<AnalysisData />} />
            <Route path="create" element={<UserCreate />} />
            <Route path="AIChat" element={<AIChat />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
