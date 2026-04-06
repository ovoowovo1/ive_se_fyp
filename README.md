# Baby Item Donation Platform

This repository contains the working files for a Final Year Project focused on baby item donation. The system combines a mobile app, an admin web system, and supporting AI services to help users donate items, request needed supplies, communicate with each other, and manage platform content.



## Repository Structure

- [`fyp-android15-04-2024-main/`](./fyp-android15-04-2024-main/) contains the Android mobile application for personal and group users.
- [`react-fyp-main/`](./react-fyp-main/) contains the web admin system, backend services, and database resources.
- [`fyp-recommendation_system-main/`](./fyp-recommendation_system-main/) contains the recommendation logic used for personalized item suggestions.
- [`image-search-main/`](./image-search-main/) contains the image search and image classification experiments used to support item discovery.

## System Summary

- The mobile app supports personal users and group users who donate items, request supplies, browse recommendations, chat, and manage their profiles.
- The web system supports administrators who review users, moderate donation posts, manage announcements, inspect reports, and configure AI-assisted features.
- Supporting AI-related work in the project includes recommendation, image search, customer service, and content review.

## Web CI

- GitHub Actions runs the Web CI workflow on pull requests to `main` and on pushes to `main`.
- The workflow checks the web frontend in `react-fyp-main/client` with `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
- The workflow checks the web backend in `react-fyp-main/server` with `npm ci` and `npm test`.
- If a GitHub Actions run fails, inspect the `Client CI` or `Server CI` job log first to see which step broke.

## Mobile App Interface Catalog

The mobile app is designed around four main flows: account access, discovery, donation and request handling, and user communication.

### Authentication And Access

| Login | Register | Forgot Password |
| --- | --- | --- |
| <img src="docs/readme-images/report/image71.jpeg" alt="Mobile login page" width="190" /> | <img src="docs/readme-images/report/image72.jpeg" alt="Mobile registration page" width="190" /> | <img src="docs/readme-images/report/image73.png" alt="Mobile forgot password page" width="190" /> |

- `Log-in Page`: returning users sign in with user ID and password. The screen also links to account creation and password recovery.
- `User Register`: new users create an account by entering required personal details, confirmed email, and confirmed password.
- `Forget Password`: users reset their password through an email verification code and a new-password confirmation flow.

### Discovery, Search And Recommendation

| Home | Collect | Search |
| --- | --- | --- |
| <img src="docs/readme-images/report/image74.jpeg" alt="Mobile home page" width="190" /> | <img src="docs/readme-images/report/image75.jpeg" alt="Mobile collect page" width="190" /> | <img src="docs/readme-images/report/image76.jpeg" alt="Mobile search page" width="190" /> |

| For You | Nearby List | Nearby Map |
| --- | --- | --- |
| <img src="docs/readme-images/report/image77.png" alt="Mobile for you page" width="190" /> | <img src="docs/readme-images/report/image90.jpeg" alt="Nearby donation items list" width="190" /> | <img src="docs/readme-images/report/image91.jpeg" alt="Nearby donation items map view 1" width="190" /><br /><img src="docs/readme-images/report/image92.jpeg" alt="Nearby donation items map view 2" width="190" /> |

- `User Main Page`: the landing page after login. It includes text search, image search, favorites, unread-message access, a news carousel, and the bottom navigation bar.
- `Collect`: shows donation posts that the current user has already favorited.
- `Search Function`: lets users search by keywords and narrow results with extra filters while also showing search history.
- `For You Interface`: shows recommended donation items based on user preferences and browsing patterns.
- `Nearby Donation Item`: presents donation posts close to the user's location.
- `Nearby Donation Item (Map)`: uses Google Maps to visualize nearby donation posts geographically.

### Donation And Request Flow

| Donation Details | Report Page | Create Donation |
| --- | --- | --- |
| <img src="docs/readme-images/report/image78.png" alt="Donation details page view 1" width="190" /><br /><img src="docs/readme-images/report/image79.png" alt="Donation details page view 2" width="190" /> | <img src="docs/readme-images/report/image80.png" alt="Report page view 1" width="190" /><br /><img src="docs/readme-images/report/image81.png" alt="Report page view 2" width="190" /> | <img src="docs/readme-images/report/image82.jpeg" alt="Create donation page view 1" width="190" /><br /><img src="docs/readme-images/report/image83.jpeg" alt="Create donation page view 2" width="190" /> |

| Group Request Form | Request List | Request Detail |
| --- | --- | --- |
| <img src="docs/readme-images/report/image87.png" alt="Group donation request form" width="190" /> | <img src="docs/readme-images/report/image88.png" alt="Request list page" width="190" /> | <img src="docs/readme-images/report/image89.png" alt="Request detail page" width="190" /> |

| Rating And Comment |
| --- |
| <img src="docs/readme-images/report/image96.png" alt="Rating and comment page" width="190" /> |

- `Donation Data Page`: shows a donation post in detail, including item photos, donor ID, item type, condition, description, and exchange details.
- `Report Page`: lets users report another user's post by selecting a report type and entering details.
- `Create Donation Item`: allows users to upload item images and fill in name, type, condition, description, and exchange details. Optional fields can be expanded when needed.
- `Donation Item Request Form`: group users can request multiple items in one form by adding and saving more than one requested item.
- `Request List`: provides a quick overview of posted requests, including requester ID, requested items, quantity, and donation progress.
- `Request Detail Page`: displays full request information such as baby age, gender, item, size, urgency, reason, and note fields, and lets another user donate part of the requested quantity.
- `Rating And Comment`: appears after a donation or request is completed so users can submit a star rating and a written comment.

### Profile, Review And Communication

| Profile | Rating And Review | View The Comment |
| --- | --- | --- |
| <img src="docs/readme-images/report/image84.jpeg" alt="User profile page" width="190" /> | <img src="docs/readme-images/report/image85.png" alt="Rating and review page view 1" width="190" /><br /><img src="docs/readme-images/report/image86.png" alt="Rating and review page view 2" width="190" /> | <img src="docs/readme-images/report/image97.png" alt="View comments page view 1" width="190" /><br /><img src="docs/readme-images/report/image98.png" alt="View comments page view 2" width="190" /> |

| Chat List | Chat Room | AI Customer Service |
| --- | --- | --- |
| <img src="docs/readme-images/report/image93.png" alt="Chat list page" width="190" /> | <img src="docs/readme-images/report/image94.png" alt="Chat room page" width="190" /> | <img src="docs/readme-images/report/image95.jpeg" alt="AI customer service page" width="190" /> |

| Settings | Edit Profile | Contact Us |
| --- | --- | --- |
| <img src="docs/readme-images/report/image99.png" alt="Settings page" width="190" /> | <img src="docs/readme-images/report/image100.jpeg" alt="Edit profile page" width="190" /> | <img src="docs/readme-images/report/image101.png" alt="Contact us page" width="190" /> |

| Change Password | Activity |
| --- | --- |
| <img src="docs/readme-images/report/image102.png" alt="Change password page" width="190" /> | <img src="docs/readme-images/report/image103.png" alt="Activity page" width="190" /> |

- `Me (Profile) Interface`: shows the user's profile picture, display name, ID, rating, join time, and region.
- `Rating And Review`: shows donated items, comments received, and other review-related tabs for profile reputation.
- `View The Comment`: focuses on review history, including comments another user gave to the current user and comments the current user gave to others.
- `Chat List`: lists recent conversations and surfaces the latest message, message time, and related donation or request information.
- `Chat Function`: provides the in-app conversation room where users can exchange text, photos, and voice messages.
- `AI Customer Service`: lets users ask the chatbot questions directly and receive automated responses.
- `Setting`: links users to edit profile, AI chat, notification settings, and logout.
- `Edit Profile Interface`: allows profile information to be changed and saved.
- `Contact Us`: captures user issues and opens the device mail app when sending support feedback.
- `Change Password`: updates a password by collecting the current password and new password.
- `Activity`: shows notifications and system activity, including donation-related updates.

## Web Admin Interface Catalog

The web system uses a dashboard-style layout for moderation, administration, announcement publishing, analytics, and AI-assisted review.

### Authentication And User Administration

| Admin Login | User Data | Edit User |
| --- | --- | --- |
| <img src="docs/readme-images/report/image104.png" alt="Admin login page" width="300" /> | <img src="docs/readme-images/report/image105.png" alt="User data page view 1" width="300" /><br /><img src="docs/readme-images/report/image106.png" alt="User data page view 2" width="300" /> | <img src="docs/readme-images/report/image107.png" alt="Edit user page" width="300" /> |

| User Detail | Admin Data | Create Admin Account |
| --- | --- | --- |
| <img src="docs/readme-images/report/image108.png" alt="User detail page view 1" width="300" /><br /><img src="docs/readme-images/report/image109.png" alt="User detail page view 2" width="300" /> | <img src="docs/readme-images/report/image110.png" alt="Admin data page" width="300" /> | <img src="docs/readme-images/report/image111.png" alt="Create admin account page" width="300" /> |

| Admin Detail | Edit Admin |
| --- | --- |
| <img src="docs/readme-images/report/image112.png" alt="Admin detail page" width="300" /> | <img src="docs/readme-images/report/image113.png" alt="Edit admin page" width="300" /> |

- `Login Page`: administrators access the back-office system with account ID and password.
- `User Data Page`: displays regular users in a searchable table with actions for editing, viewing, and banning accounts.
- `Edit User Page`: lets administrators change personal information and profile images for a selected user.
- `User Detail Page`: shows deeper user information along with reviews and donated items.
- `Admin Data Page`: lists administrator accounts and provides entry to create new admin users.
- `Create Admin Account Page`: captures required details to add another administrator.
- `Admin Detail Page`: displays the selected administrator's details.
- `Edit Admin Page`: updates administrator information in a form tailored for admin accounts.

### Donation Review And Classification

| Donation Data | Donation Map | View Donated Item |
| --- | --- | --- |
| <img src="docs/readme-images/report/image114.png" alt="Donate item data page" width="300" /> | <img src="docs/readme-images/report/image115.png" alt="Donate item map page" width="300" /> | <img src="docs/readme-images/report/image116.png" alt="View donated item page" width="300" /> |

| Edit Donated Item | Donation Classification | Add New Classification |
| --- | --- | --- |
| <img src="docs/readme-images/report/image117.png" alt="Edit donated item page" width="300" /> | <img src="docs/readme-images/report/image118.png" alt="Donation classification page" width="300" /> | <img src="docs/readme-images/report/image119.png" alt="Add classification page view 1" width="300" /><br /><img src="docs/readme-images/report/image120.png" alt="Add classification page view 2" width="300" /> |

- `Donate Item Data Page`: lists donation posts with searchable columns and moderation actions such as edit, view, violation, and compliant.
- `Donate Item Data Page (Map)`: adds geographic visibility for donation-related records.
- `View Donated Item Page`: shows detailed donation content, a carousel of uploaded images, and donor information.
- `Edit Donated Item Page`: lets an administrator modify donation content and related fields.
- `Donation Classification Page`: displays all active donation categories.
- `Add New Classification Page`: supports the creation of categories and the addition or editing of category attributes.

### Announcements, Messaging And Reports

| Announcement Data | Announcement Details | Edit Announcement |
| --- | --- | --- |
| <img src="docs/readme-images/report/image121.png" alt="Announcement data page" width="300" /> | <img src="docs/readme-images/report/image122.png" alt="Announcement details page" width="300" /> | <img src="docs/readme-images/report/image123.png" alt="Edit announcement page" width="300" /> |

| Message Broadcast | Human Report | Log Out |
| --- | --- | --- |
| <img src="docs/readme-images/report/image124.png" alt="Message broadcast page view 1" width="300" /><br /><img src="docs/readme-images/report/image125.png" alt="Message broadcast page view 2" width="300" /> | <img src="docs/readme-images/report/image133.png" alt="Human report page view 1" width="300" /><br /><img src="docs/readme-images/report/image134.png" alt="Human report page view 2" width="300" /> | <img src="docs/readme-images/report/image136.png" alt="Logout prompt" width="300" /> |

- `Announcement Data Page`: lists platform announcements for review, editing, and further inspection.
- `Announcement Details Page`: shows the full content of a selected announcement.
- `Edit Announcement`: updates announcement content before or after publishing.
- `Message Broadcast`: sends messages or announcement-style communication to all users.
- `Human Report Page`: shows user-submitted reports so administrators can inspect report details and take action.
- `Log Out`: confirms administrator exit and returns the interface to the login page.

### Analytics And AI Operations

| Analysis | AI Text Detected | AI Image Detected |
| --- | --- | --- |
| <img src="docs/readme-images/report/image126.png" alt="Analysis page" width="300" /> | <img src="docs/readme-images/report/image127.png" alt="AI text detected page view 1" width="300" /><br /><img src="docs/readme-images/report/image128.png" alt="AI text detected page view 2" width="300" /> | <img src="docs/readme-images/report/image129.png" alt="AI image detected page view 1" width="300" /><br /><img src="docs/readme-images/report/image130.png" alt="AI image detected page view 2" width="300" /> |

| AI Text Setting | AI Image Setting | AI Customer Service |
| --- | --- | --- |
| <img src="docs/readme-images/report/image131.png" alt="AI text setting page" width="300" /> | <img src="docs/readme-images/report/image132.png" alt="AI image setting page" width="300" /> | <img src="docs/readme-images/report/image135.png" alt="Admin AI customer service page" width="300" /> |

- `Analysis Page`: visualizes project data such as registration counts and donation-category distribution.
- `AI Text Detected Page`: helps moderators inspect text flagged by AI and filter records by ID or keyword.
- `AI Image Detected Page`: helps moderators inspect flagged images and decide whether to remove, allow, or investigate them further.
- `AI Text Setting`: configures the sensitivity and behavior of text-monitoring rules.
- `AI Image Setting`: configures the sensitivity and behavior of image-monitoring rules.
- `AI Customer Service Page`: allows administrators to prepare answer templates and test the AI customer service flow.

## Design Direction From The Report

- The project uses a mobile-first approach for end users, with a bottom-navigation layout and image-led browsing.
- The admin system follows a dashboard pattern with lists, filters, moderation actions, and management forms.
- Search, recommendation, map browsing, chat, and reporting are treated as first-class flows in the user experience.
- AI is integrated as a support layer for customer service, recommendation, and moderation rather than as a standalone module.
