import './globals.css';
import LayoutAntd from '@/components/LayoutAntd';
import StyledComponentsRegistry from '@/components/AntdRegistry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Membungkus LayoutAntd dan children dengan StyledComponentsRegistry */}
        <StyledComponentsRegistry>
          <LayoutAntd>
            {children}
          </LayoutAntd>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
