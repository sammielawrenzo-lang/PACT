import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Pact — Your word. Backed.",description:"Make clear agreements, work toward goals together, and keep every contribution accounted for.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
