import './globals.css';
import { ConfigProvider } from 'antd';
import idID from 'antd/locale/id_ID';
import LayoutAntd from '@/components/LayoutAntd';
import StyledComponentsRegistry from '@/components/AntdRegistry';

// Metadata untuk SEO (Opsional tapi direkomendasikan)
export const metadata = {
  title: 'Aplikasi Dasbor BRD',
  description: 'Manajemen Dokumen Kebutuhan Bisnis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Menambahkan suppressHydrationWarning untuk mengatasi error mismatch
    // yang disebabkan oleh ekstensi browser atau skrip pihak ketiga.
    <html lang="id" suppressHydrationWarning>
      <body>
        <StyledComponentsRegistry>
          {/* ConfigProvider adalah komponen Ant Design untuk konfigurasi global,
            seperti tema, bahasa (lokalisasi), dll.
          */}
          <ConfigProvider
            locale={idID} // Mengatur bahasa Ant Design ke Bahasa Indonesia
            theme={{
              // Contoh kustomisasi tema global
              token: {
                colorPrimary: '#00b96b', // Warna utama
                borderRadius: 6,      // Radius sudut untuk komponen
              },
              components: {
                Button: {
                  colorPrimary: '#00b96b', // Warna tombol primer
                },
              },
            }}
          >
            <LayoutAntd>
              {children}
            </LayoutAntd>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
