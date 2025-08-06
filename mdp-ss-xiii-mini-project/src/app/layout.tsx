import './globals.css';
import LayoutAntd from '@/components/LayoutAntd';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutAntd>
          {children}
        </LayoutAntd>
      </body>
    </html>
  );
}