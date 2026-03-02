# 🍽️ Messmeal - Web Based Mess Management System

![Messmeal App Banner](https://via.placeholder.com/1200x400.png?text=Messmeal+-+Mess+Management+System)

**Messmeal** is a modern, responsive, and robust Mess Management System built to simplify the daily operations of bachelor messes, hostels, and shared living spaces. Say goodbye to messy notebooks and complex calculations. With Messmeal, tracking daily meals, managing expenses, and generating automated monthly reports is just a click away!

## ✨ Key Features

- **📊 Comprehensive Dashboard**: Get an intuitive bird's-eye view of total meals, total food costs, utility bills, current deposits, manager's cash-in-hand, and more.
- **📅 Daily Meal Tracking**: Easily update daily meal counts for each member with Bengali numerals support.
- **🛒 Expense Management**: Add daily bazaar and other expenses. Supports different funding sources ("Baki" from shop, personal funds, or shared fund).
- **💡 Fixed/Utility Bills**: Manage fixed category bills (e.g., Internet, Gas, Water) which are automatically divided equally among members.
- **💳 Deposit Tracking**: Keep a transparent record of when and how much money each member has deposited.
- **📈 Automated Monthly Summary**: At the end of the month, Messmeal automatically calculates the meal rate, per-head utility cost, total food cost, and individual member balances (Credit/Debit).
- **📝 PDF Export**: Instantly download professional PDF reports of the monthly summary to share with members.
- **⚙️ Admin Controls**: Role-based access. Admins can add/remove/edit members, modify bill categories, and manage sensitive data securely.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Backend & Database**: Firebase (Auth, Cloud Firestore)
- **PDF Generation**: jsPDF, jspdf-autotable
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yeatasim-cse9/Messmeal.git
   ```
2. Navigate into the project directory
   ```bash
   cd Messmeal
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Configure Firebase
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Add a web app and copy the configuration details.
   - Create a `.env` file in the root directory and add your Firebase credentials:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

### Running the App Locally

Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📱 Screenshots & UI

*(Add screenshots of your Dashboard, Summary Page, Settings here)*

## 🛡️ Authentication

The app uses Firebase Authentication. Users must log in to view data, and only registered `Admin` users have write-access to core settings and calculations.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
