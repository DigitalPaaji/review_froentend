import "./globals.css";
import { Slide, ToastContainer } from "react-toastify";




export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
   
    >
      <body className="min-h-full flex flex-col">
        <ToastContainer
position="top-center"
autoClose={2500}
hideProgressBar
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
transition={Slide}
/>
        
        {children}</body>
    </html>
  );
}
