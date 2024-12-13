import { Metadata } from 'next';
import { DndWrapper } from './components/DndWrapper';
import { Providers } from "./components/Providers";
import "./globals.css";


export const metadata: Metadata = {
  title: "ai agent assistant at amplitude venture",
  description: "ai agent assistant at amplitude venture",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DndWrapper>
          {children}
        </DndWrapper>
      </body>
    </html>
  );
}
